import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { pool } from '../database';

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

    const currentUser = await pool.query(
      `SELECT * FROM users WHERE id = ${id}`
    );

    return {
      user: currentUser.rows[0],
    };
  }
  return {
    user: null,
  };
}
