const { ApolloServer } = require('apollo-server')
const typeDefs = require('./src/schema')
// const { createStore } = require('./utils');
const LaunchAPI = require('./src/datasources/launch');
const UserAPI = require('./src/datasources/user');
const resolvers = require('./src/resolvers');
const isEmail = require('isemail');
const { connectDB } = require('./src/connectDB');

// const store = createStore();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI(),
  }),
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = (req.headers && req.headers.authorization) || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');

    // if the email isn't formatted validly, return null for user
    if (!isEmail.validate(email)) return { user: null };
    
    // find a user by their email
    // const users = await store.users.findOrCreate({ where: { email } });
    // const user = users && users[0] ? users[0] : null;
    
    const db = await connectDB().catch((err) => console.log(err));
    const user = await db.collection('users').findOne({email:email});
    
    // return { user: { ...user.dataValues } };
    return user ? { user: {...user}} : null
  },
  introspection: true,
  playground: true
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
