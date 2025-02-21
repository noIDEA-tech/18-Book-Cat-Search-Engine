import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//set token secret and expiration date
const secret = process.env.JWT_SECRET_KEY || 'defaultsecret';
const expiration = '2h';

interface UserPayload {  
      username: string;
      email: string;
      _id: unknown;
  };

  export class AuthenticationError extends GraphQLError {
    constructor(message: string) {
      super(message, {
        extensions: {
          code: 'UNAUTHENTICATED'
        }
      });
      Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
    }
  }
  
  export const authenticateToken = ({ req }: { req: any }) => {
    // Allow token to be sent via body, query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;
  
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }
  
    if (!token) {
      return req;
    }
  
    try {
      const { data } = jwt.verify(token, secret) as { data: UserPayload };
      req.user = data;
    } catch {
      throw new AuthenticationError('Invalid token');
    }
  
    return req;
  };

  export const signToken = ({ username, email, _id }: UserPayload): string => {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};