const FOLDERS = {
    CONTENT: {
        INPUT: 'folders:one:content:input',
        OUTPUT: 'folders:one:content:output',
    },
    CREATE: {
        INPUT: 'folders:create:input',
        OUTPUT: 'folders:create:output',
    },
    RENAME: {
        INPUT: 'folders:one:rename:input',
        OUTPUT: 'folders:one:rename:output',
    },
};

const PLAYLISTS = {
    GET_ALL: {
        INPUT: 'playlists:all:get:input',
        OUTPUT: 'playlists:all:get:output',
    },
    ITEMS: {
        ADD: {
            INPUT: 'playlists:items:add:input',
            OUTPUT: 'playlists:items:add:output',
        },
        REMOVE: {
            INPUT: 'playlists:items:remove:input',
            OUTPUT: 'playlists:items:remove:output',
        },
    },
    CREATE: {
        INPUT: 'playlists:create:input',
        OUTPUT: 'playlists:create:output',
    },
    RENAME: {
        INPUT: 'playlists:one:rename:input',
        OUTPUT: 'playlists:one:rename:output',
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
    },
    BOOKMARK: {
        INPUT: 'audios:one:bookmark:input',
        OUTPUT: 'audios:one:bookmark:output',
    },
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
    PLAYLISTS,
    STORAGE_AUDIOS,
    STORAGE_IMAGES
};
