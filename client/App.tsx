import * as React from "react";
import {InjectedGraphQLProps, graphql} from "react-apollo";
import {Navbar, Nav, Glyphicon, NavItem, Badge, Modal, Button, Checkbox} from "react-bootstrap";
import {Link} from "react-router";
import {ToastContainer} from "react-toastify";

import {Content} from "./Content";
import {SystemMessageQuery} from "./graphql/systemMessage";

const logoImage = require("file-loader!../assets/mouseLight_logo_web_white.png");

interface ISettingsDialogProps {
    show: boolean
    shouldClearCreateContentsAfterUpload: boolean;

    onHide(): void;
    onChangeClearContents(shouldClear: boolean): void;
}

interface ISettingsDialogState {
}

class SettingsDialog extends React.Component<ISettingsDialogProps, ISettingsDialogState> {
    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide} aria-labelledby="contained-modal-title-sm">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-sm">Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Checkbox checked={this.props.shouldClearCreateContentsAfterUpload}
                              onChange={(evt: any) => this.props.onChangeClearContents(evt.target.checked)}>
                        Clear fields after upload
                    </Checkbox>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsSize="small" onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

interface ISystemMessageQuery {
    systemMessage: string;
}

interface IHeadingProps extends InjectedGraphQLProps<ISystemMessageQuery> {
    onSettingsClick(): void;
}

interface IHeadingState {
}

@graphql(SystemMessageQuery, {
    options: {
        pollInterval: 5000
    }
})
class Heading extends React.Component<IHeadingProps, IHeadingState> {
    public render() {
        return (
            <Navbar fluid fixedTop style={{marginBottom: 0}}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">
                            <img src={logoImage}/>
                        </Link>
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight style={{marginRight: "15px"}}>
                        <NavItem onSelect={() => this.props.onSettingsClick()}>
                            <Glyphicon glyph="cog"/>
                        </NavItem>
                    </Nav>
                    <Navbar.Text pullRight><Badge>{this.props.data.systemMessage}</Badge></Navbar.Text>
                </Navbar.Collapse>
            </Navbar>);
    }
}

const Footer = () => (
    <div className="footer">
        Mouse Light Neuron Data Browser Copyright © 2016 - 2017 Howard Hughes Medical Institute
    </div>
);

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

interface IAppProps {
}

interface IAppState {
    isSettingsOpen?: boolean;
    shouldClearCreateContentsAfterUpload?: boolean;
}

export class App extends React.Component<IAppProps, IAppState> {
    public constructor(props: IAppProps) {
        super(props);

        let shouldClearCreateContentsAfterUpload = true;

        if (typeof(Storage) !== "undefined") {
            shouldClearCreateContentsAfterUpload = localStorage.getItem("shouldClearCreateContentsAfterUpload") == "true";
        }

        this.state = {
            isSettingsOpen: false,
            shouldClearCreateContentsAfterUpload
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
                <ToastContainer autoClose={6000} position="bottom-center" style={toastStyleOverride}/>
                <SettingsDialog show={this.state.isSettingsOpen}
                                shouldClearCreateContentsAfterUpload={this.state.shouldClearCreateContentsAfterUpload}
                                onHide={() => this.onSettingsClose()}
                                onChangeClearContents={(b: boolean) => this.onChangeClearContents(b)}/>
                <Heading onSettingsClick={() => this.onSettingsClick()}/>
                <div style={{marginTop: "50px", marginBottom: "40px"}}>
                    <Content shouldClearCreateContentsAfterUpload={this.state.shouldClearCreateContentsAfterUpload}/>
                </div>
                <Footer/>
            </div>
        );
    }
}