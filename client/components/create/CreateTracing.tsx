import * as React from "react";
import {ApolloError} from "apollo-client";
import {Dropdown, DropdownItemProps, Form, Grid, Header, Label, Segment, Button, Confirm} from "semantic-ui-react";
import Dropzone = require("react-dropzone");
import {toast} from "react-toastify";

import {displaySample, ISample} from "../../models/sample";
import {INeuron} from "../../models/neuron";
import {IInjection} from "../../models/injection";
import {displayTracingStructure, ITracingStructure} from "../../models/tracingStructure";
import {ISwcUploadOutput} from "../../models/swcTracing";
import {NEURONS_QUERY, NeuronsForSampleQuery} from "../../graphql/neurons";
import {UPLOAD_TRACING_MUTATION, UploadTracingMutation, UploadTracingMutationResponse} from "../../graphql/tracings";
import {NeuronForSampleSelect} from "../editors/NeuronForSampleSelect";
import {SamplePreview} from "./SamplePreview";
import {NeuronPreview} from "./NeuronPreview";
import {UserPreferences} from "../../util/userPreferences";
import {TextAlignProperty} from "csstype";
import {FilePreview, SwcInputFile} from "./FilePreview";

interface ICreateTracingProps {
    samples: ISample[];
    tracingStructures: ITracingStructure[];
    shouldClearCreateContentsAfterUpload: boolean;
}

interface ICreateTracingState {
    samples?: ISample[];
    tracingStructures?: ITracingStructure[];

    file?: File;
    isFileAlertOpen?: boolean;
    invalidFileName?: string;
    annotator?: string;
    structure?: ITracingStructure;
    neuron?: INeuron;
    sample?: ISample;
    injection?: IInjection;
    isSampleLocked?: boolean;
    swcInputFile?: SwcInputFile;
}

export class CreateTracing extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: ICreateTracingProps) {
        super(props);

        let sample: ISample = null;
        let isSampleLocked = false;

        if (UserPreferences.Instance.lockedSampleId.length > 0) {
            sample = props.samples.find(s => s.id === UserPreferences.Instance.lockedSampleId) || null;
            isSampleLocked = sample != null;
        }

        this.state = {
            samples: props.samples,
            tracingStructures: props.tracingStructures,
            file: null,
            isFileAlertOpen: false,
            invalidFileName: "",
            annotator: "",
            sample,
            neuron: null,
            structure: null,
            isSampleLocked,
            swcInputFile: null
        };
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
        // Based on current state so if locked, clear locked sample, etc.
        UserPreferences.Instance.lockedSampleId = this.state.isSampleLocked ? "" : this.state.sample.id;

