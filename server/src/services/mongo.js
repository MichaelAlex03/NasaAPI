const mongoose = require('mongoose');
const dotenv = require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect(){
    mongoose.connect(MONGO_URL);
}

module.exports = {
    mongoConnect,
};