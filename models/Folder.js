const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "The name field is required"],
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    parent: {
        type: String | null,
        /*validate: {
            validator: function(v) {
                return v ? true : true;
                // return v ? mongoose.isValidObjectId(v) : true;
            },
            message: props => `${props.value} is not a valid folder!`
        },*/
    },
    createdAt: String | Number,
    updatedAt: String | Number,
    deletedAt: String | Number | null,
}, { versionKey: false });

FolderSchema.pre('save', function(next) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    next();
});

FolderSchema.pre('update', function(next) {
    this.updatedAt = Date.now();
    next();
});

mongoose.model('Folder', FolderSchema);

module.exports = mongoose.model('Folder');
