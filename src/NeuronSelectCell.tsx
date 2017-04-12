import * as React from "react";
//import * as ReactSelectClass from "react-select";
//import {Option} from "react-select";

import {displayNeuron, INeuron} from "./models/neuron";

import {DynamicSelect} from "./components/DynamicSelect";

export class NeuronSelect extends DynamicSelect<INeuron> {
    protected selectDisplayForOption(option: INeuron) {
        return displayNeuron(option);
    }
}
