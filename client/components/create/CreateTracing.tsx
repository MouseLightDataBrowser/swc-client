import * as React from "react";
import {graphql} from 'react-apollo';
import gql from "graphql-tag";
import {GraphQLDataProps} from "react-apollo/lib/graphql";
import Dropzone = require("react-dropzone");
import {toast} from "react-toastify";
import * as ReactSpinner from "react-spinjs";

import {
    Grid,
    Row,
    Col,
    Panel,
    Button,
    FormGroup,
    ControlLabel,
    FormControl,
    InputGroup,
    Glyphicon,
    Label
} from "react-bootstrap";

import {displaySample, ISample} from "../../models/sample";
import {INeuron} from "../../models/neuron";
import {IInjection} from "../../models/injection";
import {displayTracingStructure, ITracingStructure} from "../../models/tracingStructure";
import {NeuronForSampleSelect} from "../editors/NeuronForSampleSelect";
import {ISwcUploadMutationOutput, ISwcUploadOutput} from "../../models/swcTracing";
import {SamplePreview} from "./SamplePreview";
import {NeuronPreview} from "./NeuronPreview";
import {Dropdown, DropdownItemProps} from "semantic-ui-react";

interface ITracingStructuresQueryProps {
    tracingStructures: ITracingStructure[];
}

interface ISamplesQueryProps {
    samples: ISample[];
}

interface ICreateTracingProps {
    shouldClearCreateContentsAfterUpload: boolean;
    tracingStructuresQuery?: ITracingStructuresQueryProps & GraphQLDataProps;
    samplesQuery?: ISamplesQueryProps & GraphQLDataProps;

    uploadSwc?(annotator: string, neuronId: string, structureId: string, files: any): Promise<any>;
}

interface ICreateTracingState {
    samples?: ISample[];
    tracingStructures?: ITracingStructure[];

    files?: File[];
    annotator?: string;
    structure?: ITracingStructure;
    neuron?: INeuron;
    sample?: ISample;
    injection?: IInjection;
    isSampleLocked?: boolean;

    isInUpload?: boolean;
}

const TracingStructuresQuery = gql`query {
    tracingStructures {
        id
        name
        value
    }
}`;

const SamplesQuery = gql`query {
    samples {
        id
        idNumber
        animalId
        tag
        comment
        sampleDate
        createdAt
        updatedAt
        injections {
          id
          brainArea {
            id
            name
          }
        }
        mouseStrain {
            name
        }
    } 
}`;

const UploadSwcQuery = gql`
  mutation uploadSwc($annotator: String, $neuronId: String, $structureId: String, $files: [UploadedFile]) {
  uploadSwc(annotator: $annotator, neuronId: $neuronId, structureId: $structureId, files: $files) {
    tracing {
      id
      annotator
      nodeCount
      filename
      tracingStructure {
        id
        name
        value
      }
      neuron {
        id
        idNumber
        idString
      }
    }
    transformSubmission
    error {
      name
      message
    }
  }
}`;

@graphql(TracingStructuresQuery, {
    name: "tracingStructuresQuery"
})
@graphql(SamplesQuery, {
    name: "samplesQuery",
    options: {pollInterval: 5000}
})
@graphql(UploadSwcQuery, {
    props: ({ownProps, mutate}) => ({
        uploadSwc: (annotator: string, neuronId: string, structureId: string, files: any) => mutate({
            variables: {annotator, neuronId, structureId, files},
        }),
    }),
})
export class CreateTracing extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: any) {
        super(props);

