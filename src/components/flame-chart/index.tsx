import {FlameChart, FlameChartPlugin, TimeGridPlugin} from 'flame-chart-js';
import {useCallback, useEffect, useRef, useState} from 'react';
import flameGraphAdaptor from '../../core/flame-graph-adaptor';
import {MyPlugin} from '../../plugins/MyPlugin';
import EditorTest from '../../test-data/editorTest.json'
import PauseFunc from '../../test-data/pauseFunc.json'
import useResizeObserver from 'use-resize-observer';
import ChartDetail from '../chart-detail';

const FlameGraph: React.FC = () => {
    const chartRef = useRef<any>();  //拿到canvas容器
    const boxRef = useRef<any>(); // 拿到container容器
    const [selectInfo, setSelectInfo] = useState(null)

    useResizeObserver({
        ref: boxRef,
        onResize: ({width = 0, height = 0}) => chartRef.current?.resize(width, height - 3),
    });


    const initialize = useCallback(() => {
        if (chartRef.current && boxRef.current) {
            const {width = 0, height = 0} = boxRef.current.getBoundingClientRect();

            chartRef.current.width = width;
            chartRef.current.height = height - 3;

            const chartData = flameGraphAdaptor(EditorTest)
            const canvas = chartRef.current
            //canvas.width = 800;
            //canvas.height = 800;

            chartRef.current = new FlameChart({
                canvas, // mandatory
                //timeseries: [/* ... */],
                timeframeTimeseries: [/* ... */],
                data: [
                    chartData as any,
                ],
                settings: {
                    options: {
                        // tooltip: (node, renderEngine, position) => {
                        //     console.log(node, '----', position);
                        //     if (!node || !position) {
                        //         return
                        //     }
                        //     const {x, y} = position

                        //     renderEngine.renderTooltipFromData(
                        //         [{ text: '111' }, { text: '111' }, { text: st }],
                        //         renderEngine.getGlobalMouse()
                        //     );                        //console.log('hover', args);
                        //     /*...*/
                        // }, // see section "Custom Tooltip" below
                        timeUnits: 'ms',
                    },
                    //styles: customStyles, // see section "Styles" below
                },
            });
            chartRef.current.on('select', (element: any) => {
                const {node} = element || {}
                if (node) {
                    const {source} = node
                    if (source) {
                        setSelectInfo(source)
                    }
                }
            });

            // flameChart.on('resize', (...args) => {
            //     console.log('...');
            // });
        }
    }, []);

    useEffect(() => {
        initialize()
    }, [])

    return <>
        <div ref={boxRef} className='boxContainer'>
            <canvas ref={chartRef} className="chart"></canvas>
        </div>
        <ChartDetail data={selectInfo} />
    </>
}

export default FlameGraph