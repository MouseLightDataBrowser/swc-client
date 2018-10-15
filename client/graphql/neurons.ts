import gql from "graphql-tag";
import {Query} from "react-apollo";

import {INeuron} from "../models/neuron";

export const NEURONS_QUERY = gql`query ($sampleId: String) {
    neurons(sampleId: $sampleId) {
        id
        idNumber
        idString
        tag
        keywords
        x
        y
        z
        injection {
          id
          brainArea {
            id
            name
          }
        }
        brainArea {
          id
          name
        }
     }
}`;

type NeuronsForSampleQueryVariables = {
    sampleId: string;
}

type NeuronsForSampleQueryResponse = {
    neurons: INeuron[];
}

export class NeuronsForSampleQuery extends Query<NeuronsForSampleQueryResponse, NeuronsForSampleQueryVariables>{}
