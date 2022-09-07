import { pool } from '../../database';
import bctypt from 'bcryptjs';
import { UserInputError } from 'apollo-server-express';
import Cryptr from 'cryptr';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { MessageType, UserType } from '../../types';
import { createTransport } from 'nodemailer';
import { template } from '../../utils/template';

const cryptr = new Cryptr(process.env.ACCESS_TOKEN_SECRET);

export const resolvers = {
  Query: {
    getUser: async (
      _: unknown,
      { username, id }: { username: string; id: number }
    ) => {
      try {
        if (username) {
          const [rows]: any = await pool.query(
            `SELECT * FROM users WHERE username = '${username}';`
          );
          const user: UserType = rows[0];
          return user;
        }
        const [rows]: any = await pool.execute(
          `SELECT * FROM users WHERE id = ${id};`
        );
        const user: UserType = rows[0];
        return user;
      } catch (error) {
        if (error instanceof Error) throw new UserInputError(error.message);
      }
    },
    getAllUsers: async (
      _: unknown,
      { limit, offset }: { limit: number; offset: number }
    ) => {
      const [rows] = await pool.query(
        `SELECT * FROM users ORDER BY contacts DESC LIMIT ${limit} OFFSET ${
          limit * offset
        };`
      );
      return rows;
    },
    getContacts: async (
      _: unknown,
      { userId }: { userId: number },
      { user }: { user: UserType }
    ) => {
      const id = userId ?? user.id;

      try {
        const [rows]: any = await pool.query(`SELECT * FROM users;`);

        const contacts: UserType[] = rows.filter((contact: UserType) =>
          contact.contacts.includes(id)
        );

        const contactsWithLastMessage = await Promise.all(
          contacts.map(async (contact: { id: number }) => {
            const lastMessageRows: any = await pool.query(
              `SELECT * FROM messages WHERE (sender = ${id} AND receiver = ${contact.id}) OR (sender = ${contact.id} AND receiver = ${id}) ORDER BY created_at DESC LIMIT 1;`
            );

            const lastMessage: MessageType[] = lastMessageRows[0];

            if (!lastMessage.length)
              return {
                ...contact,
                lastMessage: {
                  id: 0,
                  content: '',
                  type: '',
                  created_at: null,
                },
              };

            return {
              ...contact,
              lastMessage: {
                ...lastMessage[0],
                content: cryptr.decrypt(lastMessage[0].content),
                created_at: lastMessage[0].created_at,
              },
            };
          })
        );

        return contactsWithLastMessage;
      } catch (error: unknown) {
        if (error instanceof Error) throw new UserInputError(error.message);
      }
    },
    getCurrentUser: async (
      _: unknown,
      __: unknown,
      { user }: { user: UserType }
    ) => {
      try {
        return user;
      } catch (error) {
        if (error instanceof Error) throw new UserInputError(error.message);
      }
    },
    searchUsers: async (
      _: unknown,
      { search }: { search: string },
      { user }: { user: UserType }
    ) => {
      const id = user.id;

      try {
        const [rows]: any = await pool.query(
          `SELECT * FROM users WHERE id != ${id} AND username LIKE '%${search}%' OR name LIKE '%${search}%' LIMIT 10;`
        );

        return rows;
      } catch (error: unknown) {
        if (error instanceof Error) throw new UserInputError(error.message);
      }
    },
  },
  Mutation: {
    signIn: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const [rows]: any = await pool.query(
        `SELECT * FROM users WHERE email = '${email}';`
      );

      const user = rows[0];

      if (!user) {
        throw new UserInputError('Incorrect email or password');
      }
      const isMatch = await bctypt.compare(password, user.password);
      if (!isMatch) {
        throw new UserInputError('Incorrect email or password');
      }

      const tokenData = {
        id: user.id,
      };

      const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '8d',
      });

      return {
        token,
      };
    },
    signUp: async (_: unknown, args: UserType) => {
      const findUserByEmail: any = await pool.query(
        `SELECT * FROM users WHERE email = '${args.email}';`
      );

      const findUserByUsername: any = await pool.query(
        `SELECT * FROM users WHERE username = '${args.username}';`
      );

      if (findUserByEmail[0].length > 0) {
        throw new UserInputError('User already exists');
      }

      if (findUserByUsername[0].length > 0) {
        throw new UserInputError('Username already exists');
      }

      const hashedPassword = await bctypt.hash(args.password as string, 10);

      const newUser: any = await pool.query(
        `INSERT INTO users (id, name, email, username, password, avatar, cover_photo, description, website, provider, show_profile_photo, show_email, contacts, created_at, updated_at)
          VALUES (default, '${args.name}', '${args.email}', '${args.username}', '${hashedPassword}', '/static/images/user.png', null, '-', '-', 'email' ,default, default, '[]', default, default);`
      );

      const tokenData = {
        id: newUser[0].insertId,
      };

      const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '8d',
      });

      return {
        token,
      };
    },
    updateUser: async (
      _: unknown,
      args: UserType,
      { user: currentUser }: { user: UserType }
    ) => {
      try {
        const userId = args.userId ?? currentUser.id;

        const getUser: any = await pool.query(
          `SELECT * FROM users WHERE id = ${userId}`
        );
        const user = getUser[0][0];
        const contacts = user.contacts;

        const data = {
          name: args.name ?? user.name,
          username: args.username ?? user.username,
          avatar: args.avatar ?? user.avatar,
          cover_photo: args.cover_photo ?? user.cover_photo,
          website: args.website ?? user.website,
          description: args.description ?? user.description,
          show_profile_photo:
            args.show_profile_photo ?? user.show_profile_photo,
          show_email: args.show_email ?? user.show_email,
          contacts: args.contacts
            ? contacts.concat(args.contacts)
            : user.contacts,
        };

        await pool.query(
          `UPDATE users SET name = '${data.name}', username = '${data.username}', avatar = '${data.avatar}', cover_photo = '${data.cover_photo}', website = '${data.website}', description = '${data.description}', show_profile_photo = '${data.show_profile_photo}', show_email = '${data.show_email}', contacts = '[${data.contacts}]', updated_at = default WHERE id = ${userId};`
        );

        const userUpdated: any = await pool.query(
          `SELECT * FROM users WHERE id = ${userId}`
        );

        return userUpdated[0][0];
      } catch (error: unknown) {
        if (error instanceof Error) throw new UserInputError(error.message);
      }
    },
    removeContact: async (
      _: unknown,
      args: UserType,
      { user: currentUser }: { user: UserType }
    ) => {
      try {
        const userId = currentUser.id;
        const contactId = args.id;

        const getUser: any = await pool.query(
          `SELECT * FROM users WHERE id = ${userId}`
        );

        const getContact: any = await pool.query(
          `SELECT * FROM users WHERE id = ${contactId}`
        );

        const contact = getContact[0][0];
        const user = getUser[0][0];

        const userContacts = user.contacts;
        const contactContacts = contact.contacts;

        const newContactContacts = contactContacts.filter(
          (contact: number) => contact !== userId
        );
        const newUserContacts = userContacts.filter(
          (contact: number) => contact !== contactId
        );

        await pool.query(
          `UPDATE users SET contacts = '[${newContactContacts}]', updated_at = default WHERE id = ${contactId};`
        );
        await pool.query(
          `UPDATE users SET contacts = '[${newUserContacts}]', updated_at = default WHERE id = ${userId};`
        );

        const userUpdated: any = await pool.query(
          `SELECT * FROM users WHERE id = ${userId}`
        );
        return userUpdated[0][0];
      } catch (error) {
        if (error instanceof Error) throw new UserInputError(error.message);
      }
    },
    changePassword: async (_: unknown, args: UserType) => {
      try {
        const hashedPassword = await bctypt.hash(args.password as string, 10);
        await pool.query(
          `UPDATE users SET password = ${hashedPassword}, updated_at = default WHERE id = ${args.id};`
        );
        return {
          value: true,
          message: `Successful reset password`,
        };
      } catch (error: unknown) {
        if (error instanceof Error) throw new UserInputError(error.message);
      }
    },
    deleteUser: async (_: unknown, args: UserType) => {
      try {
        const user: any = await pool.query(
          `SELECT * FROM users WHERE email = ${args.email}`
        );
        if (user[0].length === 0) {
          throw new UserInputError('User not found');
        }
        await pool.query(`DELETE FROM users WHERE email = ${args.email};`);
        return {
          value: true,
          message: `Successful reset password`,
        };
      } catch (error: unknown) {
        if (error instanceof Error) throw new UserInputError(error.message);
      }
    },
    forgetPassword: async (_: unknown, { email }: { email: string }) => {
      const getUser: any = await pool.query(
        `SELECT id, username, provider FROM users WHERE email = '${email}'`
      );

      const user = getUser[0][0];

      if (!user || (user && user.provider !== 'email')) {
        throw new UserInputError(
          'Check your email for a link reset your password'
        );
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.RESET_TOKEN,
        {
          expiresIn: '5m',
        }
      );

      const transporter = createTransport({
        host: process.env.NODEMAILER_SMTP,
        port: process.env.NODEMAILER_PORT,
        secure: true,
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASS,
        },
      });

      const info = {
        from: `'Forgot password' <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: 'Forgot password',
        html: template(token),
      };

      transporter.sendMail(info, (error) => {
        if (error) throw new UserInputError(error.message);
        return {
          value: true,
          message: 'Successful',
        };
      });
    },
  },
};
