import * as React from "react";
import {Panel, Table} from "react-bootstrap";

import {ISwcTracing} from "../models/swcTracing";
import {TracingRow} from "./TracingRow";
import {PaginationHeader} from "./PaginationHeader";
import {TracingsQuery, ITracingsQueryChildProps} from "../graphql/tracings";

export const TracingTable = (props: ITracingsQueryChildProps) => {
    const {loading, error, tracings} = props;

    if (loading) return null;

    if (error) return (
        <div>
            `${error.message}`;
        </div>
    );

    const rows = tracings.tracings.map((t: ISwcTracing) => {
        return <TracingRow key={`tt_${t.id}`} tracingStructures={props.tracingStructures} tracing={t}/>
    });

    const totalCount = rows ? tracings.totalCount : -1;

    const pageCount = rows ? Math.ceil(tracings.totalCount / props.limit) : 1;

    const activePage = rows ? (props.offset ? (Math.floor(props.offset / props.limit) + 1) : 1) : 0;

    return (
        <Panel collapsible defaultExpanded bsStyle="default" header="Existing"
               footer={renderFooter(totalCount, activePage, pageCount, props.offset, props.limit)}>
            <PaginationHeader pageCount={pageCount}
                              activePage={activePage}
                              limit={props.limit}
                              onUpdateLimitForPage={limit => props.onUpdateLimit(limit)}
                              onUpdateOffsetForPage={page => props.onUpdateOffsetForPage(page)}/>
            <Table style={{marginBottom: "0px"}}>
                <thead>
                <tr>
                    <th>File</th>
                    <th>Annotator</th>
                    <th>Neuron</th>
                    <th>Structure</th>
                    <th>Nodes</th>
                    <th>Uploaded</th>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
        </Panel>
    )
};

function renderFooter(totalCount: number, activePage: number, pageCount: number, offset: number, limit: number) {
    const start = offset + 1;
    const end = Math.min(offset + limit, totalCount);
    const count = totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} tracings` : "It's a clean slate - upload the first tracings!") : "";

    return (
        <div>
            <span>{count}</span>
            <span className="pull-right">{`Page ${activePage} of ${pageCount}`}</span>
        </div>
    );
}

export const TableWithTracings = TracingsQuery(TracingTable);
