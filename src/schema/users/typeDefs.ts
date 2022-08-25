import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  type LastMessage {
    id: ID
    content: String!
    type: String!
    created_at: Date
  }

  type Value {
    value: String!
  }

  type RemoveValue {
    value: Boolean!
    message: String!
  }

  type Contact {
    id: Int!
    name: String!
    email: String!
    username: String!
  }

  type User {
    id: Int!
    name: String!
    email: String!
    username: String!
    password: String
    avatar: String
    cover_photo: String
    website: String
    description: String
    provider: String!
    show_profile_photo: String
    contacts_request: String
    lastMessage: LastMessage
    contacts: [Int]!
    created_at: Date
    updated_at: Date
  }
  type Query {
    getUser(username: String!): User
    getCurrentUser: User
    getContacts(userId: Int): [User]
    searchUsers(search: String): [User]
  }

  type Mutation {
    signIn(email: String!, password: String!): Value
    signUp(
      name: String!
      email: String!
      username: String!
      password: String!
    ): Value
    updateUser(
      id: ID
      name: String
      username: String
      avatar: String
      cover_photo: String
      website: String
      description: String
      show_profile_photo: String
      contacts_request: String
      contacts: [Int]
    ): User
    removeContact(id: Int!): User
    changePassword(password: String!, id: ID!): User
    deleteUser(email: String!): User
  }
`;
