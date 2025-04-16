const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anahna', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// GraphQL setup
const rootValue = require('./resolvers');
const schema = require('./schema');

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: rootValue,
    graphiql: true
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});