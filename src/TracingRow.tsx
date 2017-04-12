import * as React from "react";
import {Glyphicon} from "react-bootstrap";
import {graphql} from 'react-apollo';
import gql from "graphql-tag";
import {toast} from "react-toastify";
const moment = require("moment");

import {ISwcTracing, ISwcTracingInput, ISwcUpdateMutationOutput} from "./models/swcTracing";
import {displayNeuron} from "./models/neuron";
import {ITracingStructure} from "./models/tracingStructure";
import {DynamicEditField} from "./components/DynamicEditField";
import {TracingStructureSelect} from "./TracingStructureSelect";

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

const DeleteSwcTracingMutation = gql`mutation deleteTracing($tracingId: String!) {
  deleteTracing(tracingId: $tracingId) {
    error {
      name
      message
    }
  }
}`;

interface ITracingsRowProps {
    tracingStructures: ITracingStructure[];
    tracing: ISwcTracing;

    refetch?(): any;
    updateSwcTracingMutation?(tracing: ISwcTracingInput): Promise<ISwcUpdateMutationOutput>;
    deleteSwcTracingMutation?(id: string): Promise<any>;
}

interface ITracingRowState {
    isInUpdate: boolean;
}

@graphql(UpdateSwcTracingMutation, {
    props: ({mutate}) => ({
        updateSwcTracingMutation: (tracing: any) => mutate({
            variables: {tracing}
        })
    })
})
@graphql(DeleteSwcTracingMutation, {
    props: ({mutate}) => ({
        deleteSwcTracingMutation: (tracingId: any) => mutate({
            variables: {tracingId}
        })
    })
})
export class TracingRow extends React.Component<ITracingsRowProps, ITracingRowState> {
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

    public render() {
        return (
            <tr>
                <td><a onClick={() => this.deleteTracing()}><Glyphicon glyph="trash"/></a>&nbsp;{this.props.tracing.filename}</td>
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
