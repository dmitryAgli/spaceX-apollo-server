const { MongoClient } = require('mongodb');

let client

async function connectDB() {
    // const url = 'mongodb://localhost:27017/';
    const url = 'mongodb://admin:mLab328654@ds131676.mlab.com:31676/heroku_qzd1d9lm'
    // const dbname = 'apollo-tutorial-test';
    const dbname = 'heroku_qzd1d9lm';
    
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