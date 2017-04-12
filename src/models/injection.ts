import {displayBrainArea, IBrainArea} from "./brainArea";
import {IFluorophore} from "./fluorophore";
import {IInjectionVirus} from "./injectionVirus";
import {ISample} from "./sample";

export interface IInjection {
    id: string;
    brainArea: IBrainArea;
    injectionVirus: IInjectionVirus;
    fluorophore: IFluorophore;
    sample: ISample;
}

export function displayInjection(injection: IInjection) {
    if (!injection) {
        return "(none)";
    }

    return displayBrainArea(injection.brainArea, "(no brain area)");
}

export function displayInjections(injections: IInjection[], missing: string = "(none)") {
    if (!injections || injections.length === 0) {
        return missing;
    }

    return injections.reduce((prev, curr) => prev + `${displayInjection(curr)}, `, "").slice(0, -2);
}
