/**
 * @author zhangmingyuan01
 * @description 将已经带着stack的samples们转化成火焰图的数据结构
 *      关键 -> stack的纵向结构转化为横向的数据结构
 */

import {getNumberWithToFixed} from '../../utils/samples';
import {IFlameGraphData, IFlameGraphDataRoot} from '../../types/flame-graph';
import {ISample, ISampleAfterTransformStack} from '../../types/js-self-profiling';

/**
 * @description 入口函数，主要做了两件事情
 *      1. 明确有持续函数调用的区间，分而治之（快慢指针）
 *      2. 将有持续函数调用的区间通过处理（回溯算法+快慢指针），将纵向的stack数据结构转化为横向的火焰图数据结构
 * @param samples 已经有stack数据结构的samples
 * @returns 返回横向的火焰图数据结构
 */
export function transformSamplesToFlameJsAdaptor(samples: ISample[]) {
    const n = samples.length;
    const duplicateSamples: ISampleAfterTransformStack[][] = [];

    // 1. 明确有持续函数调用的区间，分而治之（快慢指针）
    duplicateSamplesAction(0, n, samples, duplicateSamples);

    const ans: IFlameGraphDataRoot = {
        children: [],
    };

    for (let i = 0; i < duplicateSamples.length; i++) {
        // 此部分区间的samples，我们需要单独进行组装
        const partialSamples = duplicateSamples[i];
        const childrenData: IFlameGraphData = {};
        handleChildrenOfEachLevel(0, partialSamples.length, partialSamples, childrenData, 0, samples);
        if (childrenData.children) {
            ans.children!.push(childrenData.children[0]);
        }
    }

    return ans;
}

/**
 *
 * @param slow 慢指针
 * @param n 总样本量
 * @param samples 待有stack的samples
 * @param ans 收集结果的数组 ISampleAfterTransformStack[][] 此数据结构的每个元素都具有stack 可以确定有调用栈持续
 * @param currentStackIndex 当前深度，由于我们只有对于函数是否存在的需求，所以只需要知道有没有stack就行，我们拿0即可（代表第一层）
 */
function duplicateSamplesAction(slow: number, n: number,
    samples: ISample[], ans: ISampleAfterTransformStack[][], currentStackIndex: number = 0) {
    while (slow < n) {
        // 获取当前慢指针所对应的stack
        const currentSample = samples[slow];
        const currentStack = currentSample.stack;

        // 如果当前函数没有调用栈，那么不需要进行标记
        if (!currentStack) {
            slow++;
            continue;
        }

        // 获取当前stack的 currentStackIndex:深度 的函数名
        const currentStackName = currentStack[currentStackIndex].name;

        // 收集连续区间的数组
        const partialStack: ISampleAfterTransformStack[] = [];

        for (let fast = slow; fast < n; fast++) {
            // 获取快指针所对应的sample
            const currentTargetSample = samples[fast];
            const {stack: currentTargetSampleStack} = currentTargetSample;

            /**
             * 如果快指针所对应的samples出现以下情况
             *   1. 没有stack了
             *   2. 函数名改变了（或者是其他指标改变了）
             * 反正可以证明当前函数终止
             * 那么此时说明，当前底层函数调用阻塞（火焰图的底层调用栈）结束
             *   1. 终止本次循环
             *   2. 把慢指针放到快指针的位置，如下同理
            */
            if (!currentTargetSampleStack ||
                currentTargetSampleStack[currentStackIndex].name !== currentStackName) {
                slow = fast;
                break;
            }

            // 如果可以走到这一步，那么可以证明当前这个区间是有函数执行区间的，所以可以用 ISampleAfterTransformStack 类型进行标识
            // 将当前栈和当前栈的对应信息放入当前区间
            partialStack.push(currentTargetSample as ISampleAfterTransformStack);

            // 此时fast快指针已经到了最后一个元素，查看是否可以通过下方检测
            if (fast === n - 1) {
                slow = fast;
                break;
            }
        }

        // 收集当前区间，并放入ans中，然后继续计算下一个区间
        ans.push(partialStack);
        slow++;
    }
}

/**
 * @description 核心函数：将有函数调用栈的samples区间转化为火焰图的数据结构
 *      首先进行本层遍历，直到出现函数名改变或者空调用栈，此时进行DFS收集数据
 *      随后收集至没有子调用栈了，回到本层继续遍历，继续手机
 * @param slow 慢指针
 * @param n 当前区间的总长度
 * @param samples 具有stack的所有samples
 * @param flameResultData 当前这一层的数据结构（最为最终数据结构的一个子数据结构）
 * @param depth 当前深度
 * @param allSamples 所有samples
 */
function handleChildrenOfEachLevel(slow: number, n: number, samples: ISampleAfterTransformStack[],
    flameResultData: IFlameGraphData, depth = 0, allSamples: ISample[]
) {
    while (slow < n) {
        // 此时慢指针对应的的sample一定有stack，但是stack数组的currentStackIndex深度中不保证有调用栈
        let currentSample = samples[slow];
        let currentStack = currentSample.stack;

        // 如果currentStackIndex深度下没有调用栈了，那么推进慢指针，拦截处理
        if (!currentStack[depth]) {
            slow++;
            continue;
        }

        // 如果currentStackIndex深度下没有调用栈了，那么推进慢指针，拦截处理
        for (let fast = slow; fast < n; fast++) {
            // 推进当前快指针
            const currentTargetSample = samples[fast];
            const currentTargetSampleStack = currentTargetSample.stack;
            // 如果j出现了空，那么进行dfs
            /**
             * 如果快指针所对应的samples出现以下情况
             *   1. 没有stack了
             *   2. 函数名改变了（或者是其他指标改变了）
             * 反正可以证明当前函数终止
             * 那么此时说明，当前底层函数调用阻塞（火焰图的底层调用栈）结束
             *   1. 终止本次循环
             *   2. 把慢指针放到快指针的位置，如下同理
            */
            if (!currentTargetSampleStack[depth]
                || currentTargetSampleStack[depth].name !== currentSample.stack[depth].name) {

                // 记录当前区间的数据到最终数据结构里
                const currentFlameResultData = handleCurrentStackToFlameChildren(
                    currentSample,
                    samples[fast - 1],
                    allSamples,
                    depth,
                    flameResultData
                );

                // 递归继续处理子调用栈
                handleChildrenOfEachLevel(slow, fast,
                    samples, currentFlameResultData, depth + 1, allSamples);

                // DFS的完后回到本层，需要保持本层的状态，因此需要将慢指针继续推进至有调用栈，如下
                slow = fast;
                while (slow < n && !samples[slow].stack[depth]) {
                    slow++;
                }

                currentSample = samples[slow] || {};
                currentStack = currentSample.stack || [];
                fast = slow;
                continue;
            }

            if (fast === n - 1) {
                // 此时j已经到了最后一个元素，仍然可以通过上方监测
                // 记录当前区间的数据到最终数据结构里
                const currentFlameResultData = handleCurrentStackToFlameChildren(
                    currentSample,
                    samples[fast],
                    allSamples,
                    depth,
                    flameResultData
                );

                // 递归继续处理子调用栈
                handleChildrenOfEachLevel(slow, fast + 1,
                    samples, currentFlameResultData, depth + 1, allSamples);

                slow = fast;
                continue;
            }
        }

        slow++;
    }
}

/**
 * @description 用于计算相对时间（t2-t1），封装当前调用栈信息，放入flameResultData容器中，作为children(子火焰图)
 * @param startSample 起始sample
 * @param endSample 结束sample
 * @param allSamples 所有samples
 * @param depth 当前深度
 * @param flameResultData 本层火焰图数据结构容器
 * @returns
 */
function handleCurrentStackToFlameChildren(
    startSample: ISampleAfterTransformStack,
    endSample: ISampleAfterTransformStack,
    allSamples: ISample[],
    depth: number,
    flameResultData: IFlameGraphData
) {

    flameResultData.children = flameResultData.children || [];
    // 获取前后时间戳
    const {timestamp: startTime} = startSample;
    const {timestamp: endTime} = allSamples[endSample.index + 1];
    const diffTime = getNumberWithToFixed(endTime - startTime);

    // 获取当前stack的深度中，到底函数的信息
    const currentFunctionInfo = startSample.stack[depth];
    const {name} = currentFunctionInfo;

    const remarkData = {
        name,
        info: currentFunctionInfo,
        type: name,
        start: startTime,
        duration: diffTime,
        children: [],
    };
    flameResultData.children.push(remarkData);

    return remarkData;
}
