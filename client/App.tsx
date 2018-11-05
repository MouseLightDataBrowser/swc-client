import * as React from "react";
import {Accordion, Icon, Label, Menu, Message, Segment, Image, Modal, Header, Button, Checkbox} from "semantic-ui-react";
import {ToastContainer, ToastPosition} from "react-toastify";

import {Content} from "./Content";
import {SYSTEM_MESSAGE_QUERY, SystemMessageQuery} from "./graphql/systemMessage";
import {TRACING_STRUCTURES_QUERY, TracingStructuresQuery} from "./graphql/tracingStructures";
import {ITracingStructure} from "./models/tracingStructure";

const logo = require("file-loader!../assets/mouseLight_nb_color.svg");

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

interface ISettingsDialogProps {
    show: boolean
    shouldClearCreateContentsAfterUpload: boolean;

    onHide(): void;
    onChangeClearContents(shouldClear: boolean): void;
}

const SettingsDialog = (props: ISettingsDialogProps) => (
    <Modal size="tiny" centered={false} closeIcon={true} open={props.show} onClose={props.onHide}>
        <Header content="Settings"/>
        <Modal.Content>
            <Checkbox label="Clear fields after upload"
                      checked={props.shouldClearCreateContentsAfterUpload}
                      onChange={(e, {checked}) => props.onChangeClearContents(checked)}/>
        </Modal.Content>
        <Modal.Actions>
            <Button content="Close" color="blue" onClick={props.onHide}/>
        </Modal.Actions>
    </Modal>
);

interface PageHeaderProps {
    onSettingsClick(): void;
}

const PageHeader = (props: PageHeaderProps) => (
    <Menu inverted fluid stackable fixed="top">
        <Menu.Item>
            <Image size="small" src={logo}/>
        </Menu.Item>
        <Menu.Item position="right">
            <SystemMessageQuery query={SYSTEM_MESSAGE_QUERY} pollInterval={5000}>
                {({loading, error, data}) => {
                    if (loading || error) {
                        return null;
                    }

                    if (data.systemMessage) {
                        return (<Label icon="mail" content={data.systemMessage}/>);
                    }

                    return null;
                }}
            </SystemMessageQuery>
        </Menu.Item>
        <Menu.Item position="right">
            <Icon name="setting" onClick={props.onSettingsClick}/>
        </Menu.Item>
    </Menu>
);

interface IAppState {
    isSettingsOpen?: boolean;
    shouldClearCreateContentsAfterUpload?: boolean;
    isErrorDetailsOpen?: boolean;
}

export class App extends React.Component<{}, IAppState> {
    public constructor(props: {}) {
        super(props);

        let shouldClearCreateContentsAfterUpload = true;

        if (typeof(Storage) !== "undefined") {
            shouldClearCreateContentsAfterUpload = localStorage.getItem("shouldClearCreateContentsAfterUpload") === "true";
        }

        this.state = {
            isSettingsOpen: false,
            shouldClearCreateContentsAfterUpload,
            isErrorDetailsOpen: false
        }
    }

    private onSettingsClick() {
        this.setState({isSettingsOpen: true});
    }

    private onSettingsClose() {
        this.setState({isSettingsOpen: false});
    }

    private onChangeClearContents(shouldClear: boolean) {
        this.setState({shouldClearCreateContentsAfterUpload: shouldClear});

        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("shouldClearCreateContentsAfterUpload", shouldClear ? "true" : "false");
        }
    }

    render() {
        return (
            <div>
                <ToastContainer autoClose={6000} position={"bottom-center" as ToastPosition}
                                style={toastStyleOverride}/>
                <SettingsDialog show={this.state.isSettingsOpen}
                                shouldClearCreateContentsAfterUpload={this.state.shouldClearCreateContentsAfterUpload}
                                onHide={() => this.onSettingsClose()}
                                onChangeClearContents={(b: boolean) => this.onChangeClearContents(b)}/>
                <PageHeader onSettingsClick={() => this.onSettingsClick()}/>
                <div style={{marginTop: "62px", padding: "20px"}}>
                    <TracingStructuresQuery query={TRACING_STRUCTURES_QUERY} pollInterval={30000}>
                        {({loading, error, data}) => {
                            if (error) {
                                return (
                                    <Message negative style={{margin: "20px"}}>
                                        <Message.Header>Could not retrieve data from server</Message.Header>
                                        <Message.Content>
                                            Will retry shortly
                                            <Accordion>
                                                <Accordion.Title active={this.state.isErrorDetailsOpen} index={0}
                                                                 onClick={() => this.setState({isErrorDetailsOpen: !this.state.isErrorDetailsOpen})}>
                                                    <Icon name="dropdown"/>
                                                    Error Details
                                                </Accordion.Title>
                                                <Accordion.Content active={this.state.isErrorDetailsOpen}>
                                                    {error.toString()}
                                                </Accordion.Content>
                                            </Accordion>
                                        </Message.Content>
                                    </Message>
                                )
                            }

                            if (loading) {
                                return (
                                    <Message icon>
                                        <Icon name="circle notched" loading/>
                                        <Message.Content>
                                            <Message.Header content="Requesting content"/>
                                            We are retrieving basic system data.
                                        </Message.Content>
                                    </Message>
                                );
                            }

                            return (
                                <Content tracingStructures={data.tracingStructures}
                                         shouldClearCreateContentsAfterUpload={this.state.shouldClearCreateContentsAfterUpload}/>
                            );
                        }}
                    </TracingStructuresQuery>
                </div>
                <Segment size="small" attached="bottom" inverted>
                    Mouse Light Neuron Browser Copyright © 2016 - {(new Date().getFullYear())} Howard Hughes Medical Institute
                </Segment>
            </div>
        );
    }
}
