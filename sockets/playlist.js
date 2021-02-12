const PLAYLISTS = require('../urls/routes').PLAYLISTS;
const PlaylistController = require('../controllers/playlist');

exports.routes = (socket) => {
    socket.on(PLAYLISTS.CREATE.INPUT, (data) => PlaylistController.create(socket, PLAYLISTS.CREATE.OUTPUT, data));
    socket.on(PLAYLISTS.RENAME.INPUT, (data) => PlaylistController.rename(socket, PLAYLISTS.RENAME.OUTPUT, data));
    socket.on(PLAYLISTS.GET_ALL.INPUT, (data) => PlaylistController.getAll(socket, PLAYLISTS.GET_ALL.OUTPUT, data));
    socket.on(PLAYLISTS.ITEMS.ADD.INPUT, (data) => PlaylistController.addItems(socket, PLAYLISTS.ITEMS.ADD.OUTPUT, data));
    socket.on(PLAYLISTS.ITEMS.REMOVE.INPUT, (data) => PlaylistController.removeContent(socket, PLAYLISTS.ITEMS.REMOVE.OUTPUT, data));
};
