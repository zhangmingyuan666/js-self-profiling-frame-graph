import {IFrameRecordData, IJsSelfProfilingJSON, ISample} from '../../types/js-self-profiling';

// 此方法将samples转化为stack结构
export function transfromSamplesToStack(sourceData: IJsSelfProfilingJSON) {
    const {
        samples, // samples[i]函数执行时间下标，升序
        resources,  // resources[i]资源uri
        frames, // frames[i] i下表下的函数对象，包含函数名和函数的line和col
        stacks // stacks[i] 调用栈记录
    } = sourceData

    const n = samples.length

    for (let i = 0; i < n; i++) {
        const {stackId, timestamp} = samples[i]
        samples[i].timestamp = Number(timestamp.toFixed(3))
        if (stackId) {
            // 代表这一部分有函数执行栈
            handleStack(stackId, samples[i], sourceData, i)
        }
    }

    // 记录一个边界case
    const lastTimeStamp: ISample = {
        timestamp: sourceData.samples[sourceData.samples.length - 1].timestamp + 10
    }

    sourceData.samples.push(lastTimeStamp)

    return sourceData
}

function handleStack(stackId: number, sample: ISample, sourceData: IJsSelfProfilingJSON, i: number) {
    // frameId是当前stack中frame的下标；parentId是父亲的stack的下标
    const {frameId, parentId} = sourceData.stacks[stackId]
    const frame = sourceData.frames[frameId]; // 当前frame
    const {resourceId} = frame
    const resource = resourceId ? sourceData.resources[resourceId] : ""; // 当前地址

    const recordData: IFrameRecordData = {
        ...frame,
        name: frame.name || '(anonymous)',
        resourceURI: resource,
    }

    sample.index = i
    sample.stack = sample.stack || [];
    sample.stack.unshift(recordData);

    // 递归处理
    if (parentId) {
        handleStack(parentId, sample, sourceData, i)
    }
}

