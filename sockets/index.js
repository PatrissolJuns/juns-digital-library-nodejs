const jwt = require('jsonwebtoken');
const folder = require('./folder').routes;
const userController = require('../controllers/user');

exports.initIO = (io) => {
    // Authentication Middleware
    io.use((socket, next) => {
        const error = new Error("Unauthorized");
        error.data = { code: 401 };

        // Get auth data
        const authorization = socket.handshake.auth;

        // Check if it exists
        if (authorization) {
            try {
                // Verify token and get its information
                const jwtToken = jwt.verify(authorization.token, process.env.JWT_KEY);

                // Check if jwtToken contains sub which userId
                if (jwtToken && jwtToken.userId) {
                    // Fetch correspondent user
                    userController
                        .getById(jwtToken.userId)
                        .then(user => {
                            if (user) {
                                // Make user available into socket object
                                socket.handshake.user = user;
                                next();
                            } else {
                                // Otherwise fired error
                                const err = new Error("User Not Found");
                                err.data = { code: 402 };
                                next(err);
                            }
                        })
                        .catch(err => next(err));
                } else next(error);
            } catch (e) {
                next(error);
            }
        } else next(error);
    });

    io.on('connection', socket => {
        folder(socket);
    });
};
