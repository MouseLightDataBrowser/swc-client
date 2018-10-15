import * as React from "react";
import {displayNeuron, INeuron} from "../../models/neuron";
import {Dropdown, DropdownItemProps} from "semantic-ui-react";

interface INeuronForSampleSelectCellProps {
    neurons: INeuron[];
    selectedNeuron: INeuron;
    disabled?: boolean;

    onNeuronChange?(neuron: INeuron): void;
}


export class NeuronForSampleSelect extends React.Component<INeuronForSampleSelectCellProps, {}> {
    public constructor(props: INeuronForSampleSelectCellProps) {
        super(props);
    }

    private onNeuronChange(neuronId: string) {
        if (!this.props.selectedNeuron || neuronId !== this.props.selectedNeuron.id) {
            this.props.onNeuronChange(this.props.neurons.find((s) => s.id === neuronId) || null);
        }
    }

    public render() {
        const neuronOptions: DropdownItemProps[] = this.props.neurons.map(n => {
            return {
                key: n.id,
                text: displayNeuron(n),
                value: n.id
            }
        });

        return (
            <Dropdown
                placeholder={"Select a neuron..."}
                fluid selection options={neuronOptions}
                value={this.props.selectedNeuron ? this.props.selectedNeuron.id : null}
                disabled={this.props.disabled || this.props.neurons.length === 0}
                onChange={(e, {value}) => this.onNeuronChange(value as string)}/>
        );
    }
}
