import * as React from "react";

import {Tracings} from "./components/Tracings";
import {ITracingStructure} from "./models/tracingStructure";
import {CreateTracing} from "./components/create/CreateTracing";
import {Divider} from "semantic-ui-react";

interface IContentProps {
    tracingStructures: ITracingStructure[];
    shouldClearCreateContentsAfterUpload: boolean;
}

export const Content = (props: IContentProps) => (
    <div>
        <CreateTracing tracingStructures={props.tracingStructures} shouldClearCreateContentsAfterUpload={props.shouldClearCreateContentsAfterUpload}/>
        <Divider/>
        <Tracings tracingStructures={props.tracingStructures}/>
    </div>
);
