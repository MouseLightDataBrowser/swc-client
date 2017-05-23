import * as React from "react";
import {Glyphicon, Modal, Button, Label} from "react-bootstrap";
import {graphql} from 'react-apollo';
import gql from "graphql-tag";
import {toast} from "react-toastify";
const moment = require("moment");

import {ISwcTracing, ISwcTracingInput, ISwcUpdateMutationOutput} from "./models/swcTracing";
import {displayNeuron} from "./models/neuron";
import {ITracingStructure} from "./models/tracingStructure";
import {DynamicEditField} from "./components/DynamicEditField";
import {TracingStructureSelect} from "./TracingStructureSelect";

const TracingsForSwcTracingMutation = gql`mutation transformedTracingsForSwc($id: String!) {
  transformedTracingsForSwc(id: $id) {
    count
    error {
      name
      message
    }
  }
}`;

const UpdateSwcTracingMutation = gql`mutation UpdateSwcTracing($tracing: SwcTracingInput) {
  updateTracing(tracing: $tracing) {
    tracing {
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
      }
      tracingStructure {
        id
        name
        value
      }
    }
    error {
      name
      message
    }
  }
}`;

const DeleteSwcTracingMutation = gql`mutation deleteTracing($id: String!) {
  deleteTracing(id: $id) {
    error {
      name
      message
    }
  }
}`;

interface ITracingsForSwcOutput {
    count: number;
    error: Error;
}

interface ITracingsForSwcContents {
    transformedTracingsForSwc: ITracingsForSwcOutput;
}

interface ITracingsForSwcData {
    data: ITracingsForSwcContents;
}

interface ITracingsRowProps {
    tracingStructures: ITracingStructure[];
    tracing: ISwcTracing;

    refetch?(): any;
    updateSwc?(id: string, files: any): Promise<any>;
    transformedTracingsForSwc?(id: string): Promise<ITracingsForSwcData>;
    updateSwcTracingMutation?(tracing: ISwcTracingInput): Promise<ISwcUpdateMutationOutput>;
    deleteSwcTracingMutation?(id: string): Promise<any>;
}

interface ITracingRowState {
    isInUpdate?: boolean;
    showConfirmDelete?: boolean;
    isCountingTransforms?: boolean;
    transformedCount?: number;
    files?: File[];
}

@graphql(TracingsForSwcTracingMutation, {
    props: ({mutate}) => ({
        transformedTracingsForSwc: (id: any) => mutate({
            variables: {id}
        })
    })
})
@graphql(UpdateSwcTracingMutation, {
    props: ({mutate}) => ({
        updateSwcTracingMutation: (tracing: any) => mutate({
            variables: {tracing}
        })
    })
})
@graphql(DeleteSwcTracingMutation, {
    props: ({mutate}) => ({
        deleteSwcTracingMutation: (id: any) => mutate({
            variables: {id}
        })
    })
})
export class TracingRow extends React.Component<ITracingsRowProps, ITracingRowState> {
    public constructor(props: ITracingsRowProps) {
        super(props);

        this.state = {
            files: [],
            isInUpdate: false,
            showConfirmDelete: false,
            isCountingTransforms: false,
            transformedCount: -1
        }
    }

    private async performUpdate(tracingPartial: ISwcTracingInput) {
        try {
            const result = await this.props.updateSwcTracingMutation(tracingPartial);

            if (!result.data.updateTracing.tracing) {
                toast.error(updateErrorContent(result.data.updateTracing.error), {autoClose: false});
            } else {
                toast.success(updateSuccessContent(), {autoClose: 3000});
            }
            this.setState({isInUpdate: false});
        } catch (error) {
            toast.error(updateErrorContent(error), {autoClose: false});

            this.setState({isInUpdate: false});

            return false;
        }

        return true;
    }

    private async onAcceptAnnotatorEdit(value: string): Promise<boolean> {
        return this.performUpdate({id: this.props.tracing.id, annotator: value});
    }

    private async onAcceptStructureChange(structure: ITracingStructure) {
        return this.performUpdate({id: this.props.tracing.id, tracingStructureId: structure.id});
    }

