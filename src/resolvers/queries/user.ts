import User from '../../models/User';
import { GraphQLError } from 'graphql';

export default {
  Query: {
    users: async () => {
      try {
        const usersList = await User.find();
        return usersList;
      } catch (error: unknown) {
        console.error('Error fetching users:', error);
        throw new GraphQLError(`Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`, {
          extensions: { code: 'USER_FETCH_FAILED' },
        });
      }
    },
    user: async (_: any, { id }: { id: string }) => {
      try {
        if (!id) {
          throw new GraphQLError('Missing user ID for query.', {
            extensions: { code: 'USER_INPUT_ERROR' },
          });
        }
        const userResult = await User.findById(id);
        if (!userResult) {
          throw new GraphQLError(`User with ID ${id} not found.`, {
            extensions: { code: 'USER_NOT_FOUND' },
          });
        }
        return userResult;
      } catch (error: unknown) {
        console.error('Error fetching user:', error);
        throw new GraphQLError(`Failed to fetch user: ${error instanceof Error ? error.message : String(error)}`, {
          extensions: { code: 'USER_FETCH_FAILED' },
        });
      }
    },
  },
};