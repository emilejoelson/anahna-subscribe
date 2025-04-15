import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';

const createUser = async (_: any, { user }: { user: any }) => {
  try {
    console.log("Creating user with input:", user);
    const { name, email, phone, password, addresses } = user;
    
    if (!name || !email || !phone || !password) {
      throw new GraphQLError('Missing required user input fields.', {
        extensions: { code: 'USER_INPUT_ERROR' },
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
    
    console.log("Saving user:", newUser);
    const savedUser = await newUser.save();
    
    if (!savedUser) {
      console.error('Error saving user to database.');
      throw new GraphQLError('Failed to save user to the database.', {
        extensions: { code: 'DATABASE_SAVE_ERROR' },
      });
    }
    
    console.log("User saved successfully:", savedUser);
    return savedUser;
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    throw new GraphQLError(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`, {
      extensions: { code: 'USER_CREATION_FAILED' },
    });
  }
};

export default {
  Mutation: {
    createUser,
    updateUser: async (_: any, { user }: { user: any }) => {
      try {
        const { _id, name, email, phone, isActive, addresses } = user;
        if (!_id) {
          throw new GraphQLError('Missing user ID for update.', {
            extensions: { code: 'USER_INPUT_ERROR' },
          });
        }
        const updateData: any = { name, email, phone, isActive, addresses };
        if (user.password) {
          updateData.password = await bcrypt.hash(user.password, 10);
        }
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
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      try {
        if (!id) {
          throw new GraphQLError('Missing user ID for deletion.', {
            extensions: { code: 'USER_INPUT_ERROR' },
          });
        }
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
    },
  },
};