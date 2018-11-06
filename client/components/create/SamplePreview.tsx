import * as React from "react";
import {Card, Label, List} from "semantic-ui-react";

import {displaySampleAnimal, ISample} from "../../models/sample";
import {displayInjection, displayInjections, IInjection} from "../../models/injection";

const wellStyleDanger = {
    borderColor: "red",
    backgroundColor: "#F2DEDE"
};

type SampleProps = {
    sample: ISample
}

export const SamplePreview = (props: SampleProps) => {
    if (!props.sample) {
        return null;
    }

    return (
        <Card fluid={true} style={props.sample.injections.length === 0 ? wellStyleDanger : {}}>
            <Card.Content header={props.sample.tag || "( no tag)"}/>
            <Card.Content>
                <Injections injections={props.sample.injections}/>
                <h5>Animal</h5>
                {displaySampleAnimal(props.sample)}
                <h5>Comments</h5>
                {props.sample.comment || "(none)"}
            </Card.Content>
        </Card>
    );
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
