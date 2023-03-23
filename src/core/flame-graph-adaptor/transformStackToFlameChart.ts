import {IFlameGraphData, IFlameGraphDataRoot} from '../../types/flame-graph';
import {ISample} from '../../types/js-self-profiling';

export function transformSamplesToFlameJsAdaptor(samples: ISample[]) {
    const duplicateSamples:ISample[][] = []
    const n = samples.length;
    duplicateSamplesAction(0, n, samples, duplicateSamples)

    const ans: IFlameGraphDataRoot = {
        children: []
    }

    for (let i = 0; i < duplicateSamples.length; i++) {
        // 此部分区间的samples，我们需要单独进行组装
        const partialSamples = duplicateSamples[i];
        const childrenData: IFlameGraphData = {}
        handleChildrenOfEachLevel(0, partialSamples.length, partialSamples, childrenData, 0, samples)
        if(childrenData.children){
            ans.children!.push(childrenData.children[0]);
        }
    }

    return ans
}

// i: 起始点, n：结束点：区间:[i, j) samples为样本总量
function duplicateSamplesAction(i: number, n: number, samples: ISample[], ans: ISample[][], currentStackIndex: number = 0) {
    while (i < n) {
        const currentSample = samples[i]
        const currentStack = currentSample.stack

        if (currentStack) {
            let partial: ISample[] = []
            const currentStackName = currentStack[currentStackIndex].name
            for (let j = i; j < n; j++) {
                const currentTargetSample = samples[j];
                const currentTargetSampleStack = currentTargetSample.stack
                if (!currentTargetSampleStack || currentTargetSampleStack[currentStackIndex].name !== currentStackName) {
                    i = j
                    break
                }
                // 将当前栈和当前栈的对应信息放入当前区间
                partial.push(currentTargetSample)

                if (j === n - 1) {
                    // 此时j已经到了最后一个元素，仍然可以通过上方监测
                    i = j;
                    break;
                }
            }
            ans.push(partial)
            i++
        } else {
            i++
        }
    }
}

// i: 起始点, n：结束点：区间:[i, j) samples为本区间样本总量
function handleChildrenOfEachLevel(i: number, n: number, samples: ISample[], data: IFlameGraphData, currentStackIndex = 0, allSamples: ISample[]) {
    while (i < n) {
        const currentSample = samples[i]
        const currentStack = currentSample.stack!

        // 如果i碰到了空执行栈，那么就可以进行推进
        if (!currentStack[currentStackIndex]) {
            i++
            continue;
        }

        const currentStackName = currentStack[currentStackIndex].name
        for (let j = i; j < n; j++) {
            const currentTargetSample = samples[j];
            const currentTargetSampleStack = currentTargetSample.stack!
            // 如果j出现了空，那么进行dfs
            // 此时的name出现了不一致/或者副的出现了空执行栈，那么可以先进行dfs再进行后续的迭代
            if (!currentTargetSampleStack[currentStackIndex] || currentTargetSampleStack[currentStackIndex].name !== currentStackName) {
                // i = j
                // 进行一层dfs
                // data.name = currentStackName
                const {timestamp: startTime} = samples[i];
                const {timestamp: endTime} = allSamples[samples[j - 1].index! + 1]
                const diffTime = endTime - startTime
                data.children = data.children || []

                const obj = {
                    name: currentStackName,
                    start: startTime,
                    duration: diffTime,
                    children: []
                }

                data.children.push(obj)
                // console.log('碰到了不一致的值，需要记录------', currentStackName);
                // console.log('parent', data.children.length);
                // console.log('层数', currentStackIndex);
                // console.log('---------------⬆️');
                handleChildrenOfEachLevel(i, j, samples, obj, currentStackIndex + 1, allSamples)
                i = j;
                // if (currentStackIndex === 1 && i === 5) {
                //     debugger;
                // }
                continue
            }

            if (j === n - 1) {
                // 此时j已经到了最后一个元素，仍然可以通过上方监测
                // 此时也要和上方一样的处理:dfs
                // i = j;
                // 进行一层dfs
                data.children = data.children || []
                const {timestamp: startTime} = samples[i];
                const {timestamp: endTime} = allSamples[samples[j].index! + 1]
                const diffTime = endTime - startTime

                const obj = {
                    name: currentStackName,
                    start: startTime,
                    duration: diffTime,
                    children: []
                }
                data.children.push(obj)
                // console.log('parent', data.children.length);
                // console.log('层数', currentStackIndex);
                // console.log('到了最后一个需要记录----', currentStackName);
                // console.log('---------------⬆️');

                handleChildrenOfEachLevel(i, j + 1, samples, obj, currentStackIndex + 1, allSamples)
                i = j;
                continue;
            }
        }

        i++
    }
}
