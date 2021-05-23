const {ERRORS} = require('../utils/errors');
const {MEDIA_TYPE, EXTENSIONS_FULL_LIST} = require('../constants');

/**
 * Generate a unique id
 * @returns {string}
 */
const generateId = () => new Date().valueOf().toString(36) + Math.random().toString(36).substr(2);

/**
 * Try to find extension from mime type
 * @param mimeType
 * @returns {string}
 */
const getFileExtensionFromMimeType = (mimeType) => {
    const extensions = JSON.parse(EXTENSIONS_FULL_LIST);
    const extMap = Object.entries(extensions);
    for (let i = 0; i < extMap.length; i++) {
        if (extMap[i][1].includes(mimeType))
            return extMap[i][0];
    }
};

/**
 * Get default media extension according to media type
 * @param mediaType
 * @returns {string}
 */
const getDefaultMediaExtension = mediaType => {
    switch (mediaType) {
        case MEDIA_TYPE.AUDIO:
            return 'mp3';
        case MEDIA_TYPE.VIDEO:
            return 'mp4';
        default:
            return 'jpg';
    }
};

/**
 * Get extension from mime type
 * @param mimeType
 * @param mediaType from MEDIA_TYPE constant
 * @returns {string}
 */
const geMediaExtensionFromMimeType = (mimeType, mediaType) => {
    // Check if we're treating audio, video or image
    if (!/audio|video|image/.test(mimeType))
        return getDefaultMediaExtension(mediaType);
    // Get media extension
    let extension = getFileExtensionFromMimeType(mimeType);
    // In case of not found, return default one
    if (!extension)
        extension = getDefaultMediaExtension(mediaType);

    return extension;
};

/**
 * Get base and extension from a file name
 * @param fileName
 * @returns {{ext: (string), base: string}}
 */
const getFileNameInfo = fileName => {
    const _baseFileName = fileName.split('.');
    // Get baseFilename
    return {
        ext: _baseFileName[_baseFileName.length - 1],
        base: _baseFileName.slice(0, _baseFileName.length - 1).join(''),
    }
};

/**
 * Perform async task while looping
 *
 * Reference:
 *  - https://stackoverflow.com/questions/40328932/javascript-es6-promise-for-loop
 *  - https://github.com/Download/for-async/blob/master/src/for-async.js
 * @param arr
 * @param work
 * @returns {*|Promise<any>}
 */
const forAsync = (arr, work) => {
    function loop(arr, i) {
        return new Promise((resolve, reject) => {
            if (i >= arr.length) {resolve()}
            else try {
                Promise.resolve(work(arr[i], i))
                /*.then(() => resolve(loop(arr, i+1)))
                .catch(reject)*/
                    .finally(() => resolve(loop(arr, i+1)));
            } catch(error) {reject(error)}
        })
    }
    return loop(arr, 0);
};

/**
 * Return the error response
 * @returns {{errors: {code: *, message: *}[], status: number}}
 * @param errors
 */
const getErrors = (...errors) => {
    return {
        status: 400,
        errors: errors.map(error => ({
            code: error.code,
            message: error.message,
        }))
    }
};

/**
 * Return the success response
 * @param data
 * @param message
 */
const getSuccess = (data, message = 'Success') => ({
    data,
    message,
    status: 200,
});

const error500 = (res) => {
    return res.status(500).json({status: 500, errors: [ERRORS.SERVER.INTERNAL_SERVER_ERROR]});
};

module.exports = {
    forAsync,
    error500,
    getErrors,
    getSuccess,
    generateId,
    getFileNameInfo,
    geMediaExtensionFromMimeType,
    getFileExtensionFromMimeType,
};
