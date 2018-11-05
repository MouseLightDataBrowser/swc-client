import gql from "graphql-tag";
import {ITracingStructure} from "../models/tracingStructure";
import {graphql} from "react-apollo";
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

type SamplesQueryInputProps = {
    tracingStructures: ITracingStructure[];
    shouldClearCreateContentsAfterUpload: boolean;
}

type SamplesQueryResponse = {
    samples: ISample[];
}

export interface ISamplesQueryChildProps {
    samples: ISample[];
    tracingStructures: ITracingStructure[];
    shouldClearCreateContentsAfterUpload: boolean;
}

export const SamplesQuery = graphql<SamplesQueryInputProps, SamplesQueryResponse, {}, ISamplesQueryChildProps>(SAMPLES_QUERY, {
    options: {
    },
    props: ({data, ownProps}) => ({
        samples: data.samples || [],
        ...ownProps
    })
});