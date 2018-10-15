import * as React from "react";
import {Grid, Row, Col} from "react-bootstrap";

import {TableWithTracings} from "./TracingTable";
import {ITracingStructure} from "../models/tracingStructure";

interface ICreateTracingProps {
    tracingStructures: ITracingStructure[];
}

interface ICreateTracingState {
    offset?: number;
    limit?: number;
}

export class Tracings extends React.Component<ICreateTracingProps, ICreateTracingState> {
    public constructor(props: ICreateTracingProps) {
        super(props);

        this.state = {offset: 0, limit: 10};
    }

    private onUpdateOffsetForPage(page: number) {
        this.setState({offset: this.state.limit * (page - 1)}, null);
    }

    private onUpdateLimit(limit: number) {
        console.log(limit);
        this.setState({limit: limit}, null);
    }

    public render() {
        return (
            <Grid fluid>
                <Row>
                    <Col xs={12}>
                        <TableWithTracings tracingStructures={this.props.tracingStructures}
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
