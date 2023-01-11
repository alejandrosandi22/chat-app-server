import { pool } from '../../database';
import Cryptr from 'cryptr';
import { MessageType, UserType } from '../../types';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const cryptr = new Cryptr(process.env.ACCESS_TOKEN_SECRET);
enum SUBSCRIPTIONS {
  MESSAGE_SENDED = 'MESSAGE_SENDED',
}

export const resolvers = {
  Subscription: {
    messegeSended: {
      subscribe: () => pubsub.asyncIterator([SUBSCRIPTIONS.MESSAGE_SENDED]),
    },
  },
  Query: {
    getMessages: async (
      _: unknown,
      {
        contactId,
        offset,
        limit,
      }: { contactId: number; offset: number; limit: number },
      { user }: { user: UserType }
    ) => {
      const userId = user.id;

      const messages = await pool.query(
        `SELECT * FROM messages WHERE (sender = ${userId} AND receiver = ${contactId}) OR (sender = ${contactId} AND receiver = ${userId}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${
          offset * limit
        }`
      );

      return messages.rows
        .reduce((acc, curr) => {
          acc.push({
            ...curr,
            content: cryptr.decrypt(curr.content),
          });
          return acc;
        }, [])
        .reverse();
    },
    getLastMessage: async (
      _: unknown,
      { contactId, userId }: { contactId: string; userId: string }
    ) => {
      try {
        const messages = await pool.query(
          `SELECT * FROM messages WHERE (sender = ${userId} AND receiver = ${contactId}) OR (sender = ${contactId} AND receiver = ${userId}) ORDER BY created_at DESC LIMIT 1`
        );
        return messages.rows[0];
      } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
      }
    },
  },
  Mutation: {
    sendMessage: async (
      _: unknown,
      args: MessageType,
      { user }: { user: UserType }
    ) => {
      const id = user.id;
      const content = cryptr.encrypt(args.content);
      try {
        const message = await pool.query(
          `INSERT INTO messages (id, sender, receiver, content, type, filename ,created_at)
          VALUES (default, '${id}', '${args.receiver}', '${content}', '${args.type}' ,'${args.fileName}', default) RETURNING *`
        );

        pubsub.publish(SUBSCRIPTIONS.MESSAGE_SENDED, {
          messegeSended: message.rows[0],
        });
        return message.rows[0];
      } catch (error: unknown) {
        if (error instanceof Error) throw new Error(error.message);
      }
    },
  },
};
