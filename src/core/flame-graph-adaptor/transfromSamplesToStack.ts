/**
 * @author zhangmingyuan01
 * @description 提供将js-self-profiling的json数据转换为有stack属性的调用栈数据结构的数据结构
 *      stack: [{fun1}, {fun2}, {fun3}] 呈现出调用栈
 */

import {getNumberWithToFixed} from '../../utils/samples';
import {IFrameRecordData, IJsSelfProfilingJSON, ISample} from '../../types/js-self-profiling';

/**
 * @description 入口函数，用于进行上述转换
 * @param sourceData js-self-profiling 导出的数据
 * @returns sourceData中的samples数组中，如果存在函数调用栈，那么都被添加上当前时间戳对应的所有函数调用栈(key: stack)
 */
export function transfromSamplesToStack(sourceData: IJsSelfProfilingJSON) {
    const {
        samples, // samples[i]函数执行时间下标，升序
        // resources, // resources[i]资源uri
        // frames, // frames[i] i下表下的函数对象，包含函数名和函数的line和col
        // stacks, // stacks[i] 调用栈记录
    } = sourceData;

    // 遍历samples，为存在stackId的sample添加stack数据结构
    samples.forEach((sample: ISample, i: number) => {
        const {stackId, timestamp} = sample;
        sample.timestamp = getNumberWithToFixed(timestamp);

        // 只有有函数调用栈的才需要被处理
        if (stackId) {
            handleStack(stackId, sample, sourceData, i);
        }
    });

    // 因为需要把绝对时间转换为相对时间，所以必须加入一个虚拟的时间作为结尾，这个时间为10ms
    addLastSample(samples);

    return sourceData;
}

/**
 * @description 用于为每个samples依据自己的顶层stackId而计算出所有的调用栈，收集在stack数据结构里（dfs）
 * @param stackId 标识当前调用栈顶的id
 * @param sample js-self-profiling的samples数据，此时已经有了
 * @param sourceData js-self-profiling的全部数据
 * @param i 标识当前stack中的是在大samples哪个index中，日后方便查询，进行相对时间的计算(持续时间: t2-t1)
 */
function handleStack(stackId: number, sample: ISample, sourceData: IJsSelfProfilingJSON, i: number) {
    // frameId是当前stack中frame的下标；parentId是父亲的stack的下标
    const {frameId, parentId} = sourceData.stacks[stackId];
    // 当前栈顶函数对应的frame
    const frame = sourceData.frames[frameId];

    // 标识当前函数调用栈对应的资源
    let {resourceId} = frame;
    resourceId = resourceId ?? -1;
    const resource = resourceId >= 0 ? sourceData.resources[resourceId] : ''; // 当前地址

    // 记录当前数据，如果没有函数名视为是匿名函数
    const recordData: IFrameRecordData = {
        ...frame,
        name: frame.name || '(anonymous)',
        resourceURI: resource,
    };

    // 为什么需要给他index? 后续需要将绝对时间转化为相对时间的计算，必要情况下需要进行index之间的时间记录
    sample.index = i;

    // 把每个函数调用栈中函数的对应信息记录在stack数组里
    sample.stack = sample.stack || [];
    sample.stack.unshift(recordData);

    // 如果有父调用栈，递归处理
    if (parentId) {
        handleStack(parentId, sample, sourceData, i);
    }
}

/**
 * @description 因为需要把绝对时间转换为相对时间，所以必须加入一个虚拟的时间作为结尾，这个时间为10ms
 * @param samples
 */
function addLastSample(samples: ISample[]) {
    const lastSample = samples[samples.length - 1];
    const lastTimeStamp: ISample = {
        // 为最后一个
        timestamp: lastSample.timestamp + 10,
    };

    samples.push(lastTimeStamp);
}

