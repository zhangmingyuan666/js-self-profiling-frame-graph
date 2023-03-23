import {IJsSelfProfilingJSON} from '../../types/js-self-profiling';
import {transformSamplesToFlameJsAdaptor} from './transformStackToFlameChart';
import {transfromSamplesToStack} from './transfromSamplesToStack';

export default function flameGraphAdaptor(sourceData: IJsSelfProfilingJSON){
    // 做一层深拷贝，因为没有复杂数据，所以直接用这个方法进行
    sourceData = JSON.parse(JSON.stringify(sourceData))
    const {samples: sourceDataWithStack} = transfromSamplesToStack(sourceData)
    const ans = transformSamplesToFlameJsAdaptor(sourceDataWithStack)
    return ans
}