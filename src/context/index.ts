import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { pool } from '../database';
import { UserType } from '../types';

interface ContextType {
  req: Request;
}

export async function context({ req }: ContextType) {
  const auth = req ? req.headers.authorization : null;

  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.substring(7);
    const { id } = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    ) as JwtPayload;

    const [rows]: any = await pool.query(
      `SELECT * FROM users WHERE id = ${id}`
    );

    const currentUser: UserType = rows[0];

    return {
      user: currentUser,
    };
  }
  return {
    user: null,
  };
}
