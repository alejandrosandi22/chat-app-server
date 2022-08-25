import usersSchema from './users/schema';
import messagesSchema from './messages/schema';
import { mergeSchemas } from '@graphql-tools/schema';

const mergedSchema = mergeSchemas({
  schemas: [usersSchema, messagesSchema],
});

export default mergedSchema;
