const Folder = require('../models/Folder');
const AudioController = require('../controllers/audio');

/**
 * Get the full content of a folder
 * @param socket
 * @param outputEvent
 * @param data
 * @returns {Promise<void>}
 */
exports.getFolderContent = async (socket, outputEvent, data) => {
    try {
        let [folders, audios] = await Promise.all([
            Folder.find({parent: data.folderId, userId: socket.handshake.user._id}),
            AudioController.find({folder: data.folderId, userId: socket.handshake.user._id})
        ]);
        socket.emit(outputEvent, {status: true, data: {folders, audios, content: [folders, audios]}});
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
exports.createFolder = (socket, outputEvent, data) => {
    const folder = new Folder({
        name: data.name,
        userId: socket.handshake.user._id,
        parent: data.parent || null
    });

    folder
        .save()
        .then((newFolder) => {
            socket.emit(outputEvent, {status: true, data: newFolder});
        })
        .catch(error => {
            if (error.code === 11000) {
                socket.emit(outputEvent, {status: false, error: error, message: "The name is already in use"});
            } else {
                socket.emit(outputEvent, {status: false, error: error, message: "Error while creating a new folder"});
            }
        });
};
