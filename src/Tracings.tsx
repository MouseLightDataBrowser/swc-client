import * as React from "react";

import {TracingCreateComponent} from "./tracing/CreateTracing";

export class Tracings extends React.Component<any, any> {
    render() {
        return (
            <div>
                <TracingCreateComponent/>
            </div>
        );
    }
}