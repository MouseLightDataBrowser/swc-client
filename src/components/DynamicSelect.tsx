import * as React from "react";
import * as ReactSelectClass from "react-select";
import {isNullOrUndefined} from "util";
import {Option} from "react-select";
import {FormGroup, InputGroup, Glyphicon} from "react-bootstrap";

interface IDynamicSelectOption {
    id: string;
}

interface IDynamicSelectProps<T> {
    isExclusiveEditMode?: boolean;
    isDeferredEditMode?: boolean;
    options: T[];
    selectedOption: T;
    disabled?: boolean;
    placeholder?: string;

    onSelect?(option: T): void;
}

interface IDynamicSelectState<T> {
    isInEditMode?: boolean;
    selectedOption?: T;
}

export class DynamicSelect<T extends IDynamicSelectOption> extends React.Component<IDynamicSelectProps<T>, IDynamicSelectState<T>> {
    public constructor(props: IDynamicSelectProps<T>) {
        super(props);

        this.state = {isInEditMode: false, selectedOption: props.selectedOption};
    }

    private onSelectChange(option: Option) {
        const selectedObject = this.props.options.filter(s => s.id === option.value)[0];

        if (this.isExclusiveEditMode || !this.isDeferredEditMode) {
            if (this.props.onSelect) {
                this.props.onSelect(selectedObject);
            }
        } else {
            this.setState({selectedOption: selectedObject});
        }
    }

    private onAcceptEdit() {
        this.setState({isInEditMode: false});

        if (this.props.onSelect) {
            this.props.onSelect(this.state.selectedOption);
        }
    }

    private onCancelEdit() {
        this.setState({isInEditMode: false, selectedOption: this.props.selectedOption});
    }

    private onRequestEditMode() {
        this.setState({isInEditMode: true});
    }

    private get isExclusiveEditMode() {
        return (isNullOrUndefined(this.props.isExclusiveEditMode) || this.props.isExclusiveEditMode);
    }

    private get isInEditMode() {
        return this.isExclusiveEditMode || this.state.isInEditMode;
    }

    private get isDeferredEditMode() {
        return !isNullOrUndefined(this.props.isDeferredEditMode) && this.props.isDeferredEditMode;
    }

    public componentWillReceiveProps(props: IDynamicSelectProps<T>) {
        if (this.isExclusiveEditMode || !this.isInEditMode) {
            this.setState({selectedOption: props.selectedOption});
        }
    }

    protected selectDisplayForOption(option: T): any {
        return option.toString();
    }

    protected staticDisplayForOption(option: T): any {
        return this.selectDisplayForOption(option);
    }

    private renderSelect(selected: Option, options: Option[]) {
        return (
            <ReactSelectClass
                name="tracing-structure-select"
                placeholder={this.props.placeholder || "Select..."}
                value={selected}
                options={options}
                clearable={false}
                disabled={this.props.disabled}
                style={{borderRadius: "0"}}
                onChange={(option: Option) => this.onSelectChange(option)}
            />
        );
    }

    public render() {
        let selection = null;

        const options = this.props.options.map(o => {
            const option = {label: this.selectDisplayForOption(o), value: o.id};

            if (this.state.selectedOption && (o.id === this.state.selectedOption.id)) {
                selection = option;
            }

            return option;
        });

        if (this.isInEditMode) {
            if (!this.isDeferredEditMode) {
                return this.renderSelect(selection, options);
            } else {
                return (
                    <FormGroup>
                        <InputGroup bsSize="sm">
                            <InputGroup.Addon onClick={() => this.onCancelEdit()}>
                                <Glyphicon glyph="remove"/>
                            </InputGroup.Addon>
                            {this.renderSelect(selection, options)}
                            <InputGroup.Addon onClick={() => this.onAcceptEdit()}>
                                <Glyphicon glyph="ok"/>
                            </InputGroup.Addon>
                        </InputGroup>
                    </FormGroup>
                );
            }
        } else {
            return (
                <a onClick={() => this.onRequestEditMode()}>{this.staticDisplayForOption(this.props.selectedOption)}</a>
            );
        }
    }
}
