import User from '../../models/User';
import Auth from '../../models/Auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { generateAccessToken, generateRefreshToken} from '../../utils/helpers';

const signup = async (_: any, { user }: { user: any }) => {
  try {
    const { name, email, phone, password, addresses } = user;

    if (!name || !email || !phone || !password) {
      throw new GraphQLError('Missing required user input fields.', {
        extensions: { code: 'USER_INPUT_ERROR' },
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new GraphQLError('Email is already taken.', {
        extensions: { code: 'USER_ALREADY_EXISTS' },
      });
    }

    let formattedAddresses = addresses;
    if (addresses && addresses.length > 0) {
      formattedAddresses = addresses.map((addr: any) => {
        if (addr.location && !addr.location.type) {
          return {
            ...addr,
            location: {
              ...addr.location,
              type: 'Point'
            }
          };
        }
        return addr;
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      addresses: formattedAddresses
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

    const newAuth = new Auth({ userId: savedUser._id, accessToken, refreshToken });
    await newAuth.save();

    return { accessToken, refreshToken, user: savedUser };

  } catch (error: unknown) {
    console.error('Signup error:', error);
    throw new GraphQLError(`Signup failed: ${error instanceof Error ? error.message : String(error)}`, {
      extensions: { code: 'SIGNUP_FAILED' },
    });
  }
};

const login = async (_: any, { email, password }: { email: string; password: string }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError('Invalid credentials.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
  
      if (!user.password) {
        // This should ideally not happen if your database schema is enforced,
        // but it's a good safety check.
        throw new GraphQLError('Server error: User password not found.', {
          extensions: { code: 'SERVER_ERROR' },
        });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid credentials.', {
          extensions: { code: 'AUTHENTICATION_FAILED' },
        });
      }
  
      const accessToken = generateAccessToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());
  
      // Invalidate any existing tokens for this user (optional, but good practice)
      await Auth.deleteMany({ userId: user._id });
  
      const newAuth = new Auth({ userId: user._id, accessToken, refreshToken });
      await newAuth.save();
  
      return { accessToken, refreshToken, user };
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
  },
};