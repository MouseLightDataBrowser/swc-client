import * as React from "react";
import {Table, Dropdown, DropdownItemProps, Label, Button} from "semantic-ui-react";

const moment = require("moment");

import {ISwcTracing} from "../models/swcTracing";
import {displayNeuron} from "../models/neuron";
import {displayTracingStructure, ITracingStructure, TracingStructure} from "../models/tracingStructure";
import {DynamicEditField} from "./editors/DynamicEditField";
import {UPDATE_TRACING_MUTATION, UpdateTracingMutation} from "../graphql/tracings";

interface ITracingsRowProps {
    tracingStructures: ITracingStructure[];
    tracing: ISwcTracing;
    tracingCount: number;

    onDeleteTracing(tracing: ISwcTracing): void;
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

    public render() {
        const tracingStructureOptions: DropdownItemProps[] = this.props.tracingStructures.map(t => {
            return {
                key: t.id,
                text: displayTracingStructure(t),
                value: t.id
            }
        });

        const count = this.props.tracingCount;

        return (
            <UpdateTracingMutation mutation={UPDATE_TRACING_MUTATION}>
                {(updateTracing) => (
                    <Table.Row>
                        <Table.Cell>
                            {this.props.tracing.filename}
                        </Table.Cell>
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
                        <Table.Cell style={{minWidth: "110px"}}>
                            {count !== undefined ? (count === 0 ?
                                <Button icon="trash" color="red" size="mini" content="delete" labelPosition="left"
                                        onClick={() => {
                                            this.props.onDeleteTracing(this.props.tracing)
                                        }}/> :
                                <Label>{count}<Label.Detail>transformed</Label.Detail></Label>) : "?"
                            }
                        </Table.Cell>
                    </Table.Row>
                )}
            </UpdateTracingMutation>
        );
    }
}
