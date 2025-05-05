const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

pubsub.ee.setMaxListeners(1000); 

module.exports = {pubsub};