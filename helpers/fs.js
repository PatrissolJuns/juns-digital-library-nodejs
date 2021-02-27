const fs = require('fs');
const glob = require("glob");

/* Check directory */
/**
 * Check if a given path is a directory
 * @param path
 * @param cb
 */
function isDirectory(path, cb) {
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
}
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
function isFile(path, cb){
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
}
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
 */
function findStoragePath (name, type, userId) {
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
}

/**
 * Get absolute path of a given folder name
 * @param userId
 * @param folderParentId
 * @returns {string}
 */
const getFolderAbsolutePath = (userId, folderParentId = null) => {
    try {
        const result = findStoragePath(folderParentId, 'd', userId);
        return result[0];
    } catch (e) {
        throw e;
    }
};

module.exports = {
    isFile,
    isDirectory,
    findStoragePath,
    getUserStoragePath,
    getFolderAbsolutePath,
};
