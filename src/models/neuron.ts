import {IInjection} from "./injection";
import {displayBrainArea, IBrainArea} from "./brainArea";

export interface INeuron {
    id: string;
    idNumber: number;
    idString: string;
    tag: string;
    keywords: string;
    x: number;
    y: number;
    z: number;
    injection: IInjection;
    brainArea: IBrainArea;
}

export function displayNeuron(neuron: INeuron): string {
    const name =  neuron ? neuron.idString : "(none)";

    const brainArea = displayBrainArea(neuron.brainArea || (neuron.injection ? neuron.injection.brainArea : null));

    return `${name} (${brainArea})`;
}