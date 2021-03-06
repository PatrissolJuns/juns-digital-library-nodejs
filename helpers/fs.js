const _ = require('lodash');
const du = require('du');
const fs = require('fs');
const glob = require("glob");
const {forAsync} = require('./index');
const FileType = require('file-type');
const ffmpeg = require('fluent-ffmpeg');

/* Check directory */
/**
 * Check if a given path is a directory
 * @param path
 * @param cb
 */
const isDirectory = (path, cb) => {
    if (typeof cb !== 'function') {
        throw new Error('expected a callback function');
    }

    if (typeof path !== 'string') {
        cb(new Error('expected path to be a string'));
        return;
    }

    fs.stat(path, function(err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                cb(null, false);
                return;
            }
            cb(err);
            return;
        }
        cb(null, stats.isDirectory());
    });
};

// Sync version
isDirectory.sync = function isDirectorySync(path) {
    if (typeof path !== 'string') {
        throw new Error('expected path to be a string');
    }

    try {
        const stat = fs.statSync(path);
        return stat.isDirectory();
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        } else {
            throw err;
        }
    }
};

/**
 * Check if a given path is a file
 * @param path
 * @param cb
 * @returns {*}
 */
const isFile = (path, cb) => {
    if (typeof cb !== 'function') {
        throw new Error('expected a callback function');
    }

    if (typeof path !== 'string') {
        cb(new Error('expected path to be a string'));
        return;
    }

    fs.stat(path, function(err, stats){
        if(err) return cb(err);
        return cb(null, stats.isFile());
    });
};

// Sync version
isFile.sync = function isFileSync(path) {
    return fs.existsSync(path) && fs.statSync(path).isFile();
};

/**
 * Get absolute path of user's storage directory
 */
const getUserStoragePath = id => `${process.cwd()}/${process.env.USERS_STORAGE_DIR}${id || ''}`;

/**
 *
 * @param name
 * @param type
 * @param userId
 * @returns {string[]|*}
 */
const findStoragePath = (name, type, userId) => {
    if (!userId) {
        throw new Error("UNKNOWN_USER");
    }
    // Get root user storage
    const basePath = getUserStoragePath(userId);

    if (!name || typeof name !== "string") {
        return [basePath + '/'];
    }

    let _name = name;
    if (type === 'd') {
        if (_name[_name.length - 1] !== '/')
            _name += '/';
    } else {
        if (_name[_name.length - 1] === '/')
            _name = _name.substring(0, _name.length - 1);
    }
    try {
        const matches = glob.sync(`**/${_name}`, {cwd: basePath});
        return matches.map(item => `${basePath}/${item}`);
    } catch (e) {
        throw e;
    }
};

/**
 * Get absolute path of a given name
 * @param name
 * @param userId
 * @returns {string}
 */
const getAbsolutePath = (name, userId) => {
    if (!name && !userId) {
        throw new Error("INVALID_USER_AND_NAME");
    }

    try {
        const basePath = getUserStoragePath(userId);

        // If there is no name, it means that we are on the root folder
        // So we return the root path
        if (!name) {
            return basePath + '/';
        }

        // Get matches path, the length would be 1 since folders' name is folders' id
        const matches = glob.sync(`**/*${name}*`, {cwd: basePath});

        // Prepend the base path
        return matches.map(item => `${basePath}/${item}${item[item.length - 1] === '/' ? '' : '/'}`)[0];
    } catch (e) {
        throw e;
    }
};

/**
 * Get all sub-folders and files of a folder
 * @param absoluteFolderPath {string}
 * @returns {*}
 */
const getFolderSubContent = (absoluteFolderPath) => {
    try {
        const matches = glob.sync(`**`, {cwd: absoluteFolderPath});
        return matches.map(item => `${absoluteFolderPath}/${item}`);
    } catch (e) {
        throw e;
    }
};

/**
 * Return an object size of a folder which contains 2 fields
 * @param absoluteFolderPath
 * @returns {Promise<{size: *, formattedSize: string}>}
 */
const getFolderSize = async (absoluteFolderPath) => {
    let size;
    try {
        size = await du(absoluteFolderPath);
    } catch (e) {
        throw e;
    }

    if (size > 1024 * 1024 * 1024)
        return {
            originalSize: size,
            formattedSize: `${_.round(size / (1024 * 1024 * 1024), 2)} GB`,
        };
    else if (size > 1024 * 1024)
        return {
            originalSize: size,
            formattedSize: `${_.round(size / (1024 * 1024), 2)} MB`,
        };
    else if (size > 1024)
        return {
            originalSize: size,
            formattedSize: `${_.round(size / 1024, 2)} KB`,
        };
    else return {
        originalSize: size,
        formattedSize: `${_.round(size, 2)} Bytes`,
    }
};

/**
 * Get following info
 *   - number of folders
 *   - number of files
 *   - number of audios
 *   - number of videos
 * @param absoluteFolderPath
 * @returns {Promise<{folders, audios, videos}&{files: number}>}
 */
const getFolderNumberStats = async (absoluteFolderPath) => {
    // Initialize the counters
    const result = {audios: 0, videos: 0, folders: 0};
    try {
        // Get all contents of a folders i.e sub-folders and files
        let contents = getFolderSubContent(absoluteFolderPath);

        // For each file or folder, increment counters
        await forAsync(contents, (item, index) => {
            return new Promise(async (resolve, reject) => {
                // If is a directory, increment the folder counter
                if (isDirectory.sync(item)) {
                    result.folders = result.folders + 1;
                    return resolve();
                }

                let fileType;
                try {
                    // Try to get file type of current file
                    fileType = await FileType.fromFile(item);
                } catch (e) {
                    return reject(e);
                }

                // If file is audio or video then try to distinguish them
                if (fileType && (fileType.mime.includes('audio') || fileType.mime.includes('video'))) {
                    ffmpeg(item).ffprobe(function (err, data) {
                        if (err) {
                            return reject(err);
                        }

                        // Check if the data contains at least one codec type equals to "video"
                        // In that case, the file is a video
                        if (data.streams.find(i => i.codec_type === 'video')) {
                            result.videos = result.videos + 1;
                            return resolve();
                        } else {
                            // Otherwise the file is an audio
                            result.audios = result.audios + 1;
                            return resolve();
                        }
                    });
                }

                // Otherwise skip the file
                else return resolve();
            });
        });
        return {
            ...result,
            files: result.audios + result.videos
        };
    } catch (e) {
        throw e;
    }
};

module.exports = {
    isFile,
    isDirectory,
    getFolderSize,
    findStoragePath,
    getAbsolutePath,
    getUserStoragePath,
    getFolderSubContent,
    getFolderNumberStats,
};
