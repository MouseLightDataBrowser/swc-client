import * as React from "react";

import {displayNeuron, INeuron} from "../../models/neuron";
import {DynamicSimpleSelect} from "ndb-react-components";

export class NeuronSelect extends DynamicSimpleSelect<INeuron> {
    protected selectLabelForOption(option: INeuron) {
        return displayNeuron(option);
    }
}
