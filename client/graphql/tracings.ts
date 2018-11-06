import gql from "graphql-tag";
import {Mutation, Query} from "react-apollo";

import {ISwcTracing} from "../models/swcTracing";

const TracingFieldsFragment = gql`fragment TracingFields on SwcTracing {
      id
      filename
      annotator
      offsetX
      offsetY
      offsetZ
      nodeCount
      createdAt
      updatedAt
      neuron {
        id
        idNumber
        idString
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
      tracingStructure {
        id
        name
        value
      }
}`;

export const TRACINGS_QUERY = gql`query TracingsQuery ($pageInput: SwcTracingPageInput) {
  tracings(pageInput: $pageInput) {
    offset
    limit
    totalCount
    tracings {
      ...TracingFields
    }
  }
}
${TracingFieldsFragment}
`;


type TracingsQueryPageInput = {
    offset: number;
    limit: number;
    neuronIds?: string[];
    tracingStructureId?: string;
}

type TracingsQueryVariables = {
    pageInput: TracingsQueryPageInput;
}

type TracingsData = {
    offset: number;
    limit: number;
    totalCount: number;
    tracings: ISwcTracing[];
}

type TracingsQueryResponse = {
    tracings: TracingsData;
}

export class TracingsQuery extends Query<TracingsQueryResponse, TracingsQueryVariables> {
}


//
// Tracing Count (transformed) for Tracing Query
//

export const TRACING_COUNTS_FOR_TRACING_QUERY = gql`query TransformedTracingCounts($ids: [String!]) {
  transformedTracingCounts(ids: $ids) {
    counts {
        swcTracingId
        count
    }
    error {
      name
      message
    }
  }
}`;

type TracingCountsForTracingVariables = {
    ids: string[];
}

export type SwcTracingCount = {
    swcTracingId: string;
    count: number;
}

type TracingCountsForTracingData = {
    counts: SwcTracingCount[];
    error: {
        name: string;
        message: string;
    }
}

type TracingCountsForTracingResponse = {
    transformedTracingCounts: TracingCountsForTracingData;
}

export class TracingCountsTracingQuery extends Query<TracingCountsForTracingResponse, TracingCountsForTracingVariables> {
}

//
// Update Tracing Mutation
//

export const UPDATE_TRACING_MUTATION = gql`mutation UpdateSwcTracing($tracing: SwcTracingInput) {
  updateTracing(tracing: $tracing) {
    tracing {
      ...TracingFields
    }
    error {
      name
      message
    }
  }
}
${TracingFieldsFragment}
`;

type UpdateTracingVariables = {
    tracing: {
        id: string;
        annotator?: string;
        neuronId?: string;
        tracingStructureId?: string;
    }
}

type UpdateTracingMutationData = {
    tracing: ISwcTracing;
    error: {
        name: string;
        message: string;
    }
}

type UpdateTracingMutationResponse = {
    updateTracing: UpdateTracingMutationData;
}

export class UpdateTracingMutation extends Mutation<UpdateTracingMutationResponse, UpdateTracingVariables> {
}

//
// Upload/Create Tracing Mutation
//

export const UPLOAD_TRACING_MUTATION = gql`
  mutation uploadSwc($annotator: String, $neuronId: String, $structureId: String, $file: Upload) {
  uploadSwc(annotator: $annotator, neuronId: $neuronId, structureId: $structureId, file: $file) {
    tracing {
      id
      annotator
      nodeCount
      filename
      tracingStructure {
        id
        name
        value
      }
      neuron {
        id
        idNumber
        idString
      }
    }
    transformSubmission
    error {
      name
      message
    }
  }
}`;

type UploadTracingVariables = {
    annotator: string;
    neuronId: string;
    structureId: string;
    file: File
}

export type UploadTracingMutationData = {
    tracing: ISwcTracing;
    transformSubmission: boolean;
    error: {
        name: string;
        message: string;
    }
}

export type UploadTracingMutationResponse = {
    uploadSwc: UploadTracingMutationData;
}

export class UploadTracingMutation extends Mutation<UploadTracingMutationResponse, UploadTracingVariables> {
}

//
// Delete Tracing Mutation
//

export const DELETE_TRACING_MUTATION = gql`mutation deleteTracing($id: String!) {
  deleteTracing(id: $id) {
    error {
      name
      message
    }
  }
}`;

type DeleteTracingVariables = {
    id: string;
}

type DeleteTracingMutationData = {
    error: {
        name: string;
        message: string;
    }
}

type DeleteTracingMutationResponse = {
    deleteTracing: DeleteTracingMutationData;
}

export class DeleteTracingMutation extends Mutation<DeleteTracingMutationResponse, DeleteTracingVariables> {
}
