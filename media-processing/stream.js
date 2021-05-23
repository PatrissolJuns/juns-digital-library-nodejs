const fs = require('fs');
const mongoose = require('mongoose');
const Audio = require('../models/Audio');
const {ERRORS} = require('../utils/errors');
const logger = require('./../config/logger');
const ffmpeg = require('child_process').exec;
const {getErrors, getSuccess} = require('../helpers');
const {mediaConfig, baseSubDirConfig} = require('../config');

/**
 * Create hls files for audio media
 * @param audioId
 * @param fileName
 */
const createAudioHls = async (audioId, fileName) => {
    const input = `${mediaConfig.audio.storage}/${audioId}/${fileName}`;
    const output = `${mediaConfig.audio.storage}/${audioId}/${baseSubDirConfig.hls}/${mediaConfig.audio.hls.indexName}`;

    logger.info(`About to generate a new hls for audioId ${audioId}`);

    ffmpeg(
        // `ffmpeg -i ${input} -codec: copy -start_number 0 -hls_time 5 -hls_list_size 0 -f hls -bsf:v h264_mp4toannexb ${output}`,
        // For Audio: ffmpeg -i input.mp3 -c:a aac -b:a 192k -map 0:a -ac 2 -f hls -hls_time 6 -hls_list_size 0 -flags -global_header audio.m3u8
        // For Video:
        `ffmpeg -i ${input} -c:a aac -b:a 192k -map 0:a -ac 2 -f hls -hls_time ${mediaConfig.audio.hls.time} -hls_list_size 0 -flags -global_header ${output}`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                logger.error(`Error while creating a HLS for the audioId ${audioId}. Below is stacktrace: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        }
    );
};


/**
 * Create hls files for video media
 * @param videoId
 * @param fileName
 */
const createVideoHls = async (videoId, fileName) => {
    const input = `${mediaConfig.video.storage}/${videoId}/${fileName}`;
    const output = `${mediaConfig.video.storage}/${videoId}/${baseSubDirConfig.hls}/${mediaConfig.video.hls.indexName}`;

    logger.info(`About to generate a new hls for videoId ${videoId}`);

    ffmpeg(
        // `ffmpeg -i ${input} -codec: copy -start_number 0 -hls_time 5 -hls_list_size 0 -f hls -bsf:v h264_mp4toannexb ${output}`,
        // For Audio: ffmpeg -i input.mp3 -c:a aac -b:a 192k -map 0:a -ac 2 -f hls -hls_time 6 -hls_list_size 0 -flags -global_header audio.m3u8
        // For Video:
        `ffmpeg -i ${input} -c:v h264 -flags +cgop -g 30 -hls_time ${mediaConfig.video.hls.time} -hls_list_size 0 -bsf:v h264_mp4toannexb ${output}`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                logger.error(`Error while creating a HLS for the videoId ${videoId}. Below is stacktrace: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        }
    );
};

/**
 * Create image poster of a video
 * @param videoId
 * @param fileName
 */
