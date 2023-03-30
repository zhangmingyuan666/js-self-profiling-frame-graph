import {FlameChart, FlameChartContainer, FlameChartPlugin, TimeGridPlugin} from 'flame-chart-js';
import {useCallback, useEffect, useRef, useState} from 'react';
import flameGraphAdaptor from '../../core/flame-graph-adaptor';
import {MyPlugin} from '../../plugins/MyPlugin';
import EditorTest from '../../test-data/editorTest.json'
import PauseFunc from '../../test-data/pauseFunc.json'
import useResizeObserver from 'use-resize-observer';
import ChartDetail from '../chart-detail';
import styled from 'styled-components'
import {Divider, message} from 'antd'
import DragBar from '../drag-bar';

interface IFlameGraph {
    currentSamples: any,
    currentIndex: number
}

const DEFAULT_OFFSET = 70;
const WIDTH_OF_DRAGBAR = 10;

const FlameGraph: React.FC<IFlameGraph> = ({
    currentSamples,
    currentIndex
}) => {
    const chartRef = useRef<any>();  //拿到canvas容器
    const boxRef = useRef<any>(); // 拿到container容器
    const chartShadowRef = useRef<any>();
    const detailBoxRef = useRef<any>();
    const containerRef = useRef<any>()
    const [selectInfo, setSelectInfo] = useState(null)
    const {data} = currentSamples

    const [offset, setOffset] = useState(DEFAULT_OFFSET);

    const leftCalc = `calc(${offset}% - ${WIDTH_OF_DRAGBAR}px)`
    const rightCalc = `calc(100% - ${offset}% - ${WIDTH_OF_DRAGBAR}px)`

    const initialize = useCallback(() => {
        try {
            if (chartRef.current && boxRef.current) {
                const {width = 0, height = 0} = boxRef.current.getBoundingClientRect();

                chartRef.current.width = width;
                chartRef.current.height = height - 3;

                const chartData = flameGraphAdaptor(data)
                const canvas = chartRef.current

                const flameChart = new FlameChart({
                    canvas, // mandatory
                    //timeseries: [/* ... */],
                    timeframeTimeseries: [/* ... */],
                    data: [
                        chartData as any,
                    ],
                    settings: {
                        options: {
                            timeUnits: 'ms',
                        },
                    },
                });
                flameChart.on('select', (element: any) => {
                    const {node} = element || {}
                    if (node) {
                        const {source} = node
                        if (source) {
                            setSelectInfo(source)
                        }
                    }
                });
                chartShadowRef.current = flameChart
            }
        } catch (err) {
            message.error("Please upload data in json-self-profiling format")
        }
    }, [data, chartRef]);

    useEffect(() => {
        initialize()
    }, [initialize])

    useResizeObserver({
        ref: boxRef,
        onResize: ({width = 0, height = 0}) => {
            chartShadowRef.current?.resize(width, height - 3)
        },
    });


    return <ChartContainer>
        <Divider orientation="left">Chart</Divider>
        <div className='board' ref={containerRef}>
            <div ref={boxRef} className='boxContainer' style={{
                width: leftCalc
            }}>
                <canvas ref={chartRef} key={currentIndex} className="chart"></canvas>
            </div>
            <DragBar containerRef={containerRef} setDragBar={setOffset} />
            <div ref={detailBoxRef} className='detailBox' style={{
                width: rightCalc
            }}>
                <ChartDetail data={selectInfo} />
            </div>
        </div>
    </ChartContainer>
}

export default FlameGraph

const ChartContainer = styled.div`
    .board {
        height: 600px;
        display: flex;
        .boxContainer {
            height: 100%;
        }

        .detailBox {
            height: 100%;
        }        
    }

`