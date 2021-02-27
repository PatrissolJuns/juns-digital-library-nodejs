const fs = require('fs');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const UserValidator = require('../validations/user');
const {ERRORS, MONGODB_ERRORS_CODE} = require('../utils/errors');
const {getErrors, error500, getUserStoragePath} = require('../helpers');


/**
 * Create a new user
 * @apiParam login string
 * @apiParam email string
 * @apiParam password string
 * @param req
 * @param res
 * @returns {*|never|Promise<any>}
 */
exports.register = (req, res) => {
    // validate
    const validation = UserValidator.validateCreateUser(req.body);
    if (!validation.isCorrect) {
        return res.status(400).json({status: 400, errors: validation.errors});
    }

    // Create user
    const user = new User(req.body);

    // hash password
    if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, Number(process.env.JWT_SALT));
    }

    // save user
    user.save()
        .then(async (user) => {
            // Create its storage
            try {
                fs.mkdirSync(getUserStoragePath(user._id));
            } catch (e) {
                // In case of errors, delete user previously created
                logger.error("Error while creating user's storage " + JSON.stringify(user) + ". The error: " + e);
                await User.deleteOne({_id: user._id}).catch(e => {
                    logger.error("Error while deleting user after a failure when creating its storage " + JSON.stringify(user) + ". The error: " + e);
                });
                return error500(res);
            }
            res.json(user);
        })
        .catch(err => {
            if (err) {
                if (err.code === MONGODB_ERRORS_CODE.UNIQUE) {
                    return res.status(400).json(getErrors(ERRORS.USERS.EMAIL_ALREADY_EXISTS))
                }
                if (err.errors) {
                    logger.error("Error while registering a user: " + err);
                    return error500(res);
                }
            }

            logger.error("Error while registering a user: " + err);
            return error500(res);
        });
};

/**
 * Authentication a user
 * @apiParam login string
 * @apiParam password string
 * @param req
 * @param res
 * @returns {Promise<*|never|Promise<any>|*>}
 */
exports.authenticate = async (req, res) => {
    // Validate request
    const validation = UserValidator.validateAuthenticate(req.body);
    if (!validation.isCorrect) {
        return res.status(400).json({status: 400, errors: validation.errors});
    }

    let user;
    const { login ,password } = req.body;
    try {
        user = await User.findOne({login});
    } catch (e) {
        logger.error(`Error while looking for one user with login ${login}: ${e}`);
        return error500(res);
    }

    // Check credentials
    if (user && bcrypt.compareSync(password, user.password)) {
        const accessToken = jwt.sign({userId: user.id}, process.env.JWT_KEY, {expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME});
        const refreshToken = jwt.sign({userId: user.id}, process.env.JWT_REFRESH_KEY, {expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME});
        return res.json({
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: moment().add(Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME[0]) || 2, 'days').valueOf()
        });
    }

    return res.status(400).json(getErrors(ERRORS.AUTH.BAD_CREDENTIALS));
};

/**
 * Get new tokens from refreshToken
 * @apiParam refreshToken string
 * @param req
 * @param res
 * @returns {*|never|Promise<any>}
 */
exports.refreshToken = (req, res) => {
    // Validate request
    const validation = UserValidator.validateRefreshToken(req.body);
    if (!validation.isCorrect) {
        return res.status(400).json({status: 400, errors: validation.errors});
    }

    const { refreshToken } = req.body;
    try {
        // Check if the refreshToken is valid
        const jwtRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

        // Generate new tokens
        const newAccessToken = jwt.sign({userId: jwtRefreshToken.userId}, process.env.JWT_KEY, {expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME});
        const newRefreshToken = jwt.sign({userId: jwtRefreshToken.userId}, process.env.JWT_REFRESH_KEY, {expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME});
        return res.json({
            tokenType: 'Bearer',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: moment().add(Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME[0]) || 2, 'days').valueOf()
        });
    } catch (e) {
        return res.status(400).json(getErrors(ERRORS.AUTH.BAD_REFRESH_TOKEN));
    }
};

/**
 * Get authenticated user
 * @param req
 * @param res
 */
exports.getCurrentUser = (req, res) => {
    User.findById(req.user.userId)
        .then(user => res.json(user))
        .catch(error => {
            logger.error(`Error while looking for one user with id ${req.user.userId}: ${error}`);
            return error500(res);
        });
};


/**
 * Create a new user
 * @apiParam login string
 * @apiParam email string
 * @apiParam password string
 * @param req
 * @param res
 * @returns {*|never|Promise<any>}
 */
exports.updatePassword = async (req, res) => {
    // validate
    const validation = UserValidator.validateUpdatePassword(req.body);
    if (!validation.isCorrect) {
        return res.status(400).json({status: 400, errors: validation.errors});
    }

    const {newPassword, oldPassword} = req.body;
    const oldPasswordHash = bcrypt.hashSync(oldPassword, Number(process.env.JWT_SALT));

    let user;
    try {
        user = await User.findOne({password: oldPasswordHash});
    } catch (e) {
        logger.error(`Error while looking for one user with password ${oldPasswordHash}: ${e}`);
        return error500(res);
    }

    // hash password
    if (user) {
        user.password = bcrypt.hashSync(newPassword, Number(process.env.JWT_SALT));
        // save user
        user.save()
            .then((user) => res.json(user))
            .catch(err => {
                if (err) {
                    if (err.code === MONGODB_ERRORS_CODE.UNIQUE) {
                        return res.status(400).json(getErrors(ERRORS.USERS.EMAIL_ALREADY_EXISTS));
                    }
                    if (err.errors) {
                        logger.error("Error while updating a user: " + err);
                        return error500(res);
                    }
                }

                logger.error("Error while updating a user: " + err);
                return error500(res);
            });
    }

    return res.status(400).json(getErrors(ERRORS.USERS.INCORRECT_OLD_PASSWORD));
};

exports.getById = async (id) => {
    return await User.findById(id);
};
