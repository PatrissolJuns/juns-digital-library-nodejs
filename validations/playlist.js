const validator = require('validator');
const {ERRORS} = require('../utils/errors');
const {mediaConfig} = require('../config');
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
        const audioIds = items.find(i => i.type === mediaConfig.media.type.audio);
        try {
            const result = await Audio.find({_id: {$in: audioIds}});
            if (result.length !== audioIds.length) {
                result.errors.push({...ERRORS.PLAYLISTS.INVALID_ITEMS});
            }
        } catch (e) {
            result.errors.push({...ERRORS.SERVER.INTERNAL_SERVER_ERROR});
        }
    }

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};

exports.validateUpdate = (data) => {
    const { id, name, cover } = data;
    const result = {isCorrect: false, errors: []};

    if (!isValidObjectId(id))
        result.errors.push({...ERRORS.PLAYLISTS.UNKNOWN_PLAYLIST, field: "id"});
    if (name && (!(typeof name === "string" && name.length > 0)))
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "name"});

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};
