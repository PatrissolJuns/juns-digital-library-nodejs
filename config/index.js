/*
* Main Configuration file
*
* Here're all config variables. Most of them are coming from .env file so be sure to get the file with correct content
* */
const baseSubDirConfig = {
    hls: "hls",
    dash: "dash",
    pictures: "pictures",
};

const mediaConfig = {
    media: {
        baseDir: process.env.STORAGE_DIR,
        baseUrl: process.env.STATIC_BASE_URL,
    },
    audio: {
        storage: process.env.AUDIOS_STORAGE_DIR,
        hls: {
            url: process.env.HLS_AUDIO_URL,
            time: Number(process.env.HLS_AUDIO_TIME),
            indexName: process.env.HLS_AUDIO_INDEX_NAME,
        },
        raw: {
            url: process.env.RAW_AUDIO_URL,
            name: process.env.RAW_AUDIO_NAME,
        },
        cover: {
            url: process.env.COVER_PICTURE_AUDIO_URL,
            name: process.env.COVER_PICTURE_AUDIO_NAME,
            default: {
                path: process.env.DEFAULT_AUDIO_COVER_PATH,
                name: process.env.DEFAULT_AUDIO_COVER_NAME,
                base: process.env.DEFAULT_AUDIO_COVER_BASE,
                extension: process.env.DEFAULT_AUDIO_COVER_EXTENSION,
            },
        },
        extensions: {
            // This is obtained from Object.entries(EXTENSIONS_FULL_LIST).filter(e=> e[1].some(e => /audio/.test(e))).map(e => e[0]).join('|')
            acceptedRegex: /\.(au|ac3|flac|ogg|m4a|aac|wav|mp3|mid|aif|ram|rpm|ra|wma)$/ig,
        }
    },
    video: {
        storage: process.env.VIDEOS_STORAGE_DIR,
        hls: {
            url: process.env.HLS_VIDEO_URL,
            time: Number(process.env.HLS_VIDEO_TIME),
            indexName: process.env.HLS_VIDEO_INDEX_NAME,
        },
        raw: {
            url: process.env.RAW_VIDEO_URL,
            name: process.env.RAW_VIDEO_NAME,
        },
        cover: {
            url: process.env.COVER_PICTURE_VIDEO_URL,
            name: process.env.COVER_PICTURE_VIDEO_NAME,
            default: {
                path: process.env.DEFAULT_VIDEO_COVER_PATH,
                name: process.env.DEFAULT_VIDEO_COVER_NAME,
                base: process.env.DEFAULT_VIDEO_COVER_BASE,
                extension: process.env.DEFAULT_VIDEO_COVER_EXTENSION,
            },
        },
        extensions: {
            // This is obtained from Object.entries(EXTENSIONS_FULL_LIST).filter(e=> e[1].some(e => /video/.test(e))).map(e => e[0]).join('|')
            acceptedRegex: /\.(vlc|wmv|ogg|3g2|3gp|mp4|f4v|flv|webm|mpeg|mov|avi|movie|rv|jp2)$/ig,
        }
    },
};

module.exports = {
    mediaConfig,
    baseSubDirConfig,
};
