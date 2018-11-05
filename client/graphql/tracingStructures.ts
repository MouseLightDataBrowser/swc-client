import gql from "graphql-tag";
import {Query} from "react-apollo";
import {ITracingStructure} from "../models/tracingStructure";

export const TRACING_STRUCTURES_QUERY = gql`query {
    tracingStructures {
        id
        name
        value
    }
}`;

type TracingStructuresQueryResponse = {
    tracingStructures: ITracingStructure[];
}

export class TracingStructuresQuery extends Query<TracingStructuresQueryResponse, {}> {
}
