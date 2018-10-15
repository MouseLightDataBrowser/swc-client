import gql from "graphql-tag";

export const TracingStructuresQuery = gql`query {
    tracingStructures {
        id
        name
        value
    }
}`;
