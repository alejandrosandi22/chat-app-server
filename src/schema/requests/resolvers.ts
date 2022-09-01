import { pool } from '../../database';
import { PubSub } from 'graphql-subscriptions';
import { UserType } from '../../types';

const pubsub = new PubSub();

enum SUBSCRIPTIONS {
  REQUEST_SENDED = 'REQUEST_SENDED',
}

export const resolvers = {
  Subscription: {
    requestSended: {
      subscribe: () => pubsub.asyncIterator([SUBSCRIPTIONS.REQUEST_SENDED]),
    },
  },
  Query: {
    receiveRequest: async (
      _: unknown,
      __: unknown,
      { user }: { user: UserType }
    ) => {
      const { id } = user;
      const requests = await pool.query(
        `SELECT * FROM requests WHERE receiver = ${id} ORDER BY created_at ASC`
      );

      return requests.rows;
    },
  },
  Mutation: {
    sendRequest: async (
      _: unknown,
      { receiver, content }: { receiver: number; content: string },
      { user }: { user: UserType }
    ) => {
      const { id } = user;

      try {
        const newRequest = await pool.query(
          `INSERT INTO requests (id, content, sender, receiver, state, response, created_at) VALUES (default, '${content}', ${id}, ${receiver}, default, default, default) RETURNING *`
        );

        pubsub.publish(SUBSCRIPTIONS.REQUEST_SENDED, {
          requestSended: newRequest.rows[0],
        });
        return newRequest.rows[0];
      } catch (error: unknown) {
        if (error instanceof Error) throw new Error(error.message);
      }
    },
    updateRequest: async (
      _: unknown,
      {
        id,
        state,
        response,
      }: { id: number; state?: boolean; response?: boolean }
    ) => {
      try {
        if (state) {
          await pool.query(
            `UPDATE requests SET state = ${state} WHERE id = ${id} RETURNING *`
          );
          return { value: state };
        }
        if (response !== undefined) {
          await pool.query(
            `UPDATE requests SET response = ${response} WHERE id = ${id} RETURNING *`
          );
          return { value: response };
        }
        return null;
      } catch (error: unknown) {
        if (error instanceof Error) throw new Error(error.message);
      }
    },
  },
};
