const mongoose = require('mongoose');

mongoose.model(
    'User',
    new mongoose.Schema({
        login: String,
        email: {
            type: String,
            required: [true, "The email field is required"],
            unique: 1,
        },
        password: {
            type: String,
            required: [true, "The password field is required"],
        },
    }, {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.hash;
        }
    })
);



module.exports = mongoose.model('User');
