const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const {MEDIA_TYPE} = require('../constants');
const {mediaConfig, baseSubDirConfig} = require('../config');
const {geMediaExtensionFromMimeType} = require('../helpers');

const maxSize = 900000000;

/**
 * Audio upload handler
 * @type {DiskStorage}
 */
const audioStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        // Get a new audio id
        let audioId = mongoose.Types.ObjectId(), isAudioIdUnique = true;
        // Get the new directory
        const  dir = `${mediaConfig.audio.storage}/${audioId}`;
        do {
            // Check if it the folder we're about to create already exists
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);

                // Save audioId into req object to use it later
                req.audioId = audioId;
                isAudioIdUnique = true;

                // Create all its sub-directories
                Object.values(baseSubDirConfig).map(subDir => {
                    const _subDir = `${dir}/${subDir}`;
                    fs.mkdirSync(_subDir);
                });
            } else {
                // Regenerate id
                audioId = mongoose.Types.ObjectId();
                isAudioIdUnique = false;
            }
        } while (!isAudioIdUnique);

        callback(null, dir);
        // callback(null, 'config');
    },
    filename: (req, file, callback) => {
        // File base name
        const base = req.audioId;
        // File Extension
        const extension = geMediaExtensionFromMimeType(file.mimetype, MEDIA_TYPE.AUDIO);
        callback(null, base + '.' + extension);
    }
});

/**
 * File extension to only accept supported audio files
 * @param req
 * @param file
 * @param cb
 * @returns {*}
 */
const audioFilter = function(req, file, cb) {
    // Accept audio only
    if (!file.originalname.match(mediaConfig.audio.extensions.acceptedRegex)) {
        req.fileValidationError = 'Only audio files are allowed!';
        return cb(new Error('Only audio files are allowed!'), false);
    }
    cb(null, true);
};

/**
 * File extension to only accept supported video files
 * @param req
 * @param file
 * @param cb
 * @returns {*}
 */
const videoFilter = function(req, file, cb) {
    // Accept video only
    if (!file.originalname.match(mediaConfig.video.extensions.acceptedRegex)) {
        req.fileValidationError = 'Only video files are allowed!';
        return cb(new Error('Only video files are allowed!'), false);
    }
    cb(null, true);
};

module.exports = {
    audioMulter: multer({
        storage: audioStorage,
        fileFilter: audioFilter,
        limits: {
            fileSize: maxSize
        }
    }).single('audioFile'), // 'audioFile' is the name of the file
};
