import gql from "graphql-tag";
import {Query} from "react-apollo";
import {ITracingStructure} from "../models/tracingStructure";
import {ISample} from "../models/sample";

export const APP_QUERY = gql`query AppQuery {
    tracingStructures {
        id
        name
        value
    }
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

type AppQueryQueryResponse = {
    tracingStructures: ITracingStructure[];
    samples: ISample[];
}

export class AppQuery extends Query<AppQueryQueryResponse, {}> {
}
