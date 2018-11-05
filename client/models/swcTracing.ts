import {ITracingStructure} from "./tracingStructure";
import {INeuron} from "./neuron";

export interface ISwcTracing {
    id: string;
    filename: string;
    fileComments: string;
    annotator: string;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    tracingStructure: ITracingStructure;
    neuron: INeuron;
    nodeCount: number;
    createdAt: number;
    updatedAt: number;
}

export interface ISwcUploadOutput {
    tracing: ISwcTracing;
    transformSubmission: boolean;
    error: Error;
}
