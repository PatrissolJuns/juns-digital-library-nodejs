const AUDIOS = require('../urls/routes').AUDIOS;
const AudioController = require('../controllers/audio');

exports.routes = (socket) => {
    socket.on(AUDIOS.GET_ALL.INPUT, (data) => AudioController.getAll(socket, AUDIOS.GET_ALL.OUTPUT, data));
    socket.on(AUDIOS.GET_ONE.BY_ID.INPUT, (data) => AudioController.getOneById(socket, AUDIOS.GET_ONE.BY_ID.OUTPUT, data));
    socket.on(AUDIOS.RENAME.INPUT, (data) => AudioController.rename(socket, AUDIOS.RENAME.OUTPUT, data));
};
