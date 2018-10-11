import * as React from "react";

import {displaySample, ISample} from "../../models/sample";
import {DynamicSimpleSelect} from "ndb-react-components";

export class SampleSelect extends DynamicSimpleSelect<ISample> {
    protected selectLabelForOption(option: ISample) {
        return displaySample(option);
    }
}
