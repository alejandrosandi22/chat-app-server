import usersSchema from './users/schema';
import messagesSchema from './messages/schema';
import requestsSchema from './requests/schema';
import { mergeSchemas } from '@graphql-tools/schema';

const mergedSchema = mergeSchemas({
  schemas: [usersSchema, messagesSchema, requestsSchema],
});

export default mergedSchema;
