import * as React from "react";
import {Header, Segment} from "semantic-ui-react";

import {ITracingStructure} from "../models/tracingStructure";
import {TRACINGS_QUERY, TracingsQuery} from "../graphql/tracings";
import {PaginationHeader} from "./editors/PaginationHeader";
import {TracingsTable} from "./TracingTable";

interface ICreateTracingProps {
    tracingStructures: ITracingStructure[];
}

interface ICreateTracingState {
    offset?: number;
    limit?: number;
}

export class Tracings extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: ICreateTracingProps) {
        super(props);

        this.state = {
            offset: 0,
            limit: 10
        };
    }

    private onUpdateOffsetForPage = (page: number) => {
        this.setState({offset: this.state.limit * (page - 1)}, null);
    };

    private onUpdateLimit = (limit: number) => {
        this.setState({limit: limit}, null);
    };

    public render() {
        return (
            <TracingsQuery query={TRACINGS_QUERY} pollInterval={10000}
                           variables={{pageInput: {offset: this.state.offset, limit: this.state.limit}}}>
                {({loading, error, data}) => {
                    const totalCount = data.tracings ? data.tracings.totalCount : 0;

                    const pageCount = Math.ceil(totalCount / this.state.limit);

                    const activePage = this.state.offset ? (Math.floor(this.state.offset / this.state.limit) + 1) : 1;

                    return (
                        <div>
                            {/*this.renderDeleteConfirmationModal()*/}
                            <Segment attached="top" secondary clearing style={{borderBottomWidth: 0}}>
                                <Header>Existing</Header>
                            </Segment>
                            <Segment attached secondary style={{borderBottomWidth: 0}}>
                                <PaginationHeader pageCount={pageCount} activePage={activePage} limit={this.state.limit}
                                                  onUpdateLimitForPage={this.onUpdateLimit}
                                                  onUpdateOffsetForPage={this.onUpdateOffsetForPage}/>
                            </Segment>
                            <TracingsTable tracings={data.tracings ? data.tracings.tracings : []}
                                           tracingStructures={this.props.tracingStructures}
                                           offset={this.state.offset}
                                           limit={this.state.limit} totalCount={totalCount} pageCount={pageCount}
                                           activePage={activePage}
                                           onDeleteTracing={(t) => {/*this.setState({requestedNeuronForDelete: n})*/
                                           }}/>
                        </div>
                    );
                }}
            </TracingsQuery>
        );
    }
}
