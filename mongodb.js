const mongoose = require('mongoose');

const initMongoDb = () => {
    mongoose
        .connect(
            process.env.MONGO_DB_URL || 'mongodb://localhost:27017/jdl',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        ).then(() => {
            console.log('Connected to mongoDB');
        })
        .catch(e => {
            console.log('Error while DB connecting');
            process.exit("Unable to connect to database");
        });
};

module.exports = {
    initMongoDb
};
