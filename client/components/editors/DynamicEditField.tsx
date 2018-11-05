import * as React from "react";
import {Input} from "semantic-ui-react";

export enum DynamicEditFieldMode {
    Static,
    Edit
}

export interface IDynamicEditFieldProps {
    initialValue: any;
    placeHolder?: string;

    canEditFunction?(): boolean;
    canAcceptFunction?(value: string): boolean;
    acceptFunction?(value: string): any;
    filterFunction?(proposedValue: string): any;
    feedbackFunction?(proposedValue: string): any;
    formatFunction?(value: any, mode: DynamicEditFieldMode): string;
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
        } else {
            this.setState({showEditFail: true});
        }
    };

    private onCancelEdit = () => {
        this.setState({value: this.props.initialValue, mode: DynamicEditFieldMode.Static}, null);
    };

    private onCanAcceptEdit() {
        if (this.props.canAcceptFunction) {
            return this.props.canAcceptFunction(this.state.value);
        }

        return true;
    }

    private onAcceptEdit = async () => {
        if (this.props.acceptFunction) {
            await this.props.acceptFunction(this.state.value);
        }

        this.setState({mode: DynamicEditFieldMode.Static});
    };

    private onKeyPress = async (event: any) => {
        if ((event.charCode || event.which) === 13) {
            await this.onAcceptEdit();
        }
    };

    private onValueChanged = (event: any) => {
        let value = event.target.value;

        let feedback = this.state.feedback;

        if (this.props.feedbackFunction) {
            feedback = this.props.feedbackFunction(value);
        }

        if (this.props.filterFunction) {
            value = this.props.filterFunction(value);
        }

        if (value !== null) {
            this.setState({value, feedback});
        } else {
            this.setState({feedback});
        }
    };

    private format = (value: any) => {
        if (this.props.formatFunction) {
            return this.props.formatFunction(value, this.state.mode);
        }

        return value;
    };

    public componentWillReceiveProps(props: IDynamicEditFieldProps) {
        this.setState({
            initialPropValue: props.initialValue,
        });

        if (this.state.mode === DynamicEditFieldMode.Static) {
            this.setState({value: props.initialValue});
        }
    }

    public get staticValueDisplay() {
        if (this.state.value === undefined || this.state.value === null || this.state.value.length === 0) {
            return (<span style={{color: "#AAA"}}>{this.props.placeHolder}</span>)
        }

        return this.state.value;
    }

    public render() {
        if (this.state.mode === DynamicEditFieldMode.Edit) {
            return (
                <Input size="mini" fluid type="text" placeholder={this.props.placeHolder}
                       value={this.format(this.state.value)}
                       label={{icon: "cancel", size: "mini", onClick: this.onCancelEdit}} labelPosition="left"
                       action={{
                           icon: "check",
                           color: "teal",
                           size: "mini",
                           disabled: !this.onCanAcceptEdit(),
                           onClick: this.onAcceptEdit
                       }}
                       onKeyPress={this.onKeyPress}
                       onChange={this.onValueChanged}/>
            );
        } else {
            return (
                <a onClick={() => this.onEdit()}>{this.staticValueDisplay}</a>
            );
        }
    }
}
