export interface IFrame {
    column?: number;
    line?: number;
    name: string;
    resourceId?: number;
}

export interface IStack {
    frameId: number;
    parentId?: number;
}

export interface ISample {
    timestamp: number;
    index?: number;
    stackId?: number;
    stack?: IFrameRecordData[];
}

export interface ISampleAfterTransformStack extends ISample {
    index: number;
    stackId: number;
    stack: IFrameRecordData[];
}

export interface IJsSelfProfilingJSON {
    frames: IFrame[];
    resources: string[];
    samples: ISample[];
    stacks: IStack[];
}

export interface IFrameRecordData extends IFrame {
    name: string;
    resourceURI: string;
}
