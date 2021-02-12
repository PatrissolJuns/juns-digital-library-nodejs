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
    ROUTE: '/file/audios',
    DESTINATION: '/' + process.env.AUDIOS_STORAGE_DIR,
};
const STORAGE_IMAGES = {
    ROUTE: '/file/images',
    DESTINATION: '/' + process.env.IMAGES_STORAGE_DIR,
};

module.exports = {
    AUDIOS,
    FOLDERS,
    STORAGE_AUDIOS,
    STORAGE_IMAGES
};
