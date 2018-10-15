import * as React from "react";
import {ApolloError} from "apollo-client";
import {Dropdown, DropdownItemProps, Loader} from "semantic-ui-react";
import Dropzone = require("react-dropzone");
import {toast} from "react-toastify";

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
import {ISwcUploadOutput} from "../../models/swcTracing";
import {ISamplesQueryChildProps, SamplesQuery} from "../../graphql/samples";
import {NEURONS_QUERY, NeuronsForSampleQuery} from "../../graphql/neurons";
import {UPLOAD_TRACING_MUTATION, UploadTracingMutation, UploadTracingMutationResponse} from "../../graphql/tracings";
import {NeuronForSampleSelect} from "../editors/NeuronForSampleSelect";
import {SamplePreview} from "./SamplePreview";
import {NeuronPreview} from "./NeuronPreview";

interface ICreateTracingState {
    samples?: ISample[];
    tracingStructures?: ITracingStructure[];

    file?: File;
    annotator?: string;
    structure?: ITracingStructure;
    neuron?: INeuron;
    sample?: ISample;
    injection?: IInjection;
    isSampleLocked?: boolean;

    isInUpload?: boolean;
}

class CreateTracingComponent extends React.Component<ISamplesQueryChildProps, ICreateTracingState> {
    public constructor(props: any) {
        super(props);

        this.state = {
            samples: props.samples,
            tracingStructures: props.tracingStructures,
            file: null,
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
                sample: this.state.samples.find((s) => s.id === sampleId) || null,
                neuron: null,
                structure: null
            });
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
        return this.state.neuron && this.state.structure && this.state.annotator.length > 0 && this.state.file !== null;
    }

    private onDrop(acceptedFiles: File[]) {
        if (acceptedFiles && acceptedFiles.length > 0) {
            this.setState({file: acceptedFiles[0]});
        } else {
            this.setState({file: null});
        }
    }

    private resetUploadState() {

        this.setState({file: null});

        if (this.props.shouldClearCreateContentsAfterUpload) {
            this.setState({
                annotator: "",
                structure: null,
                neuron: null,
            });

            if (!this.state.isSampleLocked) {
                this.setState({sample: null});
            }
        }
    }

    private async onUploadSwc(uploadSwc: any) {
        if (this.canUploadTracing()) {
            this.setState({isInUpload: true});

            try {
                uploadSwc({
                    variables: {
                        annotator: this.state.annotator,
                        neuronId: this.state.neuron.id,
                        structureId: this.state.structure.id,
                        file: this.state.file
                    }
                });
                this.setState({isInUpload: false});
            } catch (error) {
                toast.error(uploadErrorContent(error), {autoClose: false, });
                this.setState({isInUpload: false});
            }
        }
    }

    private async onUploadComplete(data: UploadTracingMutationResponse) {
        this.resetUploadState();
        toast.success(uploadSuccessContent(data.uploadSwc), {});
        this.setState({isInUpload: false});
    }

    private async onUploadError(error: ApolloError) {
        toast.error(uploadErrorContent(error), {autoClose: false});
        this.setState({isInUpload: false});
    }

    public componentWillReceiveProps(props: ISamplesQueryChildProps) {
        this.setState({samples: props.samples});

        if (this.state.tracingStructures.length === 0) {
            this.setState({tracingStructures: props.tracingStructures});
        }

        if (typeof(Storage) !== "undefined") {
            const lockedSampleId = localStorage.getItem("tracing.create.locked.sample");

            if (lockedSampleId) {
                let sample = props.samples.find((s: ISample) => s.id === lockedSampleId);

                if (sample && this.state.sample !== sample) {
                    this.setState({sample: sample, isSampleLocked: true}, null);
                }
            }
        }
    }

    public render() {
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
                    {this.state.isInUpload ? <Loader/> : null}
                    <FormGroup>
                        <ControlLabel>Swc Tracing</ControlLabel>
                        <InputGroup bsSize="sm">
                            <Dropzone style={{border: "none"}} disableClick={this.state.isInUpload}
                                      onDrop={(accepted: any) => this.onDrop(accepted)}>
                                <FormControl type="test"
                                             bsSize="sm"
                                             value={this.state.file ? this.state.file.name : ""}
                                             onChange={() => {
                                             }}
                                             placeholder="Click to select..."/>
                            </Dropzone>
                            <InputGroup.Button>
                                <UploadTracingMutation mutation={UPLOAD_TRACING_MUTATION}
                                                       onCompleted={(data) => this.onUploadComplete(data)}
                                                       onError={(error) => this.onUploadError(error)}>
                                    {(uploadSwc) => {
                                        return (
                                            <Button
                                                bsStyle={!this.canUploadTracing() || this.state.isInUpload ? "default" : "success"}
                                                disabled={!this.canUploadTracing() || this.state.isInUpload}
                                                active={this.state.isSampleLocked}
                                                onClick={() => this.onUploadSwc(uploadSwc)}>
                                                Upload&nbsp;&nbsp;
                                                <Glyphicon glyph="cloud-upload"/>
                                            </Button>
                                        );
                                    }}
                                </UploadTracingMutation>
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
                                        disabled={this.state.sample === null || this.state.isInUpload || this.state.samples.length == 0}
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
                    <NeuronsForSampleQuery query={NEURONS_QUERY}
                                           variables={{sampleId: this.state.sample ? this.state.sample.id : null}}>
                        {({data}) => {
                            const neurons = data.neurons || [];

                            return (
                                <NeuronForSampleSelect neurons={neurons} selectedNeuron={this.state.neuron}
                                                       onNeuronChange={n => this.onNeuronChange(n)}
                                                       disabled={this.state.sample === null || this.state.isInUpload}/>
                            );
                        }}
                    </NeuronsForSampleQuery>
                </Col>
                <Col md={2}>
                    <ControlLabel>Structure</ControlLabel>
                    <Dropdown placeholder={"Select the structure..."} fluid selection options={tracingStructureOptions}
                              value={this.state.structure ? this.state.structure.id : null}
                              disabled={this.state.isInUpload}
                              onChange={(e, {value}) => this.onTracingStructureChange(value as string)}/>
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

export const CreateTracing = SamplesQuery(CreateTracingComponent);