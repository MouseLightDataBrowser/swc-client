import * as React from "react";

import {Tracings} from "./components/Tracings";
import {CreateContainer} from "./components/create/CreateContainer";
import {ITracingStructure} from "./models/tracingStructure";

interface IContentProps {
    tracingStructures: ITracingStructure[];
    shouldClearCreateContentsAfterUpload: boolean;
}

export const Content = (props: IContentProps) => (
    <div>
        <CreateContainer tracingStructures={props.tracingStructures} shouldClearCreateContentsAfterUpload={props.shouldClearCreateContentsAfterUpload}/>
        <Tracings tracingStructures={props.tracingStructures}/>
    </div>
);
