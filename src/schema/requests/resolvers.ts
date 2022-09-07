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
      { contactId }: { contactId: number },
      { user }: { user: UserType }
    ) => {
      const { id } = user;

      if (contactId) {
        const requests = await pool.query(
          `SELECT * FROM requests WHERE (sender = ${id} AND receiver = ${contactId}) OR (sender = ${contactId} AND receiver = ${id}) ORDER BY created_at ASC`
        );
        return requests[0];
      }

      const requests = await pool.query(
        `SELECT * FROM requests WHERE receiver = ${id} ORDER BY created_at ASC`
      );

      return requests[0];
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
        const sendRequest: any = await pool.query(
          `INSERT INTO requests (id, content, sender, receiver, state, response, created_at) VALUES (default, '${content}', ${id}, ${receiver}, default, default, default);`
        );

        const newRequest: any = await pool.query(
          `SELECT * FROM requests WHERE id = ${sendRequest[0].insertId}`
        );

        pubsub.publish(SUBSCRIPTIONS.REQUEST_SENDED, {
          requestSended: newRequest[0][0],
        });
        return newRequest[0][0];
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
            `UPDATE requests SET state = ${state} WHERE id = ${id};`
          );
          return { value: state };
        }
        if (response !== undefined) {
          await pool.query(
            `UPDATE requests SET response = ${response} WHERE id = ${id};`
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
