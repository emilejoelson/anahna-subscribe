import User from '../../models/User';
import Auth from '../../models/Auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { generateAccessToken, generateRefreshToken,isValidEmail,formatAddresses} from '../../utils/helpers';

 const signup = async (_: any, { user }: { user: any }) => {
    try {
      const { name, email, phone, password, addresses } = user;
  
      if (!name || !email || !phone || !password) {
        throw new GraphQLError('Missing required user input fields.', {
          extensions: { code: 'USER_INPUT_ERROR' },
        });
      }
  
      if (!isValidEmail(email)) {
        throw new GraphQLError('Invalid email format.', { extensions: { code: 'USER_INPUT_ERROR' } });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new GraphQLError('Email is already taken.', { extensions: { code: 'USER_ALREADY_EXISTS' } });
      }
  
      const formattedAddresses = formatAddresses(addresses);
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        addresses: formattedAddresses,
      });
  
      const savedUser = await newUser.save();
  
      if (!savedUser) {
        console.error('Error saving user to database during signup.');
        throw new GraphQLError('Failed to save user to the database.', {
          extensions: { code: 'DATABASE_SAVE_ERROR' },
        });
      }
  
      const accessToken = generateAccessToken(savedUser._id.toString());
      const refreshToken = generateRefreshToken(savedUser._id.toString());
  
      const newAuth = new Auth({
        userId: savedUser._id,
        accessToken,
        refreshToken,
        isUsedForInitialLogin: false, // Marqué comme non utilisé pour le login initial par défaut
      });
      await newAuth.save();
  
      return { accessToken, refreshToken, user: savedUser };
    } catch (error: unknown) {
      console.error('Signup error:', error);
      throw new GraphQLError(`Signup failed: ${error instanceof Error ? error.message : String(error)}`, {
        extensions: { code: 'SIGNUP_FAILED' },
      });
    }
  };
  const refreshToken = async (_: any, { refreshToken }: { refreshToken: string }) => {
    try {
      if (!refreshToken) {
        throw new GraphQLError('Refresh token is required.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
  
      // Find the auth record with this refresh token
      const auth = await Auth.findOne({ refreshToken });
      if (!auth) {
        throw new GraphQLError('Invalid refresh token.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
  
      // Verify the token is still valid
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_default_refresh_secret');
        const userId = decoded.userId || decoded.sub;
        
        // Generate new tokens
        const newAccessToken = generateAccessToken(userId);
        const newRefreshToken = generateRefreshToken(userId);
        
        // Update stored tokens
        auth.accessToken = newAccessToken;
        auth.refreshToken = newRefreshToken;
        await auth.save();
        
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
      } catch (tokenError) {
        throw new GraphQLError('Invalid or expired refresh token.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
    } catch (error: unknown) {
      console.error('Token refresh error:', error);
      throw new GraphQLError(`Token refresh failed: ${error instanceof Error ? error.message : String(error)}`, {
        extensions: { code: 'AUTHENTICATION_FAILED' },
      });
    }
  };

  const login = async (
    _: any,
    { email, password }: { email: string; password: string },
    context: any
  ) => {
    try {
      // Extract bearer token from context
      const accessToken = context.req?.headers?.authorization?.split(' ')[1];
      
      // Check if bearer token exists
      if (!accessToken) {
        throw new GraphQLError('Missing access token in Authorization header.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
      
      // Verify token validity (optional - you can add JWT verification here)
      try {
        jwt.verify(accessToken, process.env.JWT_SECRET || 'your_default_secret');
      } catch (tokenError) {
        throw new GraphQLError('Invalid or expired access token.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
  
      // Proceed with normal login flow
      if (!email || !password) {
        throw new GraphQLError('Missing email or password.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
  
      const user = await User.findOne({ email });
      if (!user || !user.password) {
        throw new GraphQLError('User not found or incomplete user data.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid password.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
  
      // Generate new tokens
      const newAccessToken = generateAccessToken(user._id.toString());
      const newRefreshToken = generateRefreshToken(user._id.toString());
  
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw new GraphQLError(`Login failed: ${error instanceof Error ? error.message : String(error)}`, {
        extensions: { code: 'AUTHENTICATION_FAILED' },
      });
    }
  };

const logout = async (_: any, { accessToken }: { accessToken: string }) => {
  try {
    const deletedAuth = await Auth.findOneAndDelete({ accessToken });
    return !!deletedAuth;
  } catch (error: unknown) {
    console.error('Logout error:', error);
    throw new GraphQLError(`Logout failed: ${error instanceof Error ? error.message : String(error)}`, {
      extensions: { code: 'AUTHENTICATION_FAILED' },
    });
  }
};

export default {
  Mutation: {
    signup,
    login,
    logout,
    refreshToken,
  },
};