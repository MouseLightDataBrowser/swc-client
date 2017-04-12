import * as React from "react";

import {Modal, Button, Checkbox} from "react-bootstrap";

import {CreateTracing} from "./CreateTracing";
import {Tracings} from "./Tracings";

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

interface IContentProps {
    isSettingsOpen: boolean;

    onSettingsClose(): void;
}

interface IContentState {
    shouldClearCreateContentsAfterUpload: boolean;
}

export class Content extends React.Component<IContentProps, IContentState> {
    public constructor(props: IContentProps) {
        super(props);

        let shouldClearCreateContentsAfterUpload = true;

        if (typeof(Storage) !== "undefined") {
            shouldClearCreateContentsAfterUpload = localStorage.getItem("shouldClearCreateContentsAfterUpload") == "true";
        }

        this.state = {shouldClearCreateContentsAfterUpload}
    }

    private onChangeClearContents(shouldClear: boolean) {
        this.setState({shouldClearCreateContentsAfterUpload: shouldClear}, null);

        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("shouldClearCreateContentsAfterUpload", shouldClear ? "true" : "false");
        }
    }

    render() {
        return (
            <div style={{marginTop: "45px", marginBottom: "40px"}}>
                <SettingsDialog show={this.props.isSettingsOpen}
                                shouldClearCreateContentsAfterUpload={this.state.shouldClearCreateContentsAfterUpload}
                                onHide={() => this.props.onSettingsClose()}
                                onChangeClearContents={(b: boolean) => this.onChangeClearContents(b)}/>
                <CreateTracing shouldClearCreateContentsAfterUpload={this.state.shouldClearCreateContentsAfterUpload}/>
                <Tracings/>
            </div>
        );
    }
}
