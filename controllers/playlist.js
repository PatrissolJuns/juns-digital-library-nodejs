const Playlist = require('../models/Playlist');

/**
 * Get all playlists
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.getAll = (socket, outputEvent, data) => {
    Playlist
        .find({})
        .then(playlists => {
            socket.emit(outputEvent, {status: true, data: playlists});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while getting all playlists"});
        });
};

/**
 * Get one playlist
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.getOne = (socket, outputEvent, data) => {
    if (!data.id) {
        socket.emit(outputEvent, {status: false, error: "INVALID_ID", message: "Invalid id given"});
    }

    Playlist
        .findById(data.id)
        .then(playlist => {
            socket.emit(outputEvent, {status: true, data: playlist});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while getting a playlist"});
        });
};

/**
 * Rename a playlist
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.rename = (socket, outputEvent, data) => {
    if (!data.name) {
        socket.emit(outputEvent, {status: false, error: "INVALID_NAME", message: "Invalid name given"});
    }

    Playlist
        .findByIdAndUpdate(data.id, {name: data.name})
        .then(playlist => {
            socket.emit(outputEvent, {status: true, data: playlist});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while renaming a playlist"});
        });
};

/**
 * Create a playlist
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.create = (socket, outputEvent, data) => {
    if (!data.name) {
        socket.emit(outputEvent, {status: false, error: "INVALID_NAME", message: "Invalid name given"});
    }

    const playlist = new Playlist({
        name: data.name,
        content: data.content || [],
    });
    playlist
        .save()
        .then(playlist => {
            socket.emit(outputEvent, {status: true, data: playlist});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while creating a playlist"});
        });
};

/**
 * Add items to a playlist
 * @param socket
 * @param outputEvent
 * @param data
 * @returns {Promise<void>}
 */
exports.addItems = async (socket, outputEvent, data) => {
    if (!data.items || !Array.isArray(data.items)) {
        socket.emit(outputEvent, {status: false, error: "INVALID_ITEMS", message: "Invalid items given"});
    }

    if (data.items.length === 0) {
        socket.emit(outputEvent, {status: false, error: "EMPTY_ITEMS", message: "Empty items given"});
    }

    const playlist = await this.getFromDBOnePlaylist(data.id);
    if (playlist) {
        playlist
            .update({content: [...new Set([...playlist.content, ...data.items])]})
            .then(playlist => {
                socket.emit(outputEvent, {status: true, data: playlist});
            })
            .catch(error => {
                socket.emit(outputEvent, {status: false, error: error, message: "Error while adding items into a playlist"});
            });
    } else {
        socket.emit(outputEvent, {status: false, error: "INVALID_PLAYLIST_SELECTED", message: "Error while adding items into a playlist"});
    }
};

/**
 * Remove some elements from a playlist
 * @param socket
 * @param outputEvent
 * @param data
 * @returns {Promise<void>}
 */
exports.removeContent = async (socket, outputEvent, data) => {
    if (!data.items || !Array.isArray(data.items)) {
        socket.emit(outputEvent, {status: false, error: "INVALID_ITEMS", message: "Invalid items given"});
    }

    if (data.items.length === 0) {
        socket.emit(outputEvent, {status: false, error: "EMPTY_ITEMS", message: "Empty items given"});
    }

    const playlist = await this.getFromDBOnePlaylist(data.id);
    if (playlist) {
        playlist
            .update({content: playlist.content.filter(audio => !data.items.includes(audio))})
            .then(playlist => {
                socket.emit(outputEvent, {status: true, data: playlist});
            })
            .catch(error => {
                socket.emit(outputEvent, {status: false, error: error, message: "Error while adding items into a playlist"});
            });
    } else {
        socket.emit(outputEvent, {status: false, error: "INVALID_PLAYLIST_SELECTED", message: "Error while adding items into a playlist"});
    }
};

exports.getFromDBOnePlaylist = (_id) => {
    return Playlist
        .findById(_id)
        .then(playlist => playlist)
        .catch(error => null);
};
