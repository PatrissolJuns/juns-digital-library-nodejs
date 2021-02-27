const fs = require('fs');
const btoa = require('btoa');
const mm = require('music-metadata');
const Audio = require('../models/Audio');
const PlaylistController = require('../controllers/playlist');
const { getFileExtensionFromMimeType } = require('../helpers');


/**
 * Returns various property of an audio
 * @param audio
 * @returns {Promise<any>}
 */
const getAudioInformation = (audio) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get metadata
            const metadata = await mm.parseFile(audio.path, {duration: true});
            // Get cover art
            const image = mm.selectCover(metadata.common.picture);

            // Initialize default cover art
            let cover = process.env.DEFAULT_AUDIO_COVER, base64String = "";

            // Try to save cover art
            if (image) {
                // Map data from metadata cover art to base64
                for (let i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                }
                /* old system
                let base64String = "";
                var base64 = "data:" + image.format + ";base64," +  btoa(base64String); */

                // Get cover filename from audio source
                const baseFileName = audio.filename.split('.');

                // Set cover filename
                cover = baseFileName.slice(0, baseFileName.length - 1).join('') + '.' + getFileExtensionFromMimeType(image.format);

                try {
                    // Try to transform the base64 into an image file and save it
                    fs.writeFileSync(process.env.IMAGES_STORAGE_DIR + cover, btoa(base64String), {encoding: 'base64'});
                } catch (e) {
                    // Go back to default image in case of failure
                    cover = process.env.DEFAULT_AUDIO_COVER;
                }
            }

            resolve({
                artist: metadata.common.artist === undefined ? "unknown" : metadata.common.artist,
                album: metadata.common.album === undefined ? "unknown" : metadata.common.album,
                cover: cover,
                duration: metadata.format.duration,
                bitrate: metadata.format.bitrate,
                originalTitle: metadata.common.title === undefined ? "unknown" : metadata.common.title,
                title: audio.originalname,
                source: audio.filename,
                size: audio.size,
                year: metadata.common.year === undefined ? "unknown" : metadata.common.year,
            });
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Create an audio
 * @param req
 * @param res
 * @param next
 */
exports.createAudio = (req, res, next) => {
    getAudioInformation(req.file)
        .then(async (_data) => {
            const audio = new Audio({
                ..._data,
                title: req.body.title ? req.body.title : _data.title,
                isBookmarked: false,
                userId: req.user.userId,
                folderId: req.body.folderId,
            });

            try {
                await audio.save();
                res.status(200).json({
                    message: "Audio successfully saved!",
                    data: audio
                });
            } catch (error) {
                res.status(400).json({
                    error: error
                });
            }
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
};

exports.find = (query = {}) => Audio.find(query);

exports.getFromDBOneAudio = (_id) => {
    return Audio.findById(_id)
        .then(audio => audio)
        .catch(error =>null);
};

/* Web Socket API */

/**
 * Get all audios
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.getAll = (socket, outputEvent, data) => {
    Audio
        .find({})
        .then(audios => {
            socket.emit(outputEvent, {status: true, data: audios});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while getting all audios"});
        });
};

/**
 * Get one audio by id
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.getOneById = (socket, outputEvent, data) => {
    Audio
        .find({_id: data.id})
        .then(audio => {
            socket.emit(outputEvent, {status: true, data: audio});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while getting one audio by id"});
        });
};

/**
 * Rename an audio
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.rename = (socket, outputEvent, data) => {
    if (!data.title) {
        socket.emit(outputEvent, {status: false, error: "INVALID_TITLE", message: "Invalid title given"});
    }

    Audio
        .findByIdAndUpdate(data.id, {title: data.title})
        .then(audio => {
            socket.emit(outputEvent, {status: true, data: audio});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while renaming an audio"});
        });
};

/**
 * Set bookmark status of an audio
 * @param socket
 * @param outputEvent
 * @param data
 */
exports.setBookmark = (socket, outputEvent, data) => {
    if (data.isBookmarked === undefined || data.isBookmarked == null) {
        socket.emit(outputEvent, {status: false, error: "INVALID_BOOKMARK", message: "Invalid bookmark given"});
    }

    Audio
        .findByIdAndUpdate(data.id, {isBookmarked: data.isBookmarked})
        .then(audio => {
            socket.emit(outputEvent, {status: true, data: audio});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while setting bookmark on an audio"});
        });
};
