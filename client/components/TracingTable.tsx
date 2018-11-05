import * as React from "react";

import {ISwcTracing} from "../models/swcTracing";
import {TracingRow} from "./TracingRow";
import {Table} from "semantic-ui-react";
import {ITracingStructure} from "../models/tracingStructure";

export interface ITracingsTableProps {
    tracings: ISwcTracing[];
    tracingStructures: ITracingStructure[];
    totalCount: number;
    offset: number;
    limit: number;
    activePage: number;
    pageCount: number;

    onDeleteTracing(tracing: ISwcTracing): void;
}

export const TracingsTable = (props: ITracingsTableProps) => {
    const rows = props.tracings.map((t: ISwcTracing) => {
        return <TracingRow key={`tt_${t.id}`} tracingStructures={props.tracingStructures} tracing={t}/>
    });

    const start = props.offset + 1;
    const end = Math.min(props.offset + props.limit, props.totalCount);

    return (
        <Table attached="bottom" compact="very">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>File</Table.HeaderCell>
                    <Table.HeaderCell>Annotator</Table.HeaderCell>
                    <Table.HeaderCell>Neuron</Table.HeaderCell>
                    <Table.HeaderCell>Structure</Table.HeaderCell>
                    <Table.HeaderCell>Nodes</Table.HeaderCell>
                    <Table.HeaderCell>Created</Table.HeaderCell>
                    <Table.HeaderCell/>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {rows}
            </Table.Body>
            <Table.Footer fullwidth="true">
                <Table.Row>
                    <Table.HeaderCell colSpan={5}>
                        {props.totalCount >= 0 ? (props.totalCount > 0 ? `Showing ${start} to ${end} of ${props.totalCount} neurons` : "It's a clean slate - create the first neuron!") : ""}
                    </Table.HeaderCell>
                    <Table.HeaderCell colSpan={6} textAlign="right">
                        {`Page ${props.activePage} of ${props.pageCount}`}
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
};
