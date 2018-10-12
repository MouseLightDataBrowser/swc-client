import * as React from "react";
import {graphql} from 'react-apollo';
import gql from "graphql-tag";
import {GraphQLDataProps} from "react-apollo/lib/graphql";

import {displayNeuron, INeuron} from "../../models/neuron";
import {ISample} from "../../models/sample";
import {Dropdown, DropdownItemProps} from "semantic-ui-react";

const NeuronsQuery = gql`query ($sampleId: String) {
    neurons(sampleId: $sampleId) {
        id
        idNumber
        idString
        tag
        keywords
        x
        y
        z
        injection {
          id
          brainArea {
            id
            name
          }
        }
        brainArea {
          id
          name
        }
     }
}`;

interface INeuronForSampleQueryProps {
    neurons: INeuron[];
}


interface INeuronForSampleSelectCellProps {
    sample: ISample;
    selectedNeuron: INeuron;
    neuronsQuery?: INeuronForSampleQueryProps & GraphQLDataProps;
    placeholder?: string;
    disabled?: boolean;

    onNeuronChange?(neuron: INeuron): void;
}

interface INeuronForSampleSelectCellState {
    neurons: INeuron[];
}

@graphql(NeuronsQuery, {
    name: "neuronsQuery",
    options: ({sample}) => ({variables: {sampleId: sample.id}, pollInterval: 5000}),
    skip: (ownProps) => ownProps.sample === null
})
export class NeuronForSampleSelect extends React.Component<INeuronForSampleSelectCellProps, INeuronForSampleSelectCellState> {
    public constructor(props: INeuronForSampleSelectCellProps) {
        super(props);

        this.state = {
            neurons: props.neuronsQuery && !props.neuronsQuery.loading ? props.neuronsQuery.neurons : []
        }
    }

    private onNeuronChange(neuronId: string) {
        if (!this.props.selectedNeuron || neuronId !== this.props.selectedNeuron.id) {
            this.props.onNeuronChange(this.state.neurons.find((s) => s.id === neuronId));
        }
    }

    public componentWillReceiveProps(props: INeuronForSampleSelectCellProps) {
        this.setState({neurons: props.neuronsQuery && !props.neuronsQuery.loading ? props.neuronsQuery.neurons : []});
    }

    public render() {
        const neuronOptions: DropdownItemProps[] = this.state.neurons.map(n => {
            return {
                key: n.id,
                text: displayNeuron(n),
                value: n.id
            }
        });

        return (
            <Dropdown placeholder={this.props.sample ? "Select a neuron..." : "Select a sample to select a neuron..."} fluid selection options={neuronOptions}
                      value={this.props.selectedNeuron ? this.props.selectedNeuron.id : null}
                      disabled={this.props.disabled}
                      onChange={(e, {value}) => this.onNeuronChange(value as string)}/>
        );
    }
}

