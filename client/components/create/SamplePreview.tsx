import * as React from "react";
import {Card, Label, List} from "semantic-ui-react";

import {displaySampleAnimal, ISample} from "../../models/sample";
import {displayInjection, displayInjections, IInjection} from "../../models/injection";

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
            <Card fluid={true} style={this.props.sample.injections.length === 0 ? wellStyleDanger : {}}>
                <Card.Content header={this.props.sample.tag || "( no tag)"}/>
                <Card.Content>
                    <Injections injections={this.props.sample.injections}/>
                    <h5>Animal</h5>
                    {displaySampleAnimal(this.props.sample)}
                    <h5>Comments</h5>
                    {this.props.sample.comment || "(none)"}
                </Card.Content>
            </Card>
        );
    }
}

type InjectionsProps = {
    injections: IInjection[];
}

const Injections = (props: InjectionsProps) => {
    if (!props.injections.length || props.injections.length === 0) {
        return <span>Oops! Did you forget to add injections to the sample?</span>;
    }

    return (
        <div>
            <Label>{props.injections.length}<Label.Detail>Injections</Label.Detail></Label>
            <List bulleted>
                {props.injections.map(i => (<List.Item key={i.id} content={displayInjection(i)}/>))}
            </List>
        </div>
    )
};
