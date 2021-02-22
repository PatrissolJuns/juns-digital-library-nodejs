const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, "The login field is required"],
        // unique: 1,
    },
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
});

UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        const result = {id: ret._id, ...ret};
        delete result._id;
        delete result.password;
        return result;
    }
});

UserSchema.pre('save', function(next) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    next();
});

mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');
