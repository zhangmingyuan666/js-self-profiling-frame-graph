export interface IFlameGraphData {
    name?: string,
    start?: number,
    duration?: number,
    children?: IFlameGraphData[]
}

export interface IFlameGraphDataRoot {
    children?: IFlameGraphData[]
}