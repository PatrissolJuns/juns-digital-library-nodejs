const expressJwt = require('express-jwt');
const userService = require('../controllers/user');

module.exports = jwt;

/**
 * Revoke a token if the user is no more in the database
 * @param req
 * @param payload
 * @param done
 * @returns {Promise<*>}
 */
async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.userId);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
}

/**
 * Setup JWT
 */
function jwt() {
    const secret = process.env.JWT_KEY;
    return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/api/users/authenticate',
            '/api/users/register'
        ]
    });
}
