import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { isValidEmail } from '../../utils/helpers';

const formatAddresses = (addresses: any[]) => {
  if (!addresses || addresses.length === 0) {
    return [];
  }
  return addresses.map((addr: any) => ({
    ...addr,
    location: addr.location && !addr.location.type ? { ...addr.location, type: 'Point' } : addr.location,
  }));
};

const createUser = async (_: any, { user }: { user: any }) => {
  const { name, email, phone, password, addresses } = user;

  if (!name || !email || !phone || !password) {
    throw new GraphQLError('Missing required user input fields.', {
      extensions: { code: 'USER_INPUT_ERROR' },
    });
  }

  if (!isValidEmail(email)) {
    throw new GraphQLError('Invalid email format.', {
      extensions: { code: 'USER_INPUT_ERROR' },
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      addresses: formatAddresses(addresses),
    });

    const savedUser = await newUser.save();
    if (!savedUser) {
      console.error('Error saving user to database.');
      throw new GraphQLError('Failed to save user to the database.', {
        extensions: { code: 'DATABASE_SAVE_ERROR' },
      });
    }

    console.log('User saved successfully:', savedUser);
    return savedUser;
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    throw new GraphQLError(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`, {
      extensions: { code: 'USER_CREATION_FAILED' },
    });
  }
};

const updateUser = async (_: any, { user }: { user: any }) => {
  const { _id, name, email, phone, isActive, addresses } = user;

  if (!_id) {
    throw new GraphQLError('Missing user ID for update.', {
      extensions: { code: 'USER_INPUT_ERROR' },
    });
  }

  if (email && !isValidEmail(email)) {
    throw new GraphQLError('Invalid email format.', {
      extensions: { code: 'USER_INPUT_ERROR' },
    });
  }

  const updateData: any = { name, email, phone, isActive, addresses: formatAddresses(addresses) };
  if (user.password) {
    updateData.password = await bcrypt.hash(user.password, 10);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updatedUser) {
      throw new GraphQLError(`User with ID ${_id} not found.`, {
        extensions: { code: 'USER_NOT_FOUND' },
      });
    }
    return updatedUser;
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    throw new GraphQLError(`Failed to update user: ${error instanceof Error ? error.message : String(error)}`, {
      extensions: { code: 'USER_UPDATE_FAILED' },
    });
  }
};

const deleteUser = async (_: any, { id }: { id: string }) => {
  if (!id) {
    throw new GraphQLError('Missing user ID for deletion.', {
      extensions: { code: 'USER_INPUT_ERROR' },
    });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new GraphQLError(`User with ID ${id} not found.`, {
        extensions: { code: 'USER_NOT_FOUND' },
      });
    }
    return deletedUser;
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    throw new GraphQLError(`Failed to delete user: ${error instanceof Error ? error.message : String(error)}`, {
      extensions: { code: 'USER_DELETION_FAILED' },
    });
  }
};

export default {
  Mutation: {
    createUser,
    updateUser,
    deleteUser,
  },
};