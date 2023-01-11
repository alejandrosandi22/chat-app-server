import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date

  type LastMessage {
    id: ID
    content: String!
    type: String!
    created_at: Date
  }

  type Token {
    token: String!
  }

  type Response {
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
    getUser(username: String, id: Int): User
    getCurrentUser: User
    getContacts(userId: Int): [User]
    searchUsers(search: String): [User]
    getAllUsers(limit: Int!, offset: Int!): [User]
  }

  type Mutation {
    signIn(email: String!, password: String!): Token!
    signUp(
      name: String!
      email: String!
      username: String!
      password: String!
    ): Token!
    updateUser(
      userId: Int
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
    changePassword(password: String!, id: ID!): Response
    deleteUser(email: String!): User
    forgetPassword(email: String!): Response
  }
`;
