const du = require('du');
const fs = require('fs');
const Folder = require('../models/Folder');
const logger = require('../config/logger');
const {getErrors} = require('../helpers');
const {ERRORS} = require('../utils/errors');
const AudioController = require('../controllers/audio');
const {getAbsolutePath, getFolderSize, getFolderNumberStats} = require('../helpers/fs');

/**
 * Check if a given folderId exists
 * @param folderId
 * @param isParent
 * @returns {Promise<{errors: {code: *, message: *}[], status: boolean}|*>}
 */
const checkFolder = async (folderId, isParent = false) => {
    let folder;
    try {
        // Check if the folder exists
        folder = await Folder.findById(folderId);
        return folder
            ? {status: true, folder}
            :  {
                status: false,
                errors: getErrors(ERRORS.FOLDERS[!isParent ? 'UNKNOWN_FOLDER' : 'UNKNOWN_PARENT_FOLDER']).errors,
            };
    } catch (error) {
        logger.error("Error while looking for a folder " + JSON.stringify(data.folderId) + ". The error: " + error);
        return {
            status: false,
            errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
        }
    }
};

/**
 * Get the full content of a folder
 * @param socket
 * @param outputEvent
 * @param data
 * @returns {Promise<void>}
 */
exports.getFolderContent = async (socket, outputEvent, data) => {
    console.log("data => ", data);
    if (!data || typeof data !== "object" || !data.hasOwnProperty('folderId')) {
        return socket.emit(outputEvent, {
            status: false,
            errors: [{...ERRORS.FIELDS.REQUIRED, field: "folderId"}]
        });
    }
    // Check if the folder exists
    let _checkFolder;
    if (data.folderId) {
        _checkFolder = await checkFolder(data.folderId, false);
        if (!_checkFolder.status) {
            return socket.emit(outputEvent, _checkFolder)
        }
    }

    // Get the proper content
    try {
        let [folders, audios] = await Promise.all([
            Folder.find({parentFolderId: data.folderId, userId: socket.handshake.user._id}),
            AudioController.find({folder: data.folderId, userId: socket.handshake.user._id})
        ]);
        socket.emit(outputEvent, {status: true, data: {
            folders,
            audios,
            folder: data.folderId ? _checkFolder.folder : {id: null}
        }});
    } catch (e) {
        socket.emit(outputEvent, {status: false, error: e, message: "Error while getting content folder"});
    }
};

/**
 * Create a folder
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.createFolder = async (socket, outputEvent, data) => {
    const parentFolderId = data.parentId || null;
    // Check if parent folder exists i.e is equal to correct FolderId or null
    if (parentFolderId) {
        // Check if the folder exists
        const _checkFolder = await checkFolder(parentFolderId, true);
        if (!_checkFolder.status) {
            return socket.emit(outputEvent, _checkFolder)
        }
    }

    const folder = new Folder({
        name: data.name,
        description: data.description || '',
        userId: socket.handshake.user._id,
        parentFolderId: parentFolderId
    });

    // Path of the new folder
    let path;
    try {
        path = getAbsolutePath(parentFolderId, socket.handshake.user._id) + folder._id;
        // Create folder into the data
        const newFolder = await folder.save();
        // Create physical folder
        fs.mkdirSync(path, {recursive: true});
        // if everything well fine return folder
        socket.emit(outputEvent, {status: true, data: newFolder});
    } catch (error) {
        // Delete folder into database
        Folder.deleteOne({_id: folder._id}).catch(e => null);

        // Delete physical folder
        fs.rmdir(path, (err) => null);

        logger.error("Error while creating a new folder " + JSON.stringify(folder) + ". The error: " + error);

        if (error.code === 11000) {
            socket.emit(outputEvent, {
                status: false,
                errors: getErrors(ERRORS.FOLDERS.NAME_ALREADY_EXISTS).errors
            });
        } else {
            socket.emit(outputEvent, {
                status: false,
                errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
            });
        }
    }
};

/**
 * Rename a folder
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.rename = (socket, outputEvent, data) => {
    if (!data.name) {
        return socket.emit(outputEvent, {
            status: false,
            errors: [{...ERRORS.FIELDS.REQUIRED, field: "name"}]
        });
    }

    Folder
        .findByIdAndUpdate(data.id, {name: data.name})
        .then(folder => {
            socket.emit(outputEvent, {status: true, data: folder});
        })
        .catch(error => {
            logger.error("Error while renaming a folder " + JSON.stringify(data) + ". The error: " + error);
            socket.emit(outputEvent, {
                status: false,
                errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
            });
        });
};

/**
 * Get details of a folder
 * @param socket
 * @param outputEvent
 * @param data
 * @returns {Promise<*>}
 */
exports.getDetails = async (socket, outputEvent, data) => {
    if (!data || typeof data !== "object" || !data.folderId) {
        return socket.emit(outputEvent, {
            status: false,
            errors: [{...ERRORS.FIELDS.REQUIRED, field: "folderId"}]
        });
    }
    try {
        const absoluteFolderPath = getAbsolutePath(data.folderId);

        let [folder, size, lstat, numberOf] = await Promise.all([
            Folder.findById(data.folderId),
            getFolderSize(absoluteFolderPath),
            fs.promises.lstat(absoluteFolderPath),
            getFolderNumberStats(absoluteFolderPath)
        ]);

         const result = {
             size,
             type: 'Folder',
             lastAccessedDate: lstat.atimeMs,
             lastModifiedDate: lstat.mtimeMs,
             numberOf,
             ...folder.toJSON(),
         };

        return socket.emit(outputEvent, {status: true, data: result});
    } catch (error) {
        logger.error("Error while getting folder details " + JSON.stringify(data) + ". The error: " + error);
        return socket.emit(outputEvent, {
            status: false,
            errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
        });
    }
};
