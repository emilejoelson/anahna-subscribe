const Staff = require('../models/staff');

module.exports = {
  Query: {
    staffs: async () => {
      try {
        const staffs = await Staff.find();
        console.log("Retrieved staffs:", staffs);
        return staffs;
      } catch (error) {
        console.error("Error fetching staffs:", error);
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createStaff: async (_, { staffInput }) => {
      console.log("Creating staff with input:", staffInput);
      const { name, email, password, phone, permissions, isActive } = staffInput;

      try {
        // Check if email already exists
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
          throw new Error('Email already exists');
        }

        const staff = new Staff({
          name,
          email,
          password,
          plainPassword: password, // Store plainPassword for frontend display
          phone,
          isActive: isActive !== undefined ? isActive : true,
          permissions: permissions || [],
          userType: 'Staff',
        });

        console.log("Saving staff:", staff);
        const result = await staff.save();
        console.log("Staff saved successfully:", result);
        return result;
      } catch (error) {
        console.error("Error creating staff:", error);
        throw new Error(error.message);
      }
    },
    editStaff: async (_, { staffInput }) => {
      console.log("Editing staff with input:", staffInput);
      const { _id, name, email, password, phone, permissions, isActive } = staffInput;

      try {
        // Check if modifying an existing email to one that already exists
        if (email) {
          const existingStaff = await Staff.findOne({ email, _id: { $ne: _id } });
          if (existingStaff) {
            throw new Error('Email already exists');
          }
        }

        const staff = await Staff.findById(_id);
        if (!staff) {
          throw new Error('Staff not found');
        }

        if (name) staff.name = name;
        if (email) staff.email = email;
        if (password) {
          staff.password = password;
          staff.plainPassword = password;
        }
        if (phone) staff.phone = phone;
        if (permissions) staff.permissions = permissions;
        if (isActive !== undefined) staff.isActive = isActive;

        console.log("Updating staff:", staff);
        const updatedStaff = await staff.save();
        console.log("Staff updated successfully:", updatedStaff);
        return updatedStaff;
      } catch (error) {
        console.error("Error updating staff:", error);
        throw new Error(error.message);
      }
    },
    deleteStaff: async (_, { id }) => {
      console.log("Deleting staff with id:", id);
      try {
        const staff = await Staff.findById(id);
        if (!staff) {
          throw new Error('Staff not found');
        }

        await Staff.findByIdAndDelete(id);
        console.log("Staff deleted successfully");
        return staff;
      } catch (error) {
        console.error("Error deleting staff:", error);
        throw new Error(error.message);
      }
    },
    toggleStaffActive: async (_, { id }) => {
      console.log("Toggling staff active status with id:", id);
      try {
        const staff = await Staff.findById(id);
        if (!staff) {
          throw new Error('Staff not found');
        }

        staff.isActive = !staff.isActive;
        const updatedStaff = await staff.save();
        console.log("Staff active status toggled successfully:", updatedStaff);
        return updatedStaff;
      } catch (error) {
        console.error("Error toggling staff active status:", error);
        throw new Error(error.message);
      }
    },
  },
};