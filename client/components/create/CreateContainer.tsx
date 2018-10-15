import * as React from "react";
import {Grid, Row, Col} from "react-bootstrap";

import {CreateTracing} from "./CreateTracing";
import {ITracingStructure} from "../../models/tracingStructure";

interface ICreateContainerProps {
    tracingStructures: ITracingStructure[];
    shouldClearCreateContentsAfterUpload: boolean;
}

export const CreateContainer = (props: ICreateContainerProps) => (
    <Grid fluid>
        <Row>
            <Col xs={12}>
                <CreateTracing tracingStructures={props.tracingStructures}
                               shouldClearCreateContentsAfterUpload={props.shouldClearCreateContentsAfterUpload}/>
            </Col>
        </Row>
    </Grid>
);
