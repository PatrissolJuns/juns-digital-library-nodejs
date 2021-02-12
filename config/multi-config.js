const multer = require('multer');
const { generateId, getFileExtensionFromMimeType } = require('../helpers');

///////////////// AUDIO

const maxSize = 900000000;


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, process.env.AUDIOS_STORAGE_DIR);
        // callback(null, 'config');
    },
    filename: (req, file, callback) => {
        const name = generateId();
        const extension = getFileExtensionFromMimeType(file.mimetype);
        callback(null, name + '.' + extension);
    }
});

module.exports = multer({storage: storage, limits: {fileSize: maxSize }}).single('audio');




///////////////// IMAGES
/*
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({storage: storage}).single('image');*/
