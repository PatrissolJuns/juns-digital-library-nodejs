const mongoose = require('mongoose');

const PlaylistContentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Audio', 'Video']
    },
    id: {
        required: true,
        type: mongoose.Types.ObjectId,
        refPath: 'type'
    }
});

const PlaylistSchema = new mongoose.Schema({
    name: String,
    content: [PlaylistContentSchema],
    userId: {
        ref: 'User',
        required: [true, "The userId field is required"],
        type: mongoose.Types.ObjectId
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

mongoose.model('Playlist', PlaylistSchema);

module.exports = mongoose.model('Playlist');


// Virtual property

/*
personSchema.virtual('fullName').get(function () {
    return this.name.first + ' ' + this.name.last;
});*/
