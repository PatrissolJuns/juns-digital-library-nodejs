const validator = require('validator');
const Audio = require('../models/Audio');
const {mediaConfig} = require('../config');
const logger = require('../config/logger');
const {ERRORS} = require('../utils/errors');
const {getErrors, isValidObjectId} = require('../helpers');

exports.validateCreate = (data) => {
    const { name, cover } = data;
    const result = {isCorrect: false, errors: []};

    if (!name)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "name"});

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};

exports.validateIdAndItems = async (data) => {
    const {id, items} = data;
    const result = {isCorrect: false, errors: []};

    if (!isValidObjectId(id))
        result.errors.push({...ERRORS.PLAYLISTS.UNKNOWN_PLAYLIST, field: "id"});
    if (!items)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "items"});
    else if (!Array.isArray(items)) {
        result.errors.push({...ERRORS.PLAYLISTS.INVALID_ITEMS_STRUCTURE});
    } else if (!(items.length > 0)) {
        result.errors.push({...ERRORS.PLAYLISTS.EMPTY_ITEMS});
    } else if (!(
        items.every(c => c.hasOwnProperty('id')
            && c.hasOwnProperty('type')
            && typeof c.id === "string"
            && mediaConfig.media.types.includes(c.type)
        )
    )) {
        result.errors.push({...ERRORS.PLAYLISTS.INVALID_ITEMS_STRUCTURE});
    } else {
        const audioIds = items.filter(i => i.type === mediaConfig.media.type.audio).map(i => i.id);
        try {
            const result = await Audio.find({_id: {$in: audioIds}});
            if (result.length !== audioIds.length) {
                result.errors.push({...ERRORS.PLAYLISTS.INVALID_ITEMS});
            }
        } catch (e) {
            logger.error("Error while validating id and items for a playlist with given data " + JSON.stringify(data) + ". The error: " + e);
            result.errors.push({...ERRORS.SERVER.INTERNAL_SERVER_ERROR});
        }
    }

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};

exports.validateUpdate = (data) => {
    const { id, name, description, cover } = data;
    const result = {isCorrect: false, errors: []};

    if (!isValidObjectId(id))
        result.errors.push({...ERRORS.PLAYLISTS.UNKNOWN_PLAYLIST, field: "id"});
    if (name && (!(typeof name === "string" && name.length > 0)))
        result.errors.push({...ERRORS.FIELDS.INVALID, field: "name"});
    if (description && (!(typeof description === "string" && description.length > 0)))
        result.errors.push({...ERRORS.FIELDS.INVALID, field: "description"});

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};
