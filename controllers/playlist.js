const logger = require('../config/logger');
const {ERRORS} = require('../utils/errors');
const {mediaConfig} = require('../config');
const Playlist = require('../models/Playlist');
const PlaylistValidator = require('../validations/playlist');
const {NotFoundModelWithId} = require('../utils/error-handler');
const {getErrors, isValidObjectId, getOneOfModel} = require('../helpers');

/**
 * Get all playlists
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.getAll = (socket, outputEvent, data) => {
    Playlist
        .find({userId: socket.handshake.user._id})
        .then(playlists => {
            socket.emit(outputEvent, {status: true, data: playlists});
        })
        .catch(error => {
            logger.error("Error while getting all playlists. The error: " + error);
            socket.emit(outputEvent, {
                outputEvent,
                status: false,
                errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
            });
        });
};

/**
 * Get one playlist
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.getOne = (socket, outputEvent, data) => {
    if (!isValidObjectId(data.id)) {
        return socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: getErrors(ERRORS.PLAYLISTS.UNKNOWN_PLAYLIST).errors,
        });
    }

    getOneOfModel(Playlist, data.id)
        .then(async playlist => {
            try {
                const content = await getPlaylistContent(playlist);
                socket.emit(outputEvent, {status: true, data: {...playlist, content}});
            } catch (e) { throw e; }
        })
        .catch(error => {
            logger.error("Error while getting playlist content of id" + id + ". The error: " + error);
            socket.emit(outputEvent, {
                outputEvent,
                status: false,
                errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
            });
        });
};

/**
 * Create a playlist
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.create = (socket, outputEvent, data) => {
    // validate
    const validation = PlaylistValidator.validateCreate(data);
    if (!validation.isCorrect) {
        return socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: validation.errors,
        });
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
            logger.error("Error while creating playlist with data " + JSON.stringify(data) + ". The error: " + error);
            socket.emit(outputEvent, {
                outputEvent,
                status: false,
                errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
            });
        });
};

/**
 * Update a playlist. This doest not include content property
 * @param socket
 * @param outputEvent
 * @param data Object(id: String, name?: String)
 */
exports.update = async (socket, outputEvent, data) => {
    // validate
    const validation = PlaylistValidator.validateUpdate(data);
    if (!validation.isCorrect) {
        return socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: validation.errors,
        });
    }

    try {
        const playlist = await getOneOfModel(Playlist, data.id);
        playlist.name = name;

        // Update playlist
        playlist
            .save()
            .then(playlist => {
                socket.emit(outputEvent, {status: true, data: playlist});
            })
            .catch(error => {
                logger.error("Error while updating a playlist " + JSON.stringify(playlist) + ". The error: " + error);
                socket.emit(outputEvent, {
                    outputEvent,
                    status: false,
                    errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
                });
            });
    } catch (e) {
        if (error instanceof NotFoundModelWithId) {
            return socket.emit(outputEvent, {
                outputEvent,
                status: false,
                errors: getErrors(ERRORS.PLAYLISTS.UNKNOWN_PLAYLIST).errors,
            });
        }

        socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
        });
    }
};


/**
 * Add items to a playlist
 * @param socket
 * @param outputEvent
 * @param data Object(id: String, items: Array({id, type}))
 * @returns {Promise<void>}
 */
exports.addItems = async (socket, outputEvent, data) => {
    // validate
    const validation = await PlaylistValidator.validateIdAndItems(data);
    if (!validation.isCorrect) {
        return socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: validation.errors,
        });
    }

    try {
        const playlist = await getOneOfModel(Playlist, data.id);
        playlist.content = [...playlist.content, ...data.items];

        // Update playlist
        playlist
            .save()
            .then(playlist => {
                socket.emit(outputEvent, {status: true, data: playlist});
            })
            .catch(error => {
                logger.error("Error while adding items into a playlist " + JSON.stringify(playlist) + ". The error: " + error);
                socket.emit(outputEvent, {
                    outputEvent,
                    status: false,
                    errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
                });
            });
    } catch (error) {
        if (error instanceof NotFoundModelWithId) {
            return socket.emit(outputEvent, {
                outputEvent,
                status: false,
                errors: getErrors(ERRORS.PLAYLISTS.UNKNOWN_PLAYLIST).errors,
            });
        }

        socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
        });
    }
};

/**
 * Remove some elements from a playlist
 * @param socket
 * @param outputEvent
 * @param data Object(id: String, items: Array({id, type}), all: Boolean)
 * @returns {Promise<void>}
 */
exports.removeContent = async (socket, outputEvent, data) => {
    // validate
    const validation = await PlaylistValidator.validateIdAndItems(data);
    if (!validation.isCorrect) {
        return socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: validation.errors,
        });
    }

    try {
        const playlist = await getOneOfModel(Playlist, data.id);

        // Remove all ?
        if (data.all) {
            playlist.content = [];
        } else {
            const itemsId = data.items.map(i => i.id);
            playlist.content = playlist.content.filter(item => !itemsId.includes(item.id));
        }

        // Update playlist
        playlist
            .save()
            .then(playlist => {
                socket.emit(outputEvent, {status: true, data: playlist});
            })
            .catch(error => {
                logger.error("Error while removing items into a playlist " + JSON.stringify(playlist) + ". The error: " + error);
                socket.emit(outputEvent, {
                    outputEvent,
                    status: false,
                    errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
                });
            });
    } catch (error) {
        if (error instanceof NotFoundModelWithId) {
            return socket.emit(outputEvent, {
                outputEvent,
                status: false,
                errors: getErrors(ERRORS.PLAYLISTS.UNKNOWN_PLAYLIST).errors,
            });
        }

        socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
        });
    }
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
        const audioIds = playlist.content.filter(item => item.type === mediaConfig.media.type.audio).map(item => item.id),
              videoIds = playlist.content.filter(item => item.type === mediaConfig.media.type.video).map(item => item.id);

        Promise
            .all([
                // Audio.find({_id : { $in : audios.map(a => a.item.id) } }),
                Audio.find({_id : { $in : audioIds } }),
                // Video.find({_id : { $in : videoIds } }),
            ])
            .then(values => {
                const result = [], audiosResult = values[0], videoResult = []; // values[1];

                // Map content data to gets the real value
                playlist.content.forEach((item, index) => {
                    if (item.type === process.env.MEDIA_TYPE_AUDIO) {
                        result[index] = audiosResult.find(a => a._id === item.id);
                    } else result[index] = videoResult.find(v => v._id === item.id);
                });
                resolve(result);
            })
            .catch(error => {
                logger.error("Error while getting playlist content of " + JSON.stringify(playlist) + ". The error: " + error);
                reject(null);
            });
    })
};
