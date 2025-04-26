const Order = require('../models/order');
const User = require('../models/user');
const Owner = require('../models/owner');
const Restaurant = require('../models/restaurant');
const Rider = require('../models/rider');
const { months } = require('../helpers/enum');

module.exports = {
  Query: {
    getDashboardTotal: async (_, args) => {
      console.log('Fetching dashboard total with arguments:', args);
      try {
        const startingDate = new Date(args.starting_date);
        const endingDate = new Date(args.ending_date);
        endingDate.setDate(endingDate.getDate() + 1);
        const filterDate = {
          createdAt: { $gte: startingDate, $lt: endingDate },
        };

        const ordersCount = await Order.countDocuments({
          ...filterDate,
          restaurant: args.restaurant,
          orderStatus: 'DELIVERED',
        });

        const paidOrders = await Order.find({
          ...filterDate,
          orderStatus: 'DELIVERED',
          restaurant: args.restaurant,
        }).select('orderAmount');

        const salesAmount = paidOrders.reduce(
          (acc, order) => acc + order.orderAmount,
          0
        );

        return {
          totalOrders: ordersCount,
          totalSales: salesAmount.toFixed(2),
        };
      } catch (err) {
        console.error('Error fetching dashboard total:', err);
        throw new Error('Failed to fetch dashboard total');
      }
    },

    getDashboardSales: async (_, args) => {
      console.log('Fetching dashboard sales with arguments:', args);
      try {
        const endingDate = new Date(args.ending_date);
        endingDate.setDate(endingDate.getDate() + 1);
        const salesValue = [];
        let currentDate = new Date(args.starting_date);

        while (currentDate < endingDate) {
          const filterStart = new Date(currentDate);
          const filterEnd = new Date(filterStart);
          filterEnd.setDate(filterStart.getDate() + 1);
          const filter = { createdAt: { $gte: filterStart, $lt: filterEnd } };

          const orders = await Order.find({
            ...filter,
            orderStatus: 'DELIVERED',
            restaurant: args.restaurant,
          }).select('orderAmount');

          const day = `${months[currentDate.getMonth()]} ${currentDate.getDate()}`;
          const tempSalesValue = {
            day,
            amount: orders.reduce((acc, order) => acc + order.orderAmount, 0).toFixed(2),
          };

          salesValue.push(tempSalesValue);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          orders: salesValue,
        };
      } catch (err) {
        console.error('Error fetching dashboard sales:', err);
        throw new Error('Failed to fetch dashboard sales');
      }
    },

    getDashboardOrders: async (_, args) => {
      console.log('Fetching dashboard orders with arguments:', args);
      try {
        const endingDate = new Date(args.ending_date);
        endingDate.setDate(endingDate.getDate() + 1);
        const salesValue = [];
        let currentDate = new Date(args.starting_date);

        while (currentDate < endingDate) {
          const filterStart = new Date(currentDate);
          const filterEnd = new Date(filterStart);
          filterEnd.setDate(filterStart.getDate() + 1);
          const filter = { createdAt: { $gte: filterStart, $lt: filterEnd } };

          const day = `${months[currentDate.getMonth()]} ${currentDate.getDate()}`;
          const count = await Order.countDocuments({
            ...filter,
            orderStatus: 'DELIVERED',
            restaurant: args.restaurant,
          });

          salesValue.push({
            day,
            count,
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          orders: salesValue,
        };
      } catch (err) {
        console.error('Error fetching dashboard orders:', err);
        throw new Error('Failed to fetch dashboard orders');
      }
    },

    getDashboardUsers: async () => {
      try {
        const [usersCount, vendorsCount, restaurantsCount, ridersCount] = await Promise.all([
          User.countDocuments(),
          Owner.countDocuments(),
          Restaurant.countDocuments(),
          Rider.countDocuments()
        ]);

        return {
          usersCount,
          vendorsCount,
          restaurantsCount,
          ridersCount,
          __typename: 'DashboardUsers'
        };
      } catch (err) {
        console.error('Error in getDashboardUsers:', err);
        throw new Error('Failed to fetch dashboard users statistics');
      }
    },

    getDashboardUsersByYear: async (_, { year }) => {
      try {
        const startDate = new Date(year, 0, 1); // January 1st of the given year
        const endDate = new Date(year + 1, 0, 1); // January 1st of the next year

        // Arrays to store monthly counts for each type
        const usersCount = new Array(12).fill(0);
        const vendorsCount = new Array(12).fill(0);
        const restaurantsCount = new Array(12).fill(0);
        const ridersCount = new Array(12).fill(0);

        // Get all entities created during the year
        const [users, vendors, restaurants, riders] = await Promise.all([
          User.find({
            createdAt: { $gte: startDate, $lt: endDate }
          }).select('createdAt'),
          Owner.find({
            createdAt: { $gte: startDate, $lt: endDate }
          }).select('createdAt'),
          Restaurant.find({
            createdAt: { $gte: startDate, $lt: endDate }
          }).select('createdAt'),
          Rider.find({
            createdAt: { $gte: startDate, $lt: endDate }
          }).select('createdAt')
        ]);

        // Count by month
        users.forEach(user => {
          const month = new Date(user.createdAt).getMonth();
          usersCount[month]++;
        });

        vendors.forEach(vendor => {
          const month = new Date(vendor.createdAt).getMonth();
          vendorsCount[month]++;
        });

        restaurants.forEach(restaurant => {
          const month = new Date(restaurant.createdAt).getMonth();
          restaurantsCount[month]++;
        });

        riders.forEach(rider => {
          const month = new Date(rider.createdAt).getMonth();
          ridersCount[month]++;
        });

        return {
          usersCount,
          vendorsCount,
          restaurantsCount,
          ridersCount
        };
      } catch (err) {
        console.error('Error in getDashboardUsersByYear:', err);
        throw new Error('Failed to fetch dashboard users yearly statistics');
      }
    }
  },
  Mutation: {},
};
