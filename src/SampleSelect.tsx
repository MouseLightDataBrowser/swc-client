import * as React from "react";

import {displaySample, ISample} from "./models/sample";
import {DynamicSelect} from "./components/DynamicSelect";

export class SampleSelect extends DynamicSelect<ISample> {
    protected selectDisplayForOption(option: ISample) {
        return displaySample(option);
    }
}
