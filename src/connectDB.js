const { MongoClient } = require('mongodb');

let client

async function connectDB() {
    const url = 'mongodb://localhost:27017/';
    const dbname = 'apollo-tutorial-test';
    
    try {
        if (!client) {
            client = await MongoClient.connect(url,{useNewUrlParser:true});
        }
        return client.db(dbname)
    } catch(err) {
        return Promise.reject(err);
    }
    
};

module.exports = { connectDB };