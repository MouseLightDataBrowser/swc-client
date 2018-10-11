import * as React from "react";
import {Badge} from "react-bootstrap";

import {displayTracingStructure, ITracingStructure, TracingStructure} from "../../models/tracingStructure";
import {DynamicSimpleSelect} from "ndb-react-components";

export class TracingStructureSelect extends DynamicSimpleSelect<ITracingStructure> {
    protected selectLabelForOption(option: ITracingStructure): any {
        return displayTracingStructure(option);
    }

    protected staticDisplayForOption(option: ITracingStructure): any {
        const isAxon = option.value === TracingStructure.axon;

        return (
            <span>
                <Badge>{isAxon ? "A" : "D"}</Badge>
                &nbsp;{displayTracingStructure(option)}
            </span>
        );
    }
}
