const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
    createdAt: String | Number,
    updatedAt: String | Number,
    deletedAt: String | Number | null,
}, {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
    }
});

UserSchema.pre('save', function(next) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    next();
});

mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');
