const logger = require('../config/logger');
const {ERRORS} = require('../utils/errors');
const {mediaConfig} = require('../config');
const Playlist = require('../models/Playlist');
const Audio = require('../models/Audio');
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
 * Get tje very content of a playlist
 * @param playlist
 * @returns {Promise<any>}
 */
const getPlaylistContent = (playlist) => {
    return new Promise((resolve, reject) => {
        if (playlist.content.length === 0) {
            resolve([]);
            return;
        }
        // [a1, a2, a5, v3, a5]
        let audioIds = [], videoIds = [];
        playlist.content.forEach(item => {
            if (item.type === mediaConfig.media.type.audio) {
                audioIds.push(item.id)
            } else videoIds.push(item.id);
        });
        // const audioIds = playlist.content.filter(item => item.type === mediaConfig.media.type.audio).map(item => item.id),
        //     videoIds = playlist.content.filter(item => item.type === mediaConfig.media.type.video).map(item => item.id);

        Promise
            .all([
                // Audio.find({_id : { $in : audios.map(a => a.item.id) } }),
                Audio.find({_id : { $in : audioIds } }),
                // Video.find({_id : { $in : videoIds } }),
            ])
            .then(values => {
                const result = [], audiosResult = values[0], videoResult = []; // values[1];
                /*console.log("audiosResult => ", audiosResult.length, " con => ", playlist.content.length);
                let a = audiosResult[0], b = playlist.content[0];
                console.log("ty a => ", typeof a._id.toString(), " ty b => ", typeof b.id);
                console.log("a => ", a._id.toString(), " b.id => ", b.id);
                console.log("a === b ", a._id.equals(b.id));*/


                // Map content data to gets the real value
                playlist.content.forEach((item, index) => {
                    if (item.type === mediaConfig.media.type.audio) {
                        const _item = audiosResult.find(a => a._id.equals(item.id));
                        if (_item) {
                            result[index] = {
                                ..._item.toJSON(),
                                mediaType: mediaConfig.media.type.audio,
                            };
                        }
                    } else {
                        const _item = videoResult.find(a => a._id.equals(item.id));
                        if (_item) {
                            result[index] = {
                                ..._item.toJSON(),
                                mediaType: mediaConfig.media.type.video,
                            };
                        }
                    }
                });
                resolve(result);
            })
            .catch(error => {
                logger.error("Error while getting playlist content of " + JSON.stringify(playlist) + ". The error: " + error);
                reject(null);
            });
    })
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
            if (error instanceof NotFoundModelWithId) {
                return socket.emit(outputEvent, {
                    outputEvent,
                    status: false,
                    errors: getErrors(ERRORS.PLAYLISTS.NOT_FOUND).errors,
                });
            }

            logger.error("Error while getting playlist content of id" + data.id + ". The error: " + error);
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
        cover: mediaConfig.playlist.cover.default.name,
        description: data.description || "",
        content: data.content || [],
        userId: socket.handshake.user._id
    });

    playlist
        .save()
        .then(_playlist => {
            socket.emit(outputEvent, {status: true, data: _playlist});
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
        if (data.name) {
            playlist.name = data.name;
        }

        if (data.description) {
            playlist.description = data.description;
        }

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
 * Add items to a playlist
 * @param socket
 * @param outputEvent
 * @param data Object(id: String, items: Array({id, type}))
 * @returns {Promise<void>}
 */
exports.reorderContent = async (socket, outputEvent, data) => {
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
        const playlist = await getOneOfModel(Playlist, data.id, false);
        // Check if items are correct
        if (!areContentIdentical(playlist.content.map(c => ({type: c.type, id: c.id.toString()})), data.items)) {
            return socket.emit(outputEvent, {
                outputEvent,
                status: false,
                errors: getErrors(ERRORS.PLAYLISTS.CONTENT_NOT_IDENTICAL).errors,
            });
        }

        // Update content
        playlist.content = [...data.items];

        // Update playlist
        playlist
            .save()
            .then(playlist => {
                socket.emit(outputEvent, {status: true, data: playlist});
            })
            .catch(error => {
                logger.error("Error while reordering items into a playlist " + JSON.stringify(playlist) + ". The error: " + error);
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

        logger.error("Error while reordering items into a playlist. The error: " + error);
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
        const playlist = await getOneOfModel(Playlist, data.id, false);

        // Remove all ?
        if (data.all) {
            playlist.content = [];
        } else {
            const itemsId = data.items.map(i => i.id);
            playlist.content = playlist.content.filter(item => !itemsId.includes(item.id.toString()));
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

        logger.error(`Error while removing items into a playlist with given data ${data}. The error: ${error}`);
        socket.emit(outputEvent, {
            outputEvent,
            status: false,
            errors: getErrors(ERRORS.SERVER.INTERNAL_SERVER_ERROR).errors,
        });
    }
};

/**
 * Check if two playlist content are identical
 *   i.e they have they same values but it may be in different order
 * @param source
 * @param incoming
 * @returns {*}
 */
const areContentIdentical = (source, incoming) => {
    return source.every(s => incoming.findIndex(i => i.id === s.id && i.type === s.type) !== -1)
        && incoming.every(i => source.findIndex(s => s.id === i.id && s.type === s.type) !== -1);
};
