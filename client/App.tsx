import * as React from "react";
import {Navbar, Nav, Glyphicon, NavItem, Badge, Modal, Button, Checkbox} from "react-bootstrap";
import {ToastContainer, ToastPosition} from "react-toastify";

import {Content} from "./Content";
import {SystemMessageQuery} from "./graphql/systemMessage";
import {Query} from "react-apollo";
import {TracingStructuresQuery} from "./graphql/tracingStructures";
import {ITracingStructure} from "./models/tracingStructure";
import {Accordion, Icon, Message} from "semantic-ui-react";

const logoImage = require("file-loader!../assets/mouseLight_logo_web_white.png");

interface ISettingsDialogProps {
    show: boolean
    shouldClearCreateContentsAfterUpload: boolean;

    onHide(): void;
    onChangeClearContents(shouldClear: boolean): void;
}

const SettingsDialog = (props: ISettingsDialogProps) => (
    <Modal show={props.show} onHide={props.onHide} aria-labelledby="contained-modal-title-sm">
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-sm">Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Checkbox checked={props.shouldClearCreateContentsAfterUpload}
                      onChange={(evt: any) => props.onChangeClearContents(evt.target.checked)}>
                Clear fields after upload
            </Checkbox>
        </Modal.Body>
        <Modal.Footer>
            <Button bsSize="small" onClick={props.onHide}>Close</Button>
        </Modal.Footer>
    </Modal>
);

interface IHeadingProps {
    onSettingsClick(): void;
}

const Heading = (props: IHeadingProps) => (
    <Navbar fluid fixedTop style={{marginBottom: 0}}>
        <Navbar.Header>
            <Navbar.Brand>
                <a href="/">
                    <img src={logoImage}/>
                </a>
            </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Collapse>
            <Nav pullRight style={{marginRight: "15px"}}>
                <NavItem onSelect={() => props.onSettingsClick()}>
                    <Glyphicon glyph="cog"/>
                </NavItem>
            </Nav>
            <Query query={SystemMessageQuery} pollInterval={5000}>
                {({loading, error, data}) => {
                    if (loading || error) {
                        return null;
                    }

                    return (
                        <Navbar.Text pullRight><Badge>{data.systemMessage}</Badge></Navbar.Text>
                    );
                }}
            </Query>
        </Navbar.Collapse>
    </Navbar>
);

const Footer = () => (
    <div className="footer">
        Mouse Light Neuron Data Browser Copyright © 2016 - {(new Date().getFullYear())} Howard Hughes Medical Institute
    </div>
);

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

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
            shouldClearCreateContentsAfterUpload = localStorage.getItem("shouldClearCreateContentsAfterUpload") == "true";
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
                <Heading onSettingsClick={() => this.onSettingsClick()}/>
                <div style={{paddingTop: "50px", marginBottom: "40px"}}>
                    <Query query={TracingStructuresQuery} pollInterval={30000}>
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
                            let tracingStructures: ITracingStructure[] = [];

                            if (!loading && !error) {
                                tracingStructures = data.tracingStructures;
                            }

                            return (
                                <Content tracingStructures={tracingStructures}
                                         shouldClearCreateContentsAfterUpload={this.state.shouldClearCreateContentsAfterUpload}/>
                            );
                        }}
                    </Query>
                </div>
                <Footer/>
            </div>
        );
    }
}