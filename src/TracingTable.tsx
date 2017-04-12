import * as React from "react";
import {Panel, Table} from "react-bootstrap";
import {graphql, InjectedGraphQLProps} from 'react-apollo';
import gql from "graphql-tag";

import {ISwcTracingPage} from "./models/swcTracing";
import {ITracingStructure} from "./models/tracingStructure";
import {TracingRow} from "./TracingRow";
import {PaginationHeader} from "./components/PaginationHeader";

const tracingsQuery = gql`query ($pageInput: SwcTracingPageInput) {
  tracings(pageInput: $pageInput) {
    offset
    limit
    totalCount
    tracings {
      id
      filename
      annotator
      offsetX
      offsetY
      offsetZ
      nodeCount
      createdAt
      updatedAt
      neuron {
        id
        idNumber
        idString
        injection {
          id
          brainArea {
            id
            name
          }
        }
        brainArea {
          id
          name
        }
      }
      tracingStructure {
        id
        name
        value
      }
    }
  }
}`;

interface ITracingsGraphQLProps {
    tracings: ISwcTracingPage;
}

interface ITracingsProps extends InjectedGraphQLProps<ITracingsGraphQLProps> {
    tracingStructures: ITracingStructure[];
    offset: number;
    limit: number;

    onUpdateOffsetForPage(page: number): void;
    onUpdateLimit(limit: number): void;
}

interface ITracingsState {
}

@graphql(tracingsQuery, {
    options: ({offset, limit}) => ({
        pollInterval: 5000,
        variables: {
            pageInput: {
                offset: offset,
                limit: limit,
                sampleId: null,
                neuronId: null,
                tracingStructureId: null,
                annotator: null,
                filename: null
            }
        }
    })
})
export class TracingTable extends React.Component<ITracingsProps, ITracingsState> {
    private refetchRows() {
        this.props.data.refetch();
    }

    render() {
        let rows = null;

        if (this.props.data && !this.props.data.loading) {
            rows = this.props.data.tracings.tracings.map(t => {
                return <TracingRow key={`tt_${t.id}`} tracingStructures={this.props.tracingStructures} tracing={t}
                                   refetch={this.props.data.refetch}/>
            });
        }

        const totalCount = rows ? this.props.data.tracings.totalCount : -1;

        const pageCount = rows ? Math.ceil(this.props.data.tracings.totalCount / this.props.limit) : 1;

        const activePage = rows ? (this.props.offset ? (Math.floor(this.props.offset / this.props.limit) + 1) : 1) : 0;

        return (
            <Panel collapsible defaultExpanded header="Existing" bsStyle="info"
                   footer={totalCount >= 0 ? (totalCount > 0 ? `${totalCount} tracings` : "It's a clean slate upload the first tracing!") : ""}
                   style={{border: "none", borderBottom: "1px solid #ddd"}}>
                <PaginationHeader pageCount={pageCount}
                                  activePage={activePage}
                                  limit={this.props.limit}
                                  onUpdateLimitForPage={limit => this.props.onUpdateLimit(limit)}
                                  onUpdateOffsetForPage={page => this.props.onUpdateOffsetForPage(page)}/>
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
        );
    }
}
