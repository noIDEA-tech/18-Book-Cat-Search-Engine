import { GraphQLError } from 'graphql';
import { User } from '../models';
import { signToken } from '../services/auth';
import type { BookDocument } from '../models/Book';


interface BookInput {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
}

const resolvers = {
    Query: {
      me: async (parent: any, args: any, context: { user?: { _id: string } }) => {
        if (context.user) {
          return await User.findOne({ _id: context.user._id });
        }
        throw new GraphQLError('You need to be logged in!', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      },
    },
  
    Mutation: {
      addUser: async (parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
  
      login: async (parent: any, { email, password }: { email: string; password: string }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new GraphQLError('No user found with this email address', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new GraphQLError('Incorrect credentials', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }
  
        const token = signToken(user);
        return { token, user };
      },
  
      saveBook: async (parent: any, { bookData }: { bookData: BookInput }, context: { user?: { _id: string } }) => {
        if (context.user) {
          return await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: bookData } },
            { new: true, runValidators: true }
          );
        }
        throw new GraphQLError('You need to be logged in!', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      },
  
      removeBook: async (parent: any, { bookId }: { bookId: string }, context: { user?: { _id: string } }) => {
        if (context.user) {
          return await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
        }
        throw new GraphQLError('You need to be logged in!', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      },
    },
  };
  