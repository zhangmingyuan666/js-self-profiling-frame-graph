import {useEffect, useRef, useState} from 'react'
import styled from 'styled-components'

enum STATUS {
    idle = 'idle',
    dragging = 'dragging'
}

interface IDragBar {
    containerRef: any
    setDragBar: any
}

const minLeft = 30;
const minRight = 80;

export const DragBar: React.FC<IDragBar> = ({
    containerRef,
    setDragBar
}) => {
    const dragBarRef = useRef<HTMLDivElement>()
    const statusRef = useRef(STATUS.idle)
    const [, forceUpdate] = useState({})

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.addEventListener('mousemove', (e: React.MouseEvent) => {
                e.preventDefault()
                if (statusRef.current === STATUS.dragging && containerRef.current) {
                    const {x = 0, width = 0} = containerRef.current?.getBoundingClientRect() || {}
                    const offsetWithPercentage = Math.floor((e.clientX - x) / width * 100)

                    if (offsetWithPercentage < minLeft) {
                        setDragBar(minLeft)
                        return
                    }
                    if (offsetWithPercentage > minRight) {
                        setDragBar(minRight)
                        return
                    }
                    setDragBar(offsetWithPercentage)
                }
            })

            containerRef.current.addEventListener('mouseup', (e: React.MouseEvent) => {
                e.preventDefault()
                statusRef.current = STATUS.idle;
                forceUpdate({})
            })
        }
    }, [])

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        statusRef.current = STATUS.dragging
    }

    const onMouseUp = (e: React.MouseEvent) => {
        e.preventDefault()
        statusRef.current = STATUS.idle
    }

    return <DragBarContainer ref={dragBarRef as any}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
    >
        <div className={`dragBar ${statusRef.current === STATUS.dragging ? "dragBar-active" : ""}`}>

        </div>
    </DragBarContainer>
}

export default DragBar

const DragBarContainer = styled.div`
    width: 10px;
    transition: all 0.15s;
    
    .dragBar {
        height: 100%;
        display: flex;
        background: #ccc;
        flex-direction: column;
        transition: 0.5s all;

        &:hover {
            background: #000;
        }
    }

    .dragBar-active {
        background: #000;
    }
`

