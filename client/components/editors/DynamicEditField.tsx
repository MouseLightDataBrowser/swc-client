import * as React from "react";

import {Glyphicon, FormControl, FormGroup, InputGroup, Overlay, Tooltip, Button, HelpBlock} from "react-bootstrap";
import {isNullOrUndefined} from "util";

export enum DynamicEditFieldMode {
    Static,
    Edit
}

export interface IDynamicEditFieldProps {
    initialValue: any;
    style?: any;
    canEditFailMessage?: string;
    placeHolder?: string;

    canEditFunction?(): boolean;
    canAcceptFunction?(value: string): boolean;
    acceptFunction?(value: string): Promise<boolean>;
    filterFunction?(proposedValue: string): any;
    feedbackFunction?(proposedValue: string): any;
    formatFunction?(value: any, mode: DynamicEditFieldMode): string;

    onEditModeChanged?(mode: DynamicEditFieldMode): void;
}

export interface IDynamicEditFieldState {
    initialPropValue?: any;
    value?: any
    mode?: DynamicEditFieldMode;
    showEditFail?: boolean;
    feedback?: string;
}

export class DynamicEditField extends React.Component<IDynamicEditFieldProps, IDynamicEditFieldState> {
    constructor(props: IDynamicEditFieldProps) {
        super(props);

        this.state = {
            initialPropValue: props.initialValue,
            value: props.initialValue,
            mode: DynamicEditFieldMode.Static,
            showEditFail: false,
            feedback: null
        };
    }

    private onEdit = () => {
        if (!this.props.canEditFunction || this.props.canEditFunction()) {
            this.setState({mode: DynamicEditFieldMode.Edit}, null);
            if (this.props.onEditModeChanged) {
                this.props.onEditModeChanged(DynamicEditFieldMode.Edit);
            }
        } else {
            this.setState({showEditFail: true}, null);
        }
    };

    private onCancelEdit = () => {
        this.setState({value: this.props.initialValue, mode: DynamicEditFieldMode.Static}, null);
        if (this.props.onEditModeChanged) {
            this.props.onEditModeChanged(DynamicEditFieldMode.Static);
        }
    };

    private onCanAcceptEdit() {
        if (this.props.canAcceptFunction) {
            return this.props.canAcceptFunction(this.state.value);
        }

        return true;
    }

    private async onAcceptEdit() {
        const result = !this.props.acceptFunction || await this.props.acceptFunction(this.state.value);

        if (result) {
            this.setState({mode: DynamicEditFieldMode.Static}, null);
            if (this.props.onEditModeChanged) {
                this.props.onEditModeChanged(DynamicEditFieldMode.Static);
            }
        }
    };

    private onValueChanged(event: any) {
        let value = event.target.value;

        let feedback = this.state.feedback;

        if (this.props.feedbackFunction) {
            feedback = this.props.feedbackFunction(value);
        }

        if (this.props.filterFunction) {
            value = this.props.filterFunction(value);
        }

        if (value !== null) {
            this.setState({value, feedback}, null);
        } else {
            this.setState({feedback}, null);
        }
    };

    private async onKeyPress(event: any) {
        if ((event.charCode || event.which) == 13) {
            await this.onAcceptEdit();
        }
    };

    private format = (value: any) => {
        if (this.props.formatFunction) {
            return this.props.formatFunction(value, this.state.mode);
        }

        return value;
    };

    private overlayControl: any = null;

    public componentWillReceiveProps(props: IDynamicEditFieldProps) {
        this.setState({
            initialPropValue: props.initialValue,
            value: props.initialValue
        }, null);
    }

    public get staticValueDisplay() {
        if (isNullOrUndefined(this.state.value) || this.state.value.length === 0) {
            return (<span style={{color: "#AAA"}}>{this.props.placeHolder}</span>)
        }

        return this.state.value;
    }

    public render() {
        const style = {
            margin: "0px",
            display: "inline"
        };

        const staticDivStyle = this.props.style || {display: "inline-block"};

        const overlapProps = {
            placement: "top",
            rootClose: true,
            target: this.overlayControl,
            show: this.state.showEditFail,
            onHide: () => this.setState({showEditFail: false}, null),
            onEntered: () => setTimeout(() => this.setState({showEditFail: false}, null), 4000)
        };

        if (this.state.mode === DynamicEditFieldMode.Edit) {
            return (
                <FormGroup style={style}>
                    <InputGroup bsSize="sm">
                        <InputGroup.Button>
                            <Button onClick={this.onCancelEdit} style={{display: "inline"}}>
                                <Glyphicon glyph="remove"/>
                            </Button>
                        </InputGroup.Button>
                        <FormControl type="text" style={this.state.feedback ? {color: "red"} : {}}
                                     value={this.format(this.state.value)}
                                     placeholder={this.props.placeHolder}
                                     onKeyPress={(evt) => this.onKeyPress(evt)}
                                     onChange={(evt) => this.onValueChanged(evt)}/>
                        <InputGroup.Button>
                            <Button bsStyle="success"
                                    disabled={!this.onCanAcceptEdit()}
                                    onClick={() => this.onAcceptEdit()}>
                                <Glyphicon glyph="ok"/>
                            </Button>
                        </InputGroup.Button>
                    </InputGroup>
                    {this.state.feedback ? <HelpBlock>{this.state.feedback}</HelpBlock> : null}
                </FormGroup>);
        } else {
            return (
                <div ref={node => this.overlayControl = node} style={staticDivStyle} onClick={() => this.onEdit()}>
                    <Overlay {...overlapProps}>
                        <Tooltip id="overload-left">{this.props.canEditFailMessage}</Tooltip>
                    </Overlay>
                    <a>{this.staticValueDisplay}</a>
                </div>);
        }
    }
}
