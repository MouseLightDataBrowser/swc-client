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


    private async onExportTracing(id: string) {
        try {
            fetch("/swc", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id
                })
            }).then(async (response) => {
                if (response.status !== 200) {
                    return;
                }
                const data: any = await response.json();

                let contents = data.contents;

                let mime = "text/plain;charset=utf-8";

                contents = dataToBlob(contents);

                saveFile(contents, `${data.id}.swc`, mime);
            }).catch((err) => {
                console.log(err)
            });
        } catch (error) {
            console.log(error);
        }
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
                            <a onClick={() => this.onExportTracing(this.props.tracing.id)}>
                            {this.props.tracing.filename}
                            </a>
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
                            {count !== undefined ? (
                                <Button icon="trash" color="red" size="mini" content={`${count} tracings`} labelPosition="left"
                                        onClick={() => this.props.onDeleteTracing(this.props.tracing)}/>) : "?"
                            }
                        </Table.Cell>
                    </Table.Row>
                )}
            </UpdateTracingMutation>
        );
    }
}

function saveFile(data: any, filename: string, mime: string = null) {
    const blob = new Blob([data], {type: mime || "text/plain;charset=utf-8"});

    if (typeof window.navigator.msSaveBlob !== "undefined") {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const blobURL = window.URL.createObjectURL(blob);
        const tempLink = document.createElement("a");
        tempLink.href = blobURL;
        tempLink.setAttribute("download", filename);
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
    }
}

function dataToBlob(encoded: string) {
    const byteString = atob(encoded);

    const ab = new ArrayBuffer(byteString.length);

    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return ab;
}
