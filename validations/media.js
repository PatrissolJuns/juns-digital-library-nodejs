const validator = require('validator');
const {ERRORS} = require('../utils/errors');
const {isValidObjectId} = require('../helpers');

exports.validateMediaUpload = (data, mediaType) => {
    const { folderId } = data;
    const result = {isCorrect: false, errors: []};

    if (folderId !== 'null' && !isValidObjectId(folderId))
        result.errors.push({...ERRORS.FOLDERS.UNKNOWN_FOLDER, field: "folderId"});
    if (folderId === 'null')
        data.folderId = null;

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};
