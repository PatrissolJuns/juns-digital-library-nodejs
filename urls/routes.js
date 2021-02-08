const path = require('path');

const FOLDERS = {
    CONTENT: {
        INPUT: 'folders:one:content:input',
        OUTPUT: 'folders:one:content:output',
    },
    CREATE: {
        INPUT: 'folders:create:input',
        OUTPUT: 'folders:create:output',
    },
};

const AUDIOS = {
    BASE: '/audios',
    GET_ALL: '/',
    CREATE: '/create',
    RENAME: '/rename/:id',
    DELETE: '/delete/:id',
    TOGGLE_BOOKMARK: 'toggle-bookmark/:id',
};

const STORAGE_AUDIOS = {
    ROUTE: '/file/audio',
    DESTINATION: path.join(__dirname, '/Storage/audios'),
};
const STORAGE_IMAGES = {
    ROUTE: '/file/image',
    DESTINATION: path.join(__dirname, '/Storage/images'),
};

module.exports = {
    AUDIOS,
    FOLDERS,
    STORAGE_AUDIOS,
    STORAGE_IMAGES
};
