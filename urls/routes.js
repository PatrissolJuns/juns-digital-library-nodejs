const {mediaConfig} = require('../config');

const FOLDERS = {
    CONTENT: {
        INPUT: 'folders:one:content:input',
        OUTPUT: 'folders:one:content:output',
    },
    CREATE: {
        INPUT: 'folders:create:input',
        OUTPUT: 'folders:create:output',
    },
    UPDATE: {
        INPUT: 'folders:one:update:input',
        OUTPUT: 'folders:one:update:output',
    },
    DETAILS: {
        INPUT: 'folders:one:details:input',
        OUTPUT: 'folders:one:details:output',
    },
    EMPLACEMENT: {
        INPUT: 'folders:one:emplacement:input',
        OUTPUT: 'folders:one:emplacement:output',
    }
};

const PLAYLISTS = {
    GET_ALL: {
        INPUT: 'playlists:all:get:input',
        OUTPUT: 'playlists:all:get:output',
    },
    GET_ONE: {
        INPUT: 'playlists:one:get:input',
        OUTPUT: 'playlists:one:get:output',
    },
    ITEMS: {
        ADD: {
            INPUT: 'playlists:items:add:input',
            OUTPUT: 'playlists:items:add:output',
        },
        REORDER: {
            INPUT: 'playlists:items:reorder:input',
            OUTPUT: 'playlists:items:reorder:output',
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
    UPDATE: {
        INPUT: 'playlists:one:update:input',
        OUTPUT: 'playlists:one:update:output',
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

const STORAGE = {
    BASE: mediaConfig.media.baseUrl,
    AUDIOS: {
        HLS: mediaConfig.audio.hls.url,
        RAW: mediaConfig.audio.raw.url,
        COVER: mediaConfig.audio.cover.url,
    },
    VIDEOS: {
        HLS: mediaConfig.video.hls.url,
        RAW: mediaConfig.video.raw.url,
        COVER: mediaConfig.video.cover.url,
    },
    PLAYLISTS: {
        COVER: mediaConfig.playlist.cover.url,
    },
};

module.exports = {
    AUDIOS,
    FOLDERS,
    STORAGE,
    PLAYLISTS,
};
