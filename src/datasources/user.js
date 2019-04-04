const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../connectDB');

const createObjectId = function (id) {
    return new ObjectId(id);
}

class UserAPI extends DataSource {
  constructor() {
    super();
    // this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */
  async findOrCreateUser({ email: emailArg } = {}) {
    const email = this.context && this.context.user 
                  ? this.context.user.email 
                  : emailArg;
    if (!email || !isEmail.validate(email)) return null;

    // const users = await this.store.users.findOrCreate({ where: { email } });
    // return users && users[0] ? users[0] : null;
    const db = await connectDB().catch((err) => console.log(err));

    let user = await db.collection('users').findOne({email:email});

    if(!user) {
      await db.collection('users').insertOne({email:email});
      user = await db.collection('users').findOne({email:email});
    }

    return user
  }

  async bookTrips({ launchIds }) {
    const id = this.context.user._id;
    const userId = createObjectId(id);

    if (!userId) return;

    let results = [];

    // for each launch id, try to book the trip and add it to the results array
    // if successful
    for (const launchId of launchIds) {
      const res = await this.bookTrip({ launchId });
      if (res) results.push(res);
    }

    return results;
  }

  async bookTrip({ launchId }) {
    // const userId = this.context.user._id;
    
    const id = this.context.user._id;
    const userId = createObjectId(id);

    const db = await connectDB().catch((err) => console.log(err));

    let trip = await db.collection('trips').findOne({userId:userId, launchId:launchId});
    
    if(!trip) {
      await db.collection('trips').insertOne({userId:userId, launchId:launchId});
      trip = await db.collection('trips').findOne({userId:userId, launchId:launchId});
    }

    return trip

    // const res = await this.store.trips.findOrCreate({
    //   where: { userId, launchId },
    // });
    // return res && res.length ? res[0].get() : false;
  }

  async cancelTrip({ launchId }) {
    const id = this.context.user._id;
    const userId = createObjectId(id);
    // const userId = this.context.user.id;

    const db = await connectDB().catch((err) => console.log(err));

    let trip = await db.collection('trips').deleteOne({userId:userId, launchId:launchId});

    return trip.result.n

    // return !!this.store.trips.destroy({ where: { userId, launchId } });
  }

  async getLaunchIdsByUser() {
    const id = this.context.user._id;
    const userId = createObjectId(id);

    const db = await connectDB().catch((err) => console.log(err));
    let results = [];
    await db.collection('trips').find({userId:userId}).forEach((trip)=> results.push(trip.launchId));

    return results

    // const userId = this.context.user.id;
    // const found = await this.store.trips.findAll({
    //   where: { userId },
    // });
    // return found && found.length
    //   ? found.map(l => l.dataValues.launchId).filter(l => !!l)
    //   : [];
  }

  async isBookedOnLaunch({ launchId }) {
    if (!this.context || !this.context.user) return false;

    const id = this.context.user._id;
    const userId = createObjectId(id);

    const db = await connectDB().catch((err) => console.log(err));
    const trip = await db.collection('trips').findOne({userId:userId, launchId:launchId.toString()});

    return trip ? true : false

    // if (!this.context || !this.context.user) return false;
    // const userId = this.context.user.id;
    // const found = await this.store.trips.findAll({
    //   where: { userId, launchId },
    // });
    // return found && found.length > 0;
  }
}

module.exports = UserAPI;
