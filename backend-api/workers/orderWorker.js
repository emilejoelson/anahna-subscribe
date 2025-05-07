// workers/orderWorker.js
const { orderQueue } = require("../queue/index");
const Order = require("../models/order");
const { pubsub } = require("../helpers/pubsub");
const { ORDER_UPDATED, PLACE_ORDER } = require("../helpers/pubsub");

orderQueue.process("proccess_order", async (job) => {
  const { orderId, orderData } = job.data;
  console.log(`Processing order ${orderId} ...`);

  try {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "PENDING" }, // Match the field name in your schema
      { new: true }
    );

    if (updatedOrder) {
      // Publish to subscription
      pubsub.publish(ORDER_UPDATED, {
        orderUpdated: updatedOrder,
      });

      // Also publish to the PLACE_ORDER subscription if needed
      pubsub.publish(PLACE_ORDER, {
        subscribePlaceOrder: {
          userId: updatedOrder.user,
          order: updatedOrder,
          origin: "order_processed",
        },
      });
    }

    console.log(`Order ${orderId} has been processed successfully`);
    return { success: true, orderId };
  } catch (error) {
    console.error(`Failed to process order: ${error.message}`);
    throw new Error(`Failed to process order: ${error.message}`);
  }
});

orderQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} has been completed with result:`, result);
});

orderQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} has failed with error: ${err.message}`);
});

// Handling stalled jobs
orderQueue.on("stalled", (job) => {
  console.warn(`Job ${job.id} has stalled`);
});

console.log("🍔 Order worker started and listening for jobs");

module.exports = orderQueue;
