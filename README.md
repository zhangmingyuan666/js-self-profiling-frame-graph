# js-self-profiling-frame-chart

A frame chart which display js-self-profiling json data

用于将`js-self-profiling` 导出的`json`数据转化为火焰图

![img](https://img.shields.io/badge/npm-6.14.11-green.svg)
![img](https://img.shields.io/badge/node-14.16.0-green.svg)

# 效果概览

<a href="https://js-self-profiling-frame-graph.vercel.app/" target="_blank">查看预览效果(vercel)</a>

您可以上传您的js-self-profiling json数据到如上vercel站点中

<img src="https://cdn.nlark.com/yuque/0/2023/png/27170584/1688204507914-11928073-8d46-4fad-be02-e1a5cbe0a685.png?x-oss-process=image%2Fresize%2Cw_2024%2Climit_0" />

# 如何使用

1. `npm i`
2. `npm start`

# 如何加载数据？

需要导入js-self-profiling的数据

将它在`src/components/flame-chart.ts`中引入，或者拖拽放入主项目即可即可 

## Example

```tsx
import EditorTest from '../../test-data/editorTest.json'

const chartData = flameGraphAdaptor(EditorTest)
```

## 如何获取到`js-self-profiling` 数据

### 让Chrome有使用`js-self-profiling`的权限

对于新兴API，在Chrome中默认禁止使用，而如果您想要开启这个功能，请在你项目的html响应的请求头中添加

`Document-Policy: js-profiling`

如下静态代码即最小demo，您可以

```js
// 当前文件路径dirname
const folderPath = path.resolve(__dirname, "./static");

const server = http.createServer((req, res) => {
  // 收到 127.0.0.1:3000/index.html 我们返回index.html资源
  try {
    // 获取路径后缀 index.html
    const info = url.parse(req.url);

    // 文件夹路径 + 需要获取的资源路径
    const filePath = path.resolve(folderPath, "./" + info.path);

    // 流读取
    const fileStream = fs.createReadStream(filePath);

    // 设置响应头，以让chorme允许您采用js-self-profiling规范
    res.setHeader('Document-Policy', 'js-profiling')
    fileStream.pipe(res);
  } catch (err) {
    console.log('err');
  }
});
```

总而言之，只要想办法让您的项目中的html文件的网络响应具有此响应头，就可以使用`js-self-profiling` API

### 如何获取`js-self-profiling`数据

```tsx
// start
const profiler = new Profiler({ sampleInterval: 10, maxBufferSize: 10000 });

setTimeout(async () => {
    // select
    const trace = await profiler.stop();
    const traceJson = JSON.stringify(trace);
    console.log(traceJson);
}, 5000);
```

此时`traceJson` 数据就是我们期望的`js-self-profiling`数据

将`traceJson`数据放入此项目中，即可实现基本的数据分析

# 如果出现分析错误或存疑

联系 Email：`2369558390@qq.com`

