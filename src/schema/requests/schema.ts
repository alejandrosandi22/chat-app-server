import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';
import { makeExecutableSchema } from '@graphql-tools/schema';

const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

export default schema;
