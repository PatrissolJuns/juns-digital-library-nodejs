const {mediaConfig} = require('../config');
const {getFileNameInfo} = require("../helpers");

const mongoose = require('mongoose');

const PlaylistContentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: mediaConfig.media.types
    },
    id: {
        required: true,
        refPath: 'type',
        type: mongoose.Types.ObjectId,
    }
});

const PlaylistSchema = new mongoose.Schema({
    name: String,
    cover: String,
    content: [PlaylistContentSchema],
    userId: {
        ref: 'User',
        type: mongoose.Types.ObjectId,
        required: [true, "The userId field is required"],
    },
    createdAt: String | Number,
    updatedAt: String | Number,
    deletedAt: String | Number | null,
}, { versionKey: false });

PlaylistSchema.pre('save', function(next) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    next();
});

PlaylistSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        const result = {id: ret._id, ...ret};
        delete result._id;
        result._cover = getFileNameInfo(result.cover);
        return result;
    }
});

mongoose.model('Playlist', PlaylistSchema);

module.exports = mongoose.model('Playlist');


// Virtual property

/*
personSchema.virtual('fullName').get(function () {
    return this.name.first + ' ' + this.name.last;
});*/
