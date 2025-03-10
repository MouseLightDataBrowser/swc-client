import gql from "graphql-tag";
import {Query} from "react-apollo";

import {ISample} from "../models/sample";

const SAMPLES_QUERY = gql`query {
    samples {
        id
        idNumber
        animalId
        tag
        comment
        sampleDate
        createdAt
        updatedAt
        injections {
          id
          brainArea {
            id
            name
          }
        }
        mouseStrain {
            name
        }
    }
}`;

type SamplesQueryResponse = {
    samples: ISample[];
}

export class SamplesQuery extends Query<SamplesQueryResponse, {}> {
}
