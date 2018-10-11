export interface IBrainArea {
    id: string;
    name: string;
    structureId: number;
}

export function displayBrainArea(brainArea: IBrainArea, missing = "(none)") {
    if (!brainArea || !brainArea.name) {
        return missing;
    }
    return brainArea.name;
}
