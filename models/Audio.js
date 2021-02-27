const mongoose = require('mongoose');

const AudioSchema = new mongoose.Schema({
    artist: String,
    album: String,
    cover: String,
    duration: Number,
    bitrate: Number,
    isBookmarked: Boolean,
    source: String,
    size: Number,
    title: String,
    // This is a title from metadata
    originalTitle: String,
    year: String,
    folderId: {
        ref: 'Folder',
        required: [true, "The folderId field is required"],
        type: mongoose.Types.ObjectId
    } | null,
    userId: {
        ref: 'User',
        required: [true, "The userId field is required"],
        type: mongoose.Types.ObjectId
    },
    createdAt: String | Number,
    updatedAt: String | Number,
    deletedAt: String | Number | null,
}, { versionKey: false });

AudioSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        const result = {id: ret._id, ...ret};
        delete result._id;
        return result;
    }
});

AudioSchema.pre('save', function(next) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    next();
});

mongoose.model('Audio', AudioSchema);

module.exports = mongoose.model('Audio');
