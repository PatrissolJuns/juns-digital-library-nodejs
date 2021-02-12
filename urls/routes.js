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
    CREATE: '/create',
    // GET_ALL: '/',
    // RENAME: '/rename/:id',
    // DELETE: '/delete/:id',
    // TOGGLE_BOOKMARK: 'toggle-bookmark/:id',
    GET_ALL: {
        INPUT: 'audios:all:get:input',
        OUTPUT: 'audios:all:get:output',
    },
    GET_ONE: {
        BY_ID: {
            INPUT: 'audios:one:get:by:id:input',
            OUTPUT: 'audios:one:get:by:id:output',
        }
    },
    RENAME: {
        INPUT: 'audios:one:rename:input',
        OUTPUT: 'audios:one:rename:output',
    }
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
