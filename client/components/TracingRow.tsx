import * as React from "react";
import {Table, Dropdown, DropdownItemProps, Label} from "semantic-ui-react";
const moment = require("moment");

import {ISwcTracing} from "../models/swcTracing";
import {displayNeuron} from "../models/neuron";
import {displayTracingStructure, ITracingStructure, TracingStructure} from "../models/tracingStructure";
import {DynamicEditField} from "./editors/DynamicEditField";
import {
    TRACING_COUNT_FOR_TRACING_QUERY,
    TracingCountTracingQuery,
    UPDATE_TRACING_MUTATION,
    UpdateTracingMutation
} from "../graphql/tracings";

interface ITracingsRowProps {
    tracingStructures: ITracingStructure[];
    tracing: ISwcTracing;
}

interface ITracingRowState {
    tracingStructures?: ITracingStructure[];

    isEditingStructure?: boolean;

    tracingStructure?: ITracingStructure;
    showConfirmDelete?: boolean;
    isCountingTransforms?: boolean;
    transformedCount?: number;
    files?: File[];
}

export class TracingRow extends React.Component<ITracingsRowProps, ITracingRowState> {
    public constructor(props: ITracingsRowProps) {
        super(props);

        this.state = {
            isEditingStructure: false,
            tracingStructure: props.tracing.tracingStructure,
            tracingStructures: props.tracingStructures,
            showConfirmDelete: false,
            isCountingTransforms: false,
            transformedCount: -1,
            files: []
        }
    }

    public componentWillReceiveProps(props: ITracingsRowProps) {
        if (!this.state.isEditingStructure) {
            this.setState({tracingStructure: props.tracing.tracingStructure});
        }

        if (this.state.tracingStructures.length === 0) {
            this.setState({tracingStructures: props.tracingStructures});
        }
    }

    private onTracingStructureChange(structureId: string) {
        if (!this.state.tracingStructure || structureId !== this.state.tracingStructure.id) {
            this.setState({tracingStructure: this.state.tracingStructures.find(t => t.id === structureId)});
        }
    }

    private async onAcceptAnnotatorEdit(value: string, updateFn: any): Promise<boolean> {
        updateFn({variables: {tracing: {id: this.props.tracing.id, annotator: value}}});

        return true;
    }

    private onAcceptStructureChange(updateFn: any) {
        this.setState({isEditingStructure: false});

        updateFn({
            variables: {
                tracing: {
                    id: this.props.tracing.id,
                    tracingStructureId: this.state.tracingStructure.id
                }
            }
        });
    }
/*
    private async onShowDeleteConfirmation() {
        this.setState({showConfirmDelete: true, isCountingTransforms: true, transformedCount: -1}, null);
    }

    private onCancelDelete() {
        this.setState({showConfirmDelete: false}, null);
    }
*/
    public render() {
        const tracingStructureOptions: DropdownItemProps[] = this.props.tracingStructures.map(t => {
            return {
                key: t.id,
                text: displayTracingStructure(t),
                value: t.id
            }
        });

        return (
            <UpdateTracingMutation mutation={UPDATE_TRACING_MUTATION}>
                {(updateTracing) => (
                    <Table.Row>
                        {/*
                        <Modal show={this.state.showConfirmDelete} onHide={() => this.onCancelDelete()}>
                            <Modal.Header closeButton>
                                <h4>Delete entry for {this.props.tracing.filename || "<unknown>"}?</h4>
                            </Modal.Header>
                            <Modal.Body>
                                <h5>This action will also delete any registered tracings derived from this file.</h5>
                                <TransformedCount id={this.props.tracing.id}/>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button onClick={() => this.onCancelDelete()}
                                        style={{marginRight: "20px"}}>Cancel</Button>
                                <DeleteTracingMutation mutation={DELETE_TRACING_MUTATION}>
                                    {(deleteTracing) => (
                                        <Button onClick={() => {deleteTracing({variables: {id: this.props.tracing.id}}); this.onCancelDelete()}}
                                                bsStyle="danger">Delete</Button>
                                    )}
                                </DeleteTracingMutation>
                            </Modal.Footer>
                        </Modal>
                        <td><a onClick={() => this.onShowDeleteConfirmation()}><Glyphicon
                            glyph="trash"/></a>&nbsp;{this.props.tracing.filename}
                        </td>*/}
                        <Table.Cell>
                            <DynamicEditField initialValue={this.props.tracing.annotator}
                                              acceptFunction={value => this.onAcceptAnnotatorEdit(value, updateTracing)}/>
                        </Table.Cell>
                        <Table.Cell>{displayNeuron(this.props.tracing.neuron)}</Table.Cell>
                        <Table.Cell>
                            {this.state.isEditingStructure ?
                                <div>
                                    <Label style={{verticalAlign: "middle"}} icon="close"
                                           onClick={() => this.setState({isEditingStructure: false})}/>
                                    <Dropdown selection placeholder={"Select the structure..."}
                                              options={tracingStructureOptions}
                                              value={this.state.tracingStructure.id}
                                              onChange={(e, {value}) => this.onTracingStructureChange(value as string)}/>
                                    <Label style={{verticalAlign: "middle"}} color="green" icon="check"
                                           onClick={() => this.onAcceptStructureChange(updateTracing)}/>
                                </div> :
                                <div>
                                    <Label size="mini"
                                           color={this.props.tracing.tracingStructure.value === TracingStructure.axon ? "blue" : "green"}
                                           onClick={() => this.setState({isEditingStructure: true})}>
                                        {displayTracingStructure(this.props.tracing.tracingStructure)}
                                    </Label>
                                </div>
                            }
                        </Table.Cell>
                        <Table.Cell>
                            {this.props.tracing.nodeCount}
                        </Table.Cell>
                        <Table.Cell>
                            {moment(this.props.tracing.createdAt).format("YYYY-MM-DD hh:mm:ss")}
                        </Table.Cell>
                    </Table.Row>
                )}
            </UpdateTracingMutation>
        );
    }
}

interface ITransformedCountProps {
    id: string;
}

const TransformedCount = (props: ITransformedCountProps) => {
    return (
        <TracingCountTracingQuery query={TRACING_COUNT_FOR_TRACING_QUERY} pollInterval={5000}
                                  variables={{id: props.id}}>
            {({loading, error, data}) => {
                if (loading) {
                    return "Requesting registered tracing count for this swc...";
                } else if (error) {
                    return (
                        <p>
                            <Label bsStyle="warning">warning</Label>
                            <span style={{paddingLeft: "10px"}}>Could not retrieve tracing count for this swc</span>
                        </p>
                    );
                } else {
                    return (
                        <DeleteCount count={data.transformedTracingCount.count}/>
                    )
                }
            }}
        </TracingCountTracingQuery>
    );
};

interface IDeleteCountProps {
    count: number;
}

const DeleteCount = (props: IDeleteCountProps) => {
    let content = "";

    const bsStyle = props.count > 0 ? "danger" : "success";

    switch (props.count) {
        case 0:
            content = "There are no registered tracings associated with this swc.";
            break;
        case 1:
            content = "There is 1 registered tracing associated with this swc.";
            break;
        default:
            content = `There are ${props.count} registered tracings associated with this swc.`;
    }

    return (
        <p>
            {props.count === 0 ? null : <Label style={{paddingRight: "10px", borderRadius: "2px"}} bsStyle={bsStyle}>
                {props.count}
            </Label>}
            <span>
                {content}
            </span>
        </p>
    )
};