        this.state = {
            samples: props.samplesQuery && !props.samplesQuery.loading ? props.samplesQuery.samples : [],
            tracingStructures: props.tracingStructuresQuery && !props.tracingStructuresQuery.loading ? props.tracingStructuresQuery.tracingStructures : [],
            files: [],
            annotator: "",
            sample: null,
            neuron: null,
            structure: null,
            isSampleLocked: false,
            isInUpload: false
        }
    }

    private onSampleChange(sampleId: string) {
        if (!this.state.sample || sampleId !== this.state.sample.id) {
            this.setState({
                sample: this.state.samples.find((s) => s.id === sampleId),
                neuron: null,
                structure: null});
        }
    }

    private onNeuronChange(neuron: INeuron) {
        if (neuron !== this.state.neuron) {
            this.setState({neuron, structure: null});
        }
    }

    private onTracingStructureChange(structureId: string) {
        if (!this.state.structure || structureId !== this.state.structure.id) {
            this.setState({structure: this.state.tracingStructures.find(t => t.id === structureId)});
        }
    }

    private onAnnotatorChange(annotator: string) {
        this.setState({annotator});
    }

    private onLockSample() {
        this.setState({isSampleLocked: !this.state.isSampleLocked});

        if (typeof(Storage) !== "undefined") {
            if (!this.state.isSampleLocked) {
                localStorage.setItem("tracing.create.locked.sample", this.state.sample.id);
            } else {
                localStorage.setItem("tracing.create.locked.sample", null);
            }
        }
    }

    private canUploadTracing(): boolean {
        return this.state.neuron && this.state.structure && this.state.annotator.length > 0 && this.state.files.length === 1;
    }

    private onDrop(acceptedFiles: any) {
        this.setState({files: acceptedFiles});
    }

    private resetUploadState() {
        let state: ICreateTracingState = Object.assign({}, this.state);

        state.files = [];

        if (this.props.shouldClearCreateContentsAfterUpload) {
            state.annotator = "";
            state.structure = null;
            state.neuron = null;
            if (!this.state.isSampleLocked) {
                state.sample = null;
            }
        }
        this.setState(state);
    }

    private async onUploadSwc() {
        if (this.canUploadTracing()) {
            this.setState({isInUpload: true});

            try {
                const result: ISwcUploadMutationOutput = await this.props.uploadSwc(this.state.annotator, this.state.neuron.id, this.state.structure.id, this.state.files);

                if (!result.data.uploadSwc.tracing) {
                    toast.error(uploadErrorContent(result.data.uploadSwc.error), {autoClose: false});
                } else {
                    this.resetUploadState();
                    toast.success(uploadSuccessContent(result.data.uploadSwc), {});
                }
                this.setState({isInUpload: false});
            } catch (error) {
                toast.error(uploadErrorContent(error), {autoClose: false});
                this.setState({isInUpload: false});
            }
        }
    }

    public componentWillReceiveProps(props: ICreateTracingProps) {
        this.setState({samples: props.samplesQuery && !props.samplesQuery.loading ? props.samplesQuery.samples : []});

        if (this.state.tracingStructures.length === 0) {
            this.setState({tracingStructures: props.tracingStructuresQuery && !props.tracingStructuresQuery.loading ? props.tracingStructuresQuery.tracingStructures : []});
        }

        if (typeof(Storage) !== "undefined") {
            const lockedSampleId = localStorage.getItem("tracing.create.locked.sample");

            if (lockedSampleId && props.samplesQuery && props.samplesQuery.samples) {
                let samples = props.samplesQuery.samples.filter(s => s.id === lockedSampleId);

                if (samples.length > 0 && this.state.sample !== samples[0]) {
                    this.setState({sample: samples[0], isSampleLocked: true}, null);
                }
            }
        }
    }

    public render() {
        // const tracingStructures = this.props.tracingStructuresQuery && !this.props.tracingStructuresQuery.loading ? this.props.tracingStructuresQuery.tracingStructures : [];
        // const samples = this.props.samplesQuery && !this.props.samplesQuery.loading ? this.props.samplesQuery.samples : [];

        return (
            <Panel collapsible defaultExpanded header="Create" bsStyle="default">
                <Grid fluid>
                    {this.renderUploadRow()}
                    {this.renderPropertiesRow(this.state.samples, this.state.tracingStructures)}
                    {this.renderSelectedSpecificsRow()}
                </Grid>
            </Panel>
        );
    }

    private renderUploadRow() {
        return (
            <Row>
                <Col md={12}>
                    {this.state.isInUpload ? <ReactSpinner/> : null}
                    <FormGroup>
                        <ControlLabel>Swc Tracing</ControlLabel>
                        <InputGroup bsSize="sm">
                            <Dropzone style={{border: "none"}} disableClick={this.state.isInUpload}
                                      onDrop={(accepted: any) => this.onDrop(accepted)}>
                                <FormControl type="test"
                                             bsSize="sm"
                                             value={this.state.files.length > 0 ? this.state.files[0].name : ""}
                                             placeholder="Click to select..."/>
                            </Dropzone>
                            <InputGroup.Button>
                                <Button
                                    bsStyle={!this.canUploadTracing() || this.state.isInUpload ? "default" : "success"}
                                    disabled={!this.canUploadTracing() || this.state.isInUpload}
                                    active={this.state.isSampleLocked}
                                    onClick={() => this.onUploadSwc()}>
                                    Upload&nbsp;&nbsp;
                                    <Glyphicon glyph="cloud-upload"/>
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </Col>
            </Row>
        );
    }

    private renderPropertiesRow(samples: ISample[], tracingStructures: ITracingStructure[]) {
        const sampleOptions: DropdownItemProps[] = samples.map(s => {
            return {
                key: s.id,
                text: displaySample(s),
                value: s.id
            }
        });

        const tracingStructureOptions: DropdownItemProps[] = tracingStructures.map(t => {
            return {
                key: t.id,
                text: displayTracingStructure(t),
                value: t.id
            }
        });

        return (
            <Row>
                <Col md={3}>
                    <FormGroup>
                        <ControlLabel>Sample</ControlLabel>
                        <InputGroup bsSize="sm">
                            <Dropdown placeholder={"Select a sample..."} fluid selection options={sampleOptions}
                                      value={this.state.sample ? this.state.sample.id : null}
                                      disabled={this.state.isSampleLocked || this.state.isInUpload}
                                      onChange={(e, {value}) => this.onSampleChange(value as string)}/>
                            <InputGroup.Button>
                                <Button bsStyle={this.state.isSampleLocked ? "danger" : "default"} bsSize="sm"
                                        disabled={this.state.sample === null || this.state.isInUpload}
                                        active={this.state.isSampleLocked}
                                        onClick={() => this.onLockSample()}>
                                    <Glyphicon glyph="lock"/>
                                </Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </Col>
                <Col md={4}>
                    <ControlLabel>Neuron</ControlLabel>
                    <NeuronForSampleSelect sample={this.state.sample}
                                           selectedNeuron={this.state.neuron}
                                           onNeuronChange={n => this.onNeuronChange(n)}
                                           disabled={this.state.sample === null || this.state.isInUpload}
                                           placeholder={this.state.sample ? "Select a neuron..." : "Select a sample to select a neuron..."}/>
                </Col>
                <Col md={2}>
                    <ControlLabel>Structure</ControlLabel>
                    <Dropdown placeholder={"Select the structure..."} fluid selection options={tracingStructureOptions}
                              value={this.state.structure ? this.state.structure.id : null}
                              disabled={this.state.isInUpload}
                              onChange={(e, {value}) => this.onTracingStructureChange(value as string)}/>
                    {/*
                    <TracingStructureSelect idName="createTracingStructureSelect"
                                            options={tracingStructures}
                                            selectedOption={this.state.structure}
                                            disabled={this.state.isInUpload}
                                            placeholder="Select structure..."
                                            onSelect={t => this.onTracingStructureChange(t)}/>
                                            */}
                </Col>
                <Col md={3}>
                    <FormGroup controlId="annotatorText"
                               validationState={this.state.annotator.length > 0 ? "success" : "error"}>
                        <ControlLabel>Annotator</ControlLabel>
                        <FormControl type="test" bsSize="sm"
                                     value={this.state.annotator}
                                     disabled={this.state.isInUpload}
                                     placeholder="(required)"
                                     onChange={(e: any) => this.onAnnotatorChange(e.target.value)}/>
                    </FormGroup>
                </Col>
            </Row>
        );
    }

    private renderSelectedSpecificsRow() {
        return (
            <Row>
                <Col md={3} smHidden>
                    <SamplePreview sample={this.state.sample}/>
                </Col>
                <Col md={4} smHidden>
                    <NeuronPreview neuron={this.state.neuron}/>
                </Col>
                <Col md={2} smHidden>
                </Col>
                <Col md={3} smHidden>
                </Col>
            </Row>
        );
    }
}

const uploadSuccessContent = (output: ISwcUploadOutput) => {
    return (
        <div>
            <h3>Upload successful</h3>
            {`${output.tracing.filename} by ${output.tracing.annotator}`}
            <br/>
            {`${output.tracing.nodeCount} nodes loaded from file`}
            <br/>
            <Label bsStyle={output.transformSubmission ? "success" : "danger"}>
                Registration
            </Label>
            &nbsp;
            {output.transformSubmission ? "Submission to registration transform service successful" : "Submission to registration transform service failed"}
        </div>
    );
};

const uploadErrorContent = (error: Error) => {
    return (<div><h3>Upload failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};
