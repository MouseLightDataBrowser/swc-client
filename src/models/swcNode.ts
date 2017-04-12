import {IStructureIdentifier} from "./structureIdentifier";

export interface ISwcNode {
    id: string;
    sampleNumber: number;
    parentNumber: number;
    x: number;
    y: number;
    z: number;
    radius: number;
    structureIdentifier: IStructureIdentifier;
    createdAt: number;
    updatedAt: number;
}

export function formatNodeCoords(x: number, y: number, z: number) {
    const nx = x ? x.toFixed(4) : "n/a";
    const ny = y ? y.toFixed(4) : "n/a";
    const nz = z ? z.toFixed(4) : "n/a";

    return `(${nx}, ${ny}, ${nz})`;
}

export function formatNodeLocation(node: ISwcNode) {
    if (node) {
        return formatNodeCoords(node.x, node.y, node.z);
    } else {
        return "(n/a)";
    }
}
