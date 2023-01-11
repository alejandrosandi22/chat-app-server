import { gql } from 'apollo-server-core';

export const typeDefs = gql`
  scalar Date

  type Value {
    value: Boolean!
  }

  type Request {
    id: Int!
    content: String!
    sender: Int!
    receiver: Int!
    state: Boolean
    response: Boolean
    created_at: Date!
  }

  type Query {
    receiveRequest: [Request]!
  }

  type Mutation {
    sendRequest(receiver: Int!, content: String!): Request
    updateRequest(id: Int!, state: Boolean, response: Boolean): Value!
  }

  type Subscription {
    requestSended: Request
  }
`;
