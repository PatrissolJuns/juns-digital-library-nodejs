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
        .then(async playlist => {
            const content = await getPlaylistContent(playlist);
            if (content) {
                socket.emit(outputEvent, {status: true, data: {...playlist, content}});
            } else socket.emit(outputEvent, {status: false, error: error, message: "Error while getting content of playlist"});
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

/**
 * Get tje very content of a playlist
 * @param playlist
 * @returns {Promise<any>}
 */
exports.getPlaylistContent = (playlist) => {
    return new Promise((resolve, reject) => {
        // [a1, a2, a5, v3, a5]
        /*let audios = [], videos = [];
        playlist.content.filter((item, index) => {
            if (item.type === process.env.MEDIA_TYPE_AUDIO) {
                audios.push({item: item, index})
            } else videos.push({item: item, index})
        });*/
        const audioIds = playlist.content.filter(item => item.type === process.env.MEDIA_TYPE_AUDIO).map(item => item.id),
              videoIds = playlist.content.filter(item => item.type === process.env.MEDIA_TYPE_VIDEO).map(item => item.id);

        Promise
            .all([
                // Audio.find({_id : { $in : audios.map(a => a.item.id) } }),
                Audio.find({_id : { $in : audioIds } }),
                // Video.find({_id : { $in : videoIds } }),
            ])
            .then(values => {
                const result = [], audiosResult = values[0], videoResult = values[1];

                // Map content data to gets the real value
                playlist.content.forEach((item, index) => {
                    if (item.type === process.env.MEDIA_TYPE_AUDIO) {
                        result[index] = audiosResult.find(a => a._id === item.id);
                    } else result[index] = videoResult.find(v => v._id === item.id);
                });
                resolve(result);
            })
            .catch(error => {
                reject(null);
            });
    })
};
