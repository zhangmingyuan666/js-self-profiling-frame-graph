# js-self-profiling-frame-chart
A frame chart which display js-self-profiling json data

![img](https://img.shields.io/badge/npm-6.14.11-green.svg)
![img](https://img.shields.io/badge/node-14.16.0-green.svg)

# 如何使用
1. `npm i`
2. `npm start`

# 如何加载数据？

需要是js-self-profiling的数据

将它在`src/components/flame-chart.ts`中引入即可

## Example

```tsx
import EditorTest from '../../test-data/editorTest.json'

const chartData = flameGraphAdaptor(EditorTest)
```

