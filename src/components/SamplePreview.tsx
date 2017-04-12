import * as React from "react";
import {Well, Badge} from "react-bootstrap";

import {displaySampleAnimal, ISample} from "../models/sample";
import {displayInjections} from "../models/injection";

const wellStyleDanger = {
    borderColor: "red",
    backgroundColor: "#F2DEDE"
};

interface ISampleProps {
    sample: ISample
}

interface ISampleState {
}

export class SamplePreview extends React.Component<ISampleProps, ISampleState> {
    public render() {
        if (!this.props.sample) {
            return null;
        }

        return (
            <Well style={this.props.sample.injections.length === 0 ? wellStyleDanger : {}}>
                <h5>Tag</h5>
                {this.props.sample.tag || "(none)"}
                <h5>Injections&nbsp;<Badge>{this.props.sample.injections.length}</Badge></h5>
                {displayInjections(this.props.sample.injections, "Oops! Did you forget to add injections to the sample?")}
                <h5>Animal</h5>
                {displaySampleAnimal(this.props.sample)}
                <h5>Comments</h5>
                {this.props.sample.comment || "(none)"}
            </Well>
        );
    }
}
