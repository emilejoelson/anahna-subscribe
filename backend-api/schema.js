const { makeExecutableSchema } = require('@graphql-tools/schema');
const { gql } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./resolvers');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  logger: {
    log: e => console.log(e)
  }
});

module.exports = schema;
