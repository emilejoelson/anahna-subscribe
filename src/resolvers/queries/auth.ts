import Auth from '../../models/Auth';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { generateAccessToken, generateRefreshToken} from '../../utils/helpers';

const refreshToken = async (_: any, args: any, context: any) => {
    try {
      // Extract token from authorization header
      const authHeader = context.req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new GraphQLError('No refresh token provided', {
          extensions: { code: 'NO_REFRESH_TOKEN' },
        });
      }
      
      const refreshToken = authHeader.split(' ')[1];
      
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret-key');
      const userId = decoded?.userId;
      
      if (!userId) {
        throw new GraphQLError('Invalid refresh token.', {
          extensions: { code: 'INVALID_REFRESH_TOKEN' },
        });
      }
      
      const authRecord = await Auth.findOne({ refreshToken, userId });
      if (!authRecord) {
        throw new GraphQLError('Invalid refresh token or token not found.', {
          extensions: { code: 'INVALID_REFRESH_TOKEN' },
        });
      }
      
      const user = await User.findById(userId);
      if (!user) {
        throw new GraphQLError('User not found for this refresh token.', {
          extensions: { code: 'USER_NOT_FOUND' },
        });
      }
      
      const newAccessToken = generateAccessToken(userId);
      const newRefreshToken = generateRefreshToken(userId);
      
      authRecord.accessToken = newAccessToken;
      authRecord.refreshToken = newRefreshToken;
      await authRecord.save();
      
      return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
    } catch (error: unknown) {
      console.error('Refresh token error:', error);
      throw new GraphQLError(`Failed to refresh token: ${error instanceof Error ? error.message : String(error)}`, {
        extensions: { code: 'REFRESH_TOKEN_FAILED' },
      });
    }
  };

export default {
  Query: {
    refreshToken,
  },
};