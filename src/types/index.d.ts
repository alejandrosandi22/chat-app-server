declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      PGPASSWORD: string;
      PGPORT: number;
      PGUSER: string;
      PGHOST: string;
      PGDATABASE: string;
      DB_URL: string;
      DBPORT: number;
      ACCESS_TOKEN_SECRET: string;
      RESET_TOKEN: string;
      NODEMAILER_SMTP: string;
      NODEMAILER_PORT: number;
      NODEMAILER_EMAIL: string;
      NODEMAILER_PASS: string;
      ENV: 'test' | 'dev' | 'prod';
    }
  }
}

type MessageType = {
  date?: string;
  id: number;
  content: string;
  fileName?: string;
  sender: number;
  receiver: number;
  type: string;
  created_at: string;
};

type UserType = {
  userId?: number;
  id: number;
  name: string;
  email: string;
  username: string;
  password?: string;
  avatar: string;
  cover_photo: string;
  description?: string;
  website: string;
  show_profile_photo?: string;
  show_email?: string;
  lastMessage?: MessageType;
  contacts: number[];
  created_at?: string;
  updated_at?: string;
};

export type { UserType, MessageType, EmojiType };

export {};
