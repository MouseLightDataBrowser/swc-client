import * as React from "react";
import {Grid, Row, Col} from "react-bootstrap";
import {graphql} from 'react-apollo';
import gql from "graphql-tag";
import {GraphQLDataProps} from "react-apollo/lib/graphql";

import {TracingTable} from "./TracingTable";
import {ITracingStructure} from "../models/tracingStructure";

const TracingStructuresQuery = gql`query {
    tracingStructures {
        id
        name
        value
    }
}`;

interface ITracingStructuresQueryProps {
    tracingStructures: ITracingStructure[];
}

interface ICreateTracingProps {
    tracingStructuresQuery?: ITracingStructuresQueryProps & GraphQLDataProps;
}

interface ICreateTracingState {
    offset?: number;
    limit?: number;
}

@graphql(TracingStructuresQuery, {
    name: "tracingStructuresQuery"
})
export class Tracings extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: ICreateTracingProps) {
        super(props);

        this.state = {offset: 0, limit: 10};
    }

    private onUpdateOffsetForPage(page: number) {
        this.setState({offset: this.state.limit * (page - 1)}, null);
    }

    private onUpdateLimit(limit: number) {
        this.setState({limit: limit}, null);
    }

    public render() {
        const structures = this.props.tracingStructuresQuery && !this.props.tracingStructuresQuery.loading ? this.props.tracingStructuresQuery.tracingStructures : [];

        return (
            <Grid fluid>
                <Row>
                    <Col xs={12}>
                        <TracingTable tracingStructures={structures}
                              offset={this.state.offset}
                              limit={this.state.limit}
                              onUpdateOffsetForPage={page => this.onUpdateOffsetForPage(page)}
                              onUpdateLimit={limit => this.onUpdateLimit(limit)}/>
                    </Col>
                </Row>
            </Grid>
        );
    }
}
