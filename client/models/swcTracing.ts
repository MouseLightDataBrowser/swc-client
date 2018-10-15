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

export interface ISwcTracingInput {
    id: string;
    annotator?: string;
    neuronId?: string;
    tracingStructureId?: string;
}

export interface ISwcUpdateOutput {
    tracing: ISwcTracing;
    error: Error;
}

export interface ISwcUpdateMutationData {
    updateTracing: ISwcUpdateOutput
}

export interface ISwcUpdateMutationOutput {
    data: ISwcUpdateMutationData
}

export interface ISwcUploadOutput {
    tracing: ISwcTracing;
    transformSubmission: boolean;
    error: Error;
}

export interface ISwcUploadMutationData {
    uploadSwc: ISwcUploadOutput
}

export interface ISwcUploadMutationOutput {
    data: ISwcUploadMutationData
}