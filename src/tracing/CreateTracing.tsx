import * as React from "react";

import {
    Grid,
    Row,
    Col,
    Panel,
    Button,
    FormGroup,
    ControlLabel,
    FormControl,
    Glyphicon,
    Alert,
    HelpBlock
} from "react-bootstrap";

import gql from "graphql-tag/index";
import {graphql} from 'react-apollo';

import {ISample} from "../models/sample";
import {INeuron} from "../models/neuron";
import {IInjection} from "../models/injection";

interface ICreateTracingProps {
    data?: any;
}

interface ICreateTracingState {
    files?: File[];
    annotator?: string;
    structure?: string;
    neuron?: INeuron;
    sample?: ISample;
    injection?: IInjection;
}

const SamplesQuery = gql`query {
    samples {
        id
        idNumber
        sampleDateString
    }
}`;

@graphql(SamplesQuery)
export class TracingCreateComponent extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: any) {
        super(props);

        this.state = {
            files: [],
            sample: null,
            neuron: null,
            injection: null
        }
    }

    public render() {
        // let nameHelp = this.state.name.length === 0 ? "Name can not be empty" : "";

        console.log(this.props.data);

        return (
            <Panel collapsible defaultExpanded header="Create Pipeline" bsStyle="info">
                <Grid fluid>
                </Grid>
            </Panel>
        );
    }
}