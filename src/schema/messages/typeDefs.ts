import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  type Message {
    id: ID
    date: Date
    content: String!
    filename: String
    sender: Int!
    receiver: Int!
    type: String!
    created_at: Date
  }
  type Query {
    getMessages(contactId: Int!, offset: Int!, limit: Int!): [Message]
    getLastMessage(contactId: String!, userId: String!): Message
  }

  type Mutation {
    sendMessage(
      content: String!
      filename: String
      receiver: Int!
      type: String!
    ): Message
  }

  type Subscription {
    messegeSended: Message
  }
`;