const createVideoThumbnail = (videoId, fileName) => {
    const input = `${mediaConfig.video.storage}/${videoId}/${fileName}`;
    const output = `${mediaConfig.video.storage}/${videoId}/${baseSubDirConfig.pictures}/${mediaConfig.video.cover.name}`;

    logger.info(`About to generate a new an image thumbnail for videoId ${videoId}`);

    ffmpeg(
        `ffmpeg -i ${input} -vf "select=eq(n\\,0)" -frames:v 1 -q:v 2 ${output}`,
        (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                logger.error(`Error while creating an image thumbnail for the videoId ${videoId}. Below is stacktrace: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        }
    );
    // ffmpeg(`ffmpeg -i ${input} -frames:v 1 -q:v 2 ${output}`);
};

/**
 * Return hls files for audio media
 * @param req
 * @param res
 * @returns {*|void}
 */
const getAudioHlsContent = (req, res) => {
    const audioId = req.params.audioId, audioChunkName = req.params.audioChunkName;

    if (!audioId || !audioChunkName) {
        logger.error(`Incorrect parameter given while getting hls content: videoId : ${audioId} videoChunkName : ${audioChunkName} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        return res.status(400).send("Incorrect parameters");
    }

    // Absolute file path
    const file = `${process.cwd()}/${mediaConfig.audio.storage}/${audioId}/${baseSubDirConfig.hls}/${audioChunkName}`;

    // Render the file
    res.download(file, err => {
        if (err) {
            logger.error(`The audio hls files of id ${audioId} could not be found: The error: ${err}`);
            return res.status(400).send(getErrors(ERRORS.MEDIA.FILE_NOT_FOUND));
        }
    });
};


/**
 * Return hls files for video media
 * @param req
 * @param res
 * @returns {*|void}
 */
const getVideoHlsContent = (req, res) => {
    const videoId = req.params.videoId, videoChunkName = req.params.videoChunkName;

    if (!videoId || !videoChunkName) {
        return res.status(400).send(getErrors(ERRORS.VIDEO.INCORRECT_ID));
    }

    // Absolute file path
    const file = `${process.cwd()}/${mediaConfig.video.storage}/${videoId}/${baseSubDirConfig.hls}/${videoChunkName}`;

    // Render the file
    res.download(file, err => {
        if (err) {
            logger.error(`The video hls files of id ${videoId} could not be found: The error: ${err}`);
            return res.status(400).send(getErrors(ERRORS.MEDIA.FILE_NOT_FOUND));
        }
    });
};


/**
 * Return raw audio. This is the original audio uploaded
 * @param req
 * @param res
 * @returns {*|void}
 */
const getRawAudioContent = async (req, res) => {
    const audioId = req.params.audioId;

    // First check if the id is a valid one
    if (!mongoose.isValidObjectId(audioId)) {
        return res.status(400).send(getErrors(ERRORS.AUDIO.INCORRECT_ID));
    }

    try {
        // Get correspondent audio
        const audio = await Audio.findById(audioId);
        const file = `${process.cwd()}/${mediaConfig.audio.storage}/${audioId}/${audio.source}`;
        // Try to download the file with its uploaded title
        res.download(file, `${audio.title}`, err => {
            if (err) {
                logger.error(`The audio file of id ${audioId} could not be found: The error: ${err}`);
                return res.status(400).send(getErrors(ERRORS.MEDIA.FILE_NOT_FOUND));
            }
        });
    } catch (e) {
        return res.status(400).send(getErrors(ERRORS.AUDIO.NOT_FOUND));
    }
};

/**
 * Return raw video. This is the original video uploaded
 * @param req
 * @param res
 * @returns {*|void}
 */
// TODO: NEED TO CHANGE AUDIO MODEL TO VIDEO
const getRawVideoContent = async (req, res) => {
    const videoId = req.params.audioId;

    // First check if the id is a valid one
    if (!mongoose.isValidObjectId(videoId)) {
        return res.status(400).send(getErrors(ERRORS.VIDEO.INCORRECT_ID));
    }

    try {
        // Get correspondent audio
        const video = await Audio.findById(videoId);
        const file = `${process.cwd()}/${mediaConfig.video.storage}/${videoId}/${video.source}`;
        // Try to download the file with its uploaded title
        res.download(file, `${video.title}`, err => {
            if (err) {
                logger.error(`The video file of id ${videoId} could not be found: The error: ${err}`);
                return res.status(400).send(getErrors(ERRORS.MEDIA.FILE_NOT_FOUND));
            }
        });
    } catch (e) {
        return res.status(400).send(getErrors(ERRORS.VIDEO.NOT_FOUND));
    }
};

/**
 * Return audio cover
 * @param req
 * @param res
 * @returns {*|void}
 */
const getAudioCoverContent = async (req, res) => {
    const audioId = req.params.audioId;

    // First check if the id is a valid one
    if (!mongoose.isValidObjectId(audioId)) {
        return res.status(400).send(getErrors(ERRORS.AUDIO.INCORRECT_ID));
    }

    try {
        // Get correspondent audio
        let audio = await Audio.findById(audioId);
        // Convert to JSON to allow some extras properties
        audio = audio.toJSON();
        // Get absolute file path of the cover
        let file = `${process.cwd()}/${mediaConfig.audio.storage}/${audioId}/${baseSubDirConfig.pictures}/${audioId}.${audio._cover.ext}`;

        // Check if the file exits
        if (!fs.existsSync(file)) {
            // Set default audio image instead
            file = `${process.cwd()}/${mediaConfig.audio.cover.default.path}`;
        }

        // Set the filename and download
        return res.download(file, `${audio._title.base}.${audio._cover.ext}`, err => {
            if (err) {
                logger.error(`The image file for the audio of id ${audioId} could not be found: The error: ${err}`);
                return res.status(400).send(getErrors(ERRORS.MEDIA.NOT_FOUND));
            }
        });
    } catch (e) {
        return res.status(400).send(getErrors(ERRORS.AUDIO.NOT_FOUND));
    }
};


/**
 * Return video poster
 * @param req
 * @param res
 * @returns {*|void}
 */
// TODO: NEED TO CHANGE AUDIO MODEL TO VIDEO
const getVideoCoverContent = async (req, res) => {
    const videoId = req.params.audioId;

    // First check if the id is a valid one
    if (!mongoose.isValidObjectId(videoId)) {
        return res.status(400).send(getErrors(ERRORS.VIDEO.INCORRECT_ID));
    }

    try {
        // Get correspondent audio
        let video = await Audio.findById(videoId);
        // Convert to JSON to allow some extras properties
        video = video.toJSON();
        // Get absolute file path of the cover
        let file = `${process.cwd()}/${mediaConfig.video.storage}/${videoId}/${baseSubDirConfig.pictures}/${videoId}.${video._cover.ext}`;

        // Check if the file exits
        if (!fs.existsSync(file)) {
            // Set default audio image instead
            file = `${process.cwd()}/${mediaConfig.video.cover.default.path}`;
        }

        // Set the filename and download
        return res.download(file, `${video._title.base}.${video._cover.ext}`, err => {
            if (err) {
                logger.error(`The image file for the video of id ${videoId} could not be found: The error: ${err}`);
                return res.status(400).send(getErrors(ERRORS.MEDIA.NOT_FOUND));
            }
        });
    } catch (e) {
        return res.status(400).send(getErrors(ERRORS.AUDIO.NOT_FOUND));
    }
};


/**
 * Get Video's details
 * @param videoUrl
 * @returns {Promise<any>}
 */
const getVideoDetails = (videoUrl) => {
    return new Promise((resolve, reject) => {
        ffmpeg(
            `ffprobe -v error -of json -show_streams -show_format ${videoUrl}`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    logger.error(`Error while getting details of a video ${videoUrl}. Below is stacktrace: ${error}`);
                    reject(stderr);
                    return;
                }
                resolve(JSON.parse(stdout));
            }
        );
    });
};

exports.createAudioHls = createAudioHls;
exports.createVideoHls = createVideoHls;
exports.getRawAudioContent = getRawAudioContent;
exports.getAudioHlsContent = getAudioHlsContent;
exports.getVideoHlsContent = getVideoHlsContent;
exports.getAudioCoverContent = getAudioCoverContent;
exports.getVideoCoverContent = getVideoCoverContent;
exports.createVideoThumbnail = createVideoThumbnail;
