import * as React from "react";
import {Grid, Row, Col} from "react-bootstrap";

import {CreateTracing} from "./CreateTracing";

interface ICreateContainerProps {
    shouldClearCreateContentsAfterUpload: boolean;
}

interface ICreateContainerState {
}

export class CreateContainer extends React.Component<ICreateContainerProps, ICreateContainerState> {
    public render() {
        return (
            <Grid fluid>
                <Row>
                    <Col xs={12}>
                        <CreateTracing
                            shouldClearCreateContentsAfterUpload={this.props.shouldClearCreateContentsAfterUpload}/>
                    </Col>
                </Row>
            </Grid>
        );
    }
}
