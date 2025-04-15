import Restaurant from '../../models/Restaurant';

export default {
  Mutation: {
    createRestaurant: async (_: any, { restaurant, owner }: { restaurant: any, owner: string }) => {
      try {
        const newRestaurant = new Restaurant({ ...restaurant, owner });
        return await newRestaurant.save();
      } catch (error) {
        throw new Error(`Error creating restaurant: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    deleteRestaurant: async (_: any, { id }: { id: string }) => {
      try {
        return await Restaurant.findByIdAndUpdate(id, { isActive: false }, { new: true });
      } catch (error) {
        throw new Error(`Error deleting restaurant: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    hardDeleteRestaurant: async (_: any, { id }: { id: string }) => {
      try {
        const result = await Restaurant.findByIdAndDelete(id);
        return !!result;
      } catch (error) {
        throw new Error(`Error hard deleting restaurant: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    updateDeliveryBoundsAndLocation: async (_: any, { id, boundType, bounds, circleBounds, location, address, postCode, city }: any) => {
      try {
        const update: any = { location, address, postCode, city };
        if (boundType === 'Polygon' && bounds) {
          update.deliveryBounds = { type: 'Polygon', coordinates: bounds };
        } else if (boundType === 'Circle' && circleBounds) {
          update.deliveryBounds = { type: 'Circle', circle: circleBounds };
        } else {
          update.deliveryBounds = null;
        }
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, update, { new: true });
        return { success: true, data: updatedRestaurant };
      } catch (error) {
        return { success: false, message: `Error updating delivery bounds and location: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
    editRestaurant: async (_: any, { restaurant }: { restaurant: any }) => {
      try {
        const { _id, ...updateData } = restaurant;
        return await Restaurant.findByIdAndUpdate(_id, updateData, { new: true });
      } catch (error) {
        throw new Error(`Error editing restaurant: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    duplicateRestaurant: async (_: any, { id, owner }: { id: string, owner: string }) => {
      try {
        const existingRestaurant = await Restaurant.findById(id);
        if (!existingRestaurant) {
          throw new Error('Restaurant not found for duplication.');
        }
        const { _id, ...restaurantData } = existingRestaurant.toObject();
        const newRestaurant = new Restaurant({ ...restaurantData, owner });
        return await newRestaurant.save();
      } catch (error) {
        throw new Error(`Error duplicating restaurant: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    updateFoodOutOfStock: async (_: any, { id, restaurant, categoryId }: { id: string, restaurant: string, categoryId: string }) => {
      console.log(`Updating food item ${id} in restaurant ${restaurant} category ${categoryId} to out of stock.`);
      return true;
    },
    updateRestaurantDelivery: async (_: any, { id, minDeliveryFee, deliveryDistance, deliveryFee }: any) => {
      try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          { minDeliveryFee, deliveryDistance, deliveryFee },
          { new: true }
        );
        return { success: true, data: updatedRestaurant };
      } catch (error) {
        return { success: false, message: `Error updating restaurant delivery settings: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
    updateRestaurantBussinessDetails: async (_: any, { id, bussinessDetails }: any) => {
      try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
          id,
          { bussinessDetails },
          { new: true }
        );
        return { success: true, data: updatedRestaurant };
      } catch (error) {
        return { success: false, message: `Error updating restaurant business details: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
  },
};