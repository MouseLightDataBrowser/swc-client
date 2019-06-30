import * as React from "react";
import {Confirm, Header, Segment} from "semantic-ui-react";

import {ITracingStructure} from "../models/tracingStructure";
import {DELETE_TRACING_MUTATION, DeleteTracingMutation, TRACINGS_QUERY, TracingsQuery} from "../graphql/tracings";
import {PaginationHeader} from "./editors/PaginationHeader";
import {TracingsTable} from "./TracingTable";
import {ISwcTracing} from "../models/swcTracing";
import {displayNeuron} from "../models/neuron";
import {toast} from "react-toastify";
import {toastDeleteError} from "./editors/Toasts";
import {UserPreferences} from "../util/userPreferences";

interface ICreateTracingProps {
    tracingStructures: ITracingStructure[];
}

interface ICreateTracingState {
    offset?: number;
    limit?: number;
    requestedTracingForDelete: ISwcTracing;
}

export class Tracings extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: ICreateTracingProps) {
        super(props);

        this.state = {
            offset: UserPreferences.Instance.swcPageOffset,
            limit: UserPreferences.Instance.swcPageLimit,
            requestedTracingForDelete: null
        };
    }

    private onUpdateOffsetForPage = (page: number) => {
        const offset = this.state.limit * (page - 1);

        if (offset !== this.state.offset) {
            this.setState({offset});

            UserPreferences.Instance.swcPageOffset = offset;
        }
    };

    private onUpdateLimit = (limit: number) => {
        if (limit !== this.state.limit) {
            let offset = this.state.offset;

            if (offset < limit) {
                offset = 0;
            }

            this.setState({offset, limit});

            UserPreferences.Instance.swcPageOffset = offset;
            UserPreferences.Instance.swcPageLimit = limit;
        }
    };


    private renderDeleteConfirmationModal() {
        if (!this.state.requestedTracingForDelete) {
            return null;
        }

        return <DeleteTracingMutation mutation={DELETE_TRACING_MUTATION} refetchQueries={["TracingsQuery"]}
                                      onError={(error) => toast.error(toastDeleteError(error), {autoClose: false})}>
            {(deleteTracing) => (
                <Confirm open={true} dimmer="blurring"
                         header="Delete SWC Tracing?"
                         content={`Are you sure you want to delete ${this.state.requestedTracingForDelete.filename} and any related transform tracings for ${displayNeuron(this.state.requestedTracingForDelete.neuron)}?`}
                         confirmButton="Delete"
                         onCancel={() => this.setState({requestedTracingForDelete: null})}
                         onConfirm={() => {
                             deleteTracing({variables: {id: this.state.requestedTracingForDelete.id}});
                             this.setState({requestedTracingForDelete: null});
                         }}/>)}
        </DeleteTracingMutation>;
    }

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
                            {this.renderDeleteConfirmationModal()}
                            <Segment.Group>
                                <Segment secondary>
                                    <Header style={{margin: "0"}}>Existing</Header>
                                </Segment>
                                <Segment>
                                    <PaginationHeader pageCount={pageCount} activePage={activePage}
                                                      limit={this.state.limit}
                                                      onUpdateLimitForPage={this.onUpdateLimit}
                                                      onUpdateOffsetForPage={this.onUpdateOffsetForPage}/>
                                </Segment>
                                <TracingsTable tracings={data.tracings ? data.tracings.tracings : []}
                                               tracingStructures={this.props.tracingStructures}
                                               offset={this.state.offset}
                                               limit={this.state.limit} totalCount={totalCount} pageCount={pageCount}
                                               activePage={activePage}
                                               onDeleteTracing={(t) => {
                                                   this.setState({requestedTracingForDelete: t})
                                               }}/>
                            </Segment.Group>
                        </div>
                    );
                }}
            </TracingsQuery>
        );
    }
}
