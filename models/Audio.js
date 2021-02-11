const mongoose = require('mongoose');

const AudioSchema = new mongoose.Schema({
    artist: String,
    album: String,
    cover: String,
    duration: String,
    isBookmark: Boolean,
    musicSrc: String,
    size: Number,
    track: String,
    year: String,
    folderId: {
        type: mongoose.Types.ObjectId,
        ref: 'Folder'
    } | null,
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    createdAt: String | Number,
    updatedAt: String | Number,
    deletedAt: String | Number | null,
}, { versionKey: false });

AudioSchema.pre('save', function(next) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    next();
});

mongoose.model('Audio', AudioSchema);

module.exports = mongoose.model('Audio');
