/* eslint-disable @typescript-eslint/no-explicit-any */
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
      _: any,
      { contactId, offset }: { contactId: number; offset: number },
      context: any
    ) => {
      const userId = context.user.id;
      const messages = await pool.query(
        `SELECT * FROM messages WHERE (sender = ${userId} AND receiver = ${contactId}) OR (sender = ${contactId} AND receiver = ${userId}) ORDER BY created_at DESC LIMIT 10 OFFSET ${offset}`
      );

      const decryptMessages: MessageType[] = messages.rows
        .reduce((acc, curr) => {
          acc.push({
            ...curr,
            content: cryptr.decrypt(curr.content),
          });
          return acc;
        }, [])
        .reverse();

      let date = '';

      const getDate = (date: string) => {
        const dateObj = new Date(date);
        return `${dateObj.getDate()}/${dateObj.getMonth() + 1 < 10 ? 0 : ''}${
          dateObj.getMonth() + 1
        }/${dateObj.getFullYear()}`;
      };

      return decryptMessages.map((message) => {
        if (date !== getDate(message.created_at)) {
          date = getDate(message.created_at);
          return {
            date: message.created_at,
            ...message,
          };
        }
        return message;
      });
    },
    getLastMessage: async (
      _: any,
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
    sendMessage: async (_: any, args: any, { user }: { user: UserType }) => {
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
