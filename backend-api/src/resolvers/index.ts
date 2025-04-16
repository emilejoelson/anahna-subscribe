import restaurantQueries from "./queries/restaurant";
import restaurantMutations from "./mutations/restaurant";
import configurationQueries from "./queries/configuration";
import configurationMutations from "./mutations/configuration";
import userQueries from "./queries/user";
import userMutations from "./mutations/user";
import authQueries from "./queries/auth";
import authMutations from "./mutations/auth";
export default {
  Query: {
    ...restaurantQueries.Query,
    ...configurationQueries.Query,
    ...userQueries.Query,
    ...authQueries.Query,
  },
  Mutation: {
    ...restaurantMutations.Mutation,
    ...configurationMutations.Mutation,
    ...userMutations.Mutation,
    ...authMutations.Mutation,
  },
};
