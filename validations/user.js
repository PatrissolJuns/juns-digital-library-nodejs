const validator = require('validator');
const {ERRORS} = require('../utils/errors');

exports.validateCreateUser = (data) => {
    const { login, email, password } = data;
    const result = {isCorrect: false, errors: []};

    if (!login)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "login"});
    if (!email)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "email"});
    if (!password)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "password"});
    if (email && !validator.isEmail(email))
        result.errors.push({...ERRORS.FIELDS.INVALID_EMAIL, field: "email"});
    if (password && !validator.isByteLength(password, {min: Number(process.env.MIN_PASSWORD_LENGTH)}))
        result.errors.push({...ERRORS.FIELDS.WEAK_PASSWORD, field: "password"});

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};

exports.validateAuthenticate = (data) => {
    const { login, password } = data;
    const result = {isCorrect: false, errors: []};

    if (!login)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "login"});
    if (!password)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "password"});

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};

exports.validateRefreshToken = (data) => {
    const { refreshToken } = data;
    const result = {isCorrect: false, errors: []};

    if (!refreshToken)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "refreshToken"});

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};

exports.validateUpdatePassword = (data) => {
    const { oldPassword, newPassword } = data;
    const result = {isCorrect: false, errors: []};

    if (!oldPassword)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "oldPassword"});
    if (!newPassword)
        result.errors.push({...ERRORS.FIELDS.REQUIRED, field: "newPassword"});
    if (newPassword && !validator.isByteLength(newPassword, {min: Number(process.env.MIN_PASSWORD_LENGTH)}))
        result.errors.push({...ERRORS.FIELDS.WEAK_PASSWORD, field: "password"});

    return result.errors.length === 0
        ? {isCorrect: true, errors: []}
        : result;
};
