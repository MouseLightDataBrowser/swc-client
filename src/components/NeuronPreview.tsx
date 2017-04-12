import * as React from "react";
import {Well} from "react-bootstrap";

import {INeuron} from "../models/neuron";
import {formatNodeCoords} from "../models/swcNode";

interface INeuronProps {
    neuron: INeuron
}

interface INeuronState {
}

export class NeuronPreview extends React.Component<INeuronProps, INeuronState> {
    public render() {
        if (!this.props.neuron) {
            return null;
        }

        return (
            <Well>
                <h5>Soma Coordinates (unregistered)</h5>
                {formatNodeCoords(this.props.neuron.x, this.props.neuron.y, this.props.neuron.z)}
                <h5>Tag</h5>
                {this.props.neuron.tag || "(none)"}
                <h5>Keywords</h5>
                {this.props.neuron.keywords || "(none)"}
            </Well>
        );
    }
}
