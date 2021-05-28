const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "The name field is required"],
    },
    userId: {
        ref: 'User',
        required: [true, "The userId field is required"],
        type: mongoose.Types.ObjectId
    },
    description: String,
    parentFolderId: String | null,
    createdAt: String | Number,
    updatedAt: String | Number,
    deletedAt: String | Number | null,
}, { versionKey: false });

FolderSchema.pre('save', function(next) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    next();
});

FolderSchema.pre('updateOne', function() {this.set({ updatedAt: new Date() });});
FolderSchema.pre('findByIdAndUpdate', function() {this.set({ updatedAt: new Date() });});

FolderSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        const result = {id: ret._id, ...ret};
        delete result._id;
        return result;
    }
});

FolderSchema.pre('update', function(next) {
    this.updatedAt = Date.now();
    next();
});

mongoose.model('Folder', FolderSchema);

module.exports = mongoose.model('Folder');
