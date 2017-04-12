import * as React from "react";
import {Badge} from "react-bootstrap";

import {displayTracingStructure, ITracingStructure, TracingStructure} from "./models/tracingStructure";

import {DynamicSelect} from "./components/DynamicSelect";

export class TracingStructureSelect extends DynamicSelect<ITracingStructure> {
    protected selectDisplayForOption(option: ITracingStructure): any {
        return displayTracingStructure(option);
    }

    protected staticDisplayForOption(option: ITracingStructure): any {
        const isAxon = option.value === TracingStructure.axon;

        return (
            <span>
                <Badge >{isAxon ? "A" : "D"}</Badge>
                &nbsp;{displayTracingStructure(option)}
            </span>
        );
    }
}