        this.setState({isSampleLocked: !this.state.isSampleLocked});
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
            try {
                uploadSwc({
                    variables: {
                        annotator: this.state.annotator,
                        neuronId: this.state.neuron.id,
                        structureId: this.state.structure.id,
                        file: this.state.file
                    }
                });
            } catch (error) {
                toast.error(uploadErrorContent(error), {autoClose: false});
            }
        }
    }

    private async onUploadComplete(data: UploadTracingMutationResponse) {
        this.resetUploadState();
        toast.success(uploadSuccessContent(data.uploadSwc), {});
    }

    private async onUploadError(error: ApolloError) {
        console.log(error);
        toast.error(uploadErrorContent(error), {autoClose: false});
    }

    public componentWillReceiveProps(props: ICreateTracingProps) {
        this.setState({samples: props.samples});

        if (this.state.tracingStructures.length === 0) {
            this.setState({tracingStructures: props.tracingStructures});
        }

        const lockedSampleId = UserPreferences.Instance.lockedSampleId;

        let sample = this.state.sample;

        if (lockedSampleId) {
            sample = props.samples.find((s: ISample) => s.id === lockedSampleId);
        } else if (this.state.sample) {
            sample = props.samples.find((s: ISample) => s.id === sample.id);
        }

        if (sample) {
            this.setState({sample: sample, isSampleLocked: lockedSampleId.length > 0});
        } else {
            this.setState({sample: null, isSampleLocked: false});
        }
    }

    public render() {
        return (
            <div>
                <Confirm content={`${this.state.invalidFileName} does not appear to contain SWC data.`}
                         open={this.state.isFileAlertOpen} cancelButton={null}
                         onConfirm={() => this.setState({isFileAlertOpen: false})}/>
                <UploadTracingMutation mutation={UPLOAD_TRACING_MUTATION}
                                       onCompleted={(data) => this.onUploadComplete(data)}
                                       onError={(error) => this.onUploadError(error)}>
                    {(uploadSwc, {loading}) => {
                        return (
                            <div>
                                <Segment secondary attached="top"
                                         style={{
                                             display: "flex",
                                             alignItems: "center",
                                             justifyContent: "space-between"
                                         }}>
                                    <Header content="Create" style={{margin: "0"}}/>
                                    <Button content="Upload" icon="upload" size="tiny" labelPosition="right"
                                            color="blue"
                                            disabled={!this.canUploadTracing() || loading}
                                            onClick={() => this.onUploadSwc(uploadSwc)}/>

                                </Segment>
                                <Segment attached="bottom">
                                    <Grid fluid="true">
                                        <Grid.Row style={{paddingBottom: 0}}>
                                            <Grid.Column width={5}>
                                                <Form>
                                                    <Form.Field>
                                                        <label>File</label>
                                                    </Form.Field>
                                                </Form>
                                            </Grid.Column>
                                            <Grid.Column width={3}>
                                                <Form>
                                                    <Form.Field>
                                                        <label>Sample</label>
                                                    </Form.Field>
                                                </Form>
                                            </Grid.Column>
                                            <Grid.Column width={4}>
                                                <Form>
                                                    <Form.Field>
                                                        <label>Neuron</label>
                                                    </Form.Field>
                                                </Form>
                                            </Grid.Column>
                                            <Grid.Column width={4}>
                                                <Form>
                                                    <Form.Field>
                                                        <label>Structure</label>
                                                    </Form.Field>
                                                </Form>
                                            </Grid.Column>
                                        </Grid.Row>
                                        {this.renderPropertiesRow(this.state.samples, this.state.tracingStructures, loading)}
                                    </Grid>
                                </Segment>
                            </div>
                        );
                    }}
                </UploadTracingMutation>
            </div>
        );
    }

    private renderPropertiesRow(samples: ISample[], tracingStructures: ITracingStructure[], loading: boolean) {
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
            <Grid.Row style={{paddingTop: 0}}>
                <Grid.Column width={5} stretched={true}>
                    <Segment.Group>
                        <Segment style={{padding: 0}}>
                            <Dropzone disableClick={loading} className="dropzone-no-border"
                                      style={{
                                          order: 0,
                                          backgroundColor: loading ? "rgb(255, 246, 246)" : (this.state.file ? "white" : "rgb(255, 230, 230)")
                                      }}
                                      onDrop={(accepted: File[]) => this.onDrop(accepted)}>
                            <span style={NoFileStyle(!this.state.file, loading)}>
                                {this.state.file ? this.state.file.name : "drop a SWC file or click to browse for a file"}
                            </span>
                            </Dropzone>
                        </Segment>
                        <Segment style={{padding: 0}}>
                            <div style={{display: "flex", flexDirection: "column", height: "400px"}}>
                                <FilePreview style={{order: 1, flexGrow: 1, border: "none", margin: 0}}
                                             file={this.state.file}
                                             onFileReceived={(file: File) => this.onDrop([file])}
                                             onFileIsInvalid={() => {
                                                 this.setState({
                                                     isFileAlertOpen: true,
                                                     invalidFileName: this.state.file ? this.state.file.name : ""
                                                 });
                                                 this.onDrop(null)
                                             }}
                                             onFileLoaded={(inputFile) => this.setState({swcInputFile: inputFile})}/>
                            </div>
                        </Segment>
                        <Segment style={{display: this.state.file !== null ? "block" : "none"}}>
                            {this.state.swcInputFile ? `Node Count: ${this.state.swcInputFile.nodeCount}` : ""}
                        </Segment>
                    </Segment.Group>
                </Grid.Column>
                <Grid.Column width={3}>
                    <Button as="div" fluid={true} labelPosition="left">
                        <Dropdown search fluid={true} selection options={sampleOptions}
                                  className="label"
                                  placeholder="Select sample..."
                                  value={this.state.sample ? this.state.sample.id : null}
                                  disabled={this.state.isSampleLocked || loading}
                                  onChange={(e, {value}) => this.onSampleChange(value as string)}
                                  style={{fontWeight: "normal"}}/>
                        <Button compact icon="lock" color={this.state.isSampleLocked ? "red" : null}
                                disabled={this.state.sample === null}
                                active={this.state.isSampleLocked}
                                onClick={() => this.onLockSample()}/>
                    </Button>
                    <SamplePreview sample={this.state.sample}/>
                </Grid.Column>
                <Grid.Column width={4}>
                    <NeuronsForSampleQuery query={NEURONS_QUERY} skip={this.state.sample === null}
                                           variables={{sampleId: this.state.sample ? this.state.sample.id : null}}>
                        {(response) => {
                            // data will be undefined if skipped.  data.neurons will be undefined while loading.
                            const neurons = response.data ? response.data.neurons : undefined;

                            return (
                                <NeuronForSampleSelect loading={response.loading} neurons={neurons}
                                                       selectedNeuron={this.state.neuron}
                                                       onNeuronChange={n => this.onNeuronChange(n)}
                                                       disabled={this.state.sample === null || loading}/>
                            );
                        }}
                    </NeuronsForSampleQuery>
                    <NeuronPreview neuron={this.state.neuron}/>
                </Grid.Column>
                <Grid.Column width={4}>
                    <Dropdown placeholder={"Select structure..."} fluid={true} selection
                              options={tracingStructureOptions}
                              value={this.state.structure ? this.state.structure.id : null}
                              disabled={loading}
                              onChange={(e, {value}) => this.onTracingStructureChange(value as string)}/>
                    <Form>
                        <Form.Field>
                            <label>Annotator</label>

                            <Form.TextArea value={this.state.annotator} placeholder="(required)" rows={6}
                                           disabled={loading} error={this.state.annotator.length === 0}
                                           onChange={(e: any) => this.onAnnotatorChange(e.target.value)}/>
                        </Form.Field>
                    </Form>
                </Grid.Column>
            </Grid.Row>
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
            <Label>
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

const NoFileStyle = (isMissing: boolean, loading: boolean) => {
    return {
        textAlign: "center" as TextAlignProperty,
        width: "100%",
        margin: "10px",
        color: (isMissing || loading) ? "rgba(191, 191, 191, 0.870588)" : "black"
    };
};
