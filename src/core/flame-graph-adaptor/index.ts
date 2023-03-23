import {IJsSelfProfilingJSON} from '../../types/js-self-profiling';
import {transformSamplesToFlameJsAdaptor} from './transformStackToFlameChart';
import {transfromSamplesToStack} from './transfromSamplesToStack';

export default function flameGraphAdaptor(sourceData: IJsSelfProfilingJSON){
    sourceData = JSON.parse(JSON.stringify(sourceData))
    const {samples: sourceDataWithStack} = transfromSamplesToStack(sourceData)
    const ans = transformSamplesToFlameJsAdaptor(sourceDataWithStack)
    return ans
}