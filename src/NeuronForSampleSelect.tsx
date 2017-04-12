import * as React from "react";
import {graphql} from 'react-apollo';
import gql from "graphql-tag";
import {GraphQLDataProps} from "react-apollo/lib/graphql";

import {INeuron} from "./models/neuron";
import {ISample} from "./models/sample";
import {NeuronSelect} from "./NeuronSelectCell";

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
}

@graphql(NeuronsQuery, {
    name: "neuronsQuery",
    options: ({sample}) => ({variables: {sampleId: sample.id}, pollInterval: 5000}),
    skip: (ownProps) => ownProps.sample === null
})
export class NeuronForSampleSelect extends React.Component<INeuronForSampleSelectCellProps, INeuronForSampleSelectCellState> {
    public render() {

        const neurons = this.props.neuronsQuery && !this.props.neuronsQuery.loading ? this.props.neuronsQuery.neurons : [];

        return (
            <NeuronSelect options={neurons}
                          selectedOption={this.props.selectedNeuron}
                          disabled={this.props.disabled}
                          placeholder={this.props.placeholder}
                          onSelect={this.props.onNeuronChange}/>
        );
    }
}

