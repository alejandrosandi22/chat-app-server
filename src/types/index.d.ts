declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      PGPASSWORD: string;
      PGPORT: number;
      PGUSER: string;
      PGHOST: string;
      PGDATABASE: string;
      ACCESS_TOKEN_SECRET: string;
      RESET_TOKEN: string;
      GOOGLE_CALLBACK_URL: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      FACEBOOK_CLIENT_ID: string;
      FACEBOOK_CLIENT_SECRET: string;
      FACEBOOK_CALLBACK_URL: string;
      GITHUB_CALLBACK_URL: string;
      GITHUB_CLIENT_SECRET: string;
      GITHUB_CLIENT_ID: string;
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
  contacts_request?: string;
  lastMessage?: MessageType;
  contacts: number[];
  created_at?: string;
  updated_at?: string;
};

export type { UserType, MessageType, EmojiType };

export {};
