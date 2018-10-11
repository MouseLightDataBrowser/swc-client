export enum TracingStructure {
    axon = 1,
    dendrite = 2
}
export const AnyTracingStructure: ITracingStructure = {
    id: "",
    name: "any",
    value: -1
};

export interface ITracingStructure {
    id: string;
    name: string;
    value: number;
}

export function displayTracingStructure(tracingStructure: ITracingStructure): string {
    return tracingStructure ? tracingStructure.name : "(none)";
}