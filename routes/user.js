const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

/**
 * Authentication with login and password
 * @param req
 * @param res
 * @param next
 */
function authenticate(req, res, next) {
    UserController.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

/**
 * Registration with login, email and password
 * @param req
 * @param res
 * @param next
 */
function register(req, res, next) {
    UserController.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    UserController.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    UserController.getById(req.user.userId)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    UserController.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    UserController.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    UserController.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}
