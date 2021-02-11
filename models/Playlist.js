const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    name: String,
    content: [mongoose.Types.ObjectId],
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
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