    private async onShowDeleteConfirmation() {
        this.setState({showConfirmDelete: true, isCountingTransforms: true, transformedCount: -1}, null);

        try {
            const out = await this.props.transformedTracingsForSwc(this.props.tracing.id);

            const contents = out.data.transformedTracingsForSwc;

            if (contents.error) {
                console.log(contents.error);
            }

            this.setState({isCountingTransforms: false, transformedCount: contents.count}, null);
        } catch (err) {
            this.setState({isCountingTransforms: false, transformedCount: -1}, null);
            console.log(err)
        }
    }

    private async onCloseConfirmation(shouldDelete = false) {
        this.setState({showConfirmDelete: false}, null);

        if (shouldDelete) {
            await this.deleteTracing();
        }
    }

    private async deleteTracing() {
        try {
            const result = await this.props.deleteSwcTracingMutation(this.props.tracing.id);

            if (result.data.deleteTracing.error) {
                toast.error(deleteErrorContent(result.data.deleteTracing.error), {autoClose: false});
            } else {
                toast.success(deleteSuccessContent(), {autoClose: 3000});

                if (this.props.refetch) {
                    this.props.refetch();
                }
            }
        } catch (error) {
            toast.error(deleteErrorContent(error), {autoClose: false});
        }
    }

    private renderDeleteConfirmationCount() {
        if (this.state.isInUpdate) {
            return "Requesting registered tracing count for this swc...";
        }

        if (this.state.transformedCount < 0) {
            return (
                <p>
                    <Label bsStyle="warning">warning</Label>
                    <span style={{paddingLeft: "10px"}}>Could not retrieve tracing count for this swc</span>
                </p>
            );
        }

        switch (this.state.transformedCount) {
            case 0:
                return deleteModalCountContent(this.state.transformedCount, "There are no registered tracings associated with this swc.");
            case 1:
                return deleteModalCountContent(this.state.transformedCount, "There is 1 registered tracing associated with this swc.");
            default:
                return deleteModalCountContent(this.state.transformedCount, `There are ${this.state.transformedCount} registered tracings associated with this swc.`);
        }
    }


    public render() {
        return (
            <tr>
                <Modal show={this.state.showConfirmDelete} onHide={() => this.onCloseConfirmation()}>
                    <Modal.Header closeButton>
                        <h4>Delete entry for {this.props.tracing.filename}?</h4>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>This action will also delete any registered tracings derived from this file.</h5>
                        {this.renderDeleteConfirmationCount()}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.onCloseConfirmation()} style={{marginRight: "20px"}}>Cancel</Button>
                        <Button onClick={() => this.onCloseConfirmation(true)} bsStyle="danger">Delete</Button>
                    </Modal.Footer>
                </Modal>
                <td><a onClick={() => this.onShowDeleteConfirmation()}><Glyphicon
                    glyph="trash"/></a>&nbsp;{this.props.tracing.filename}
                </td>
                <td>
                    <DynamicEditField initialValue={this.props.tracing.annotator}
                                      acceptFunction={value => this.onAcceptAnnotatorEdit(value)}/>
                </td>
                <td>{displayNeuron(this.props.tracing.neuron)}</td>
                <td>
                    <TracingStructureSelect options={this.props.tracingStructures}
                                            selectedOption={this.props.tracing.tracingStructure}
                                            isExclusiveEditMode={false}
                                            isDeferredEditMode={true}
                                            onSelect={s => this.onAcceptStructureChange(s)}/>
                </td>
                <td>
                    {this.props.tracing.nodeCount}
                </td>
                <td>
                    {moment(this.props.tracing.createdAt).format("YYYY-MM-DD hh:mm:ss")}
                </td>
            </tr>
        );
    }
}

const updateSuccessContent = () => {
    return (<div><h3>Update successful</h3></div>);
};

const updateErrorContent = (error: Error) => {
    return (<div><h3>Update failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};

const deleteSuccessContent = () => {
    return (<div><h3>Delete successful</h3></div>);
};

const deleteErrorContent = (error: Error) => {
    return (<div><h3>Delete failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};

const labelModifierStyle = {borderRadius: "2px"};
const spanStyle = {paddingLeft: "10px"};

const deleteModalCountContent = (count: number, content: string) => {
    const bsStyle = count > 0 ? "danger" : "success";

    return (
        <p>
            <Label bsStyle={bsStyle} style={labelModifierStyle}>
                {count}
            </Label>
            <span style={spanStyle}>
                {content}
            </span>
        </p>
    )
};
