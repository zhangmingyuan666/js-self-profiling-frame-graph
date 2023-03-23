import {FlameChart} from 'flame-chart-js';
import {useEffect, useRef, useState} from 'react';
import flameGraphAdaptor from '../../core/flame-graph-adaptor';
import EditorTest from '../../test-data/editorTest.json'
const FlameGraph: React.FC = () => {
    const chartRef = useRef<any>();  //拿到DOM容器
    useEffect(() => {
        const chartData = flameGraphAdaptor(EditorTest)
        const canvas = chartRef.current
        canvas.width = 1600;
        canvas.height = 800;

        const flameChart = new FlameChart({
            canvas, // mandatory
            data: [
                chartData as any
            ],
            // marks: [
            //     {
            //         shortName: 'DCL',
            //         fullName: 'DOMContentLoaded',
            //         timestamp: 500,
            //     },
            // ],
            timeseries: [/* ... */],
            timeframeTimeseries: [/* ... */],
            // colors: {
            //     task: '#ccc',
            //     'sub-task': '#000000',
            // },
            settings: {
                options: {
                    tooltip: () => {
                        /*...*/
                    }, // see section "Custom Tooltip" below
                    timeUnits: 'ms',
                },
                // styles: customStyles, // see section "Styles" below
            },
        });

        flameChart.on('select', (node, type) => {
            /*...*/
        });
    }, [])

    return <canvas ref={chartRef} className="chart"></canvas>
}

export default FlameGraph