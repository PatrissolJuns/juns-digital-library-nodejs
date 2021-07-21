const PLAYLISTS = require('../urls/routes').PLAYLISTS;
const PlaylistController = require('../controllers/playlist');

exports.routes = (socket) => {
    socket.on(PLAYLISTS.CREATE.INPUT, (data) => PlaylistController.create(socket, PLAYLISTS.CREATE.OUTPUT, data));
    socket.on(PLAYLISTS.UPDATE.INPUT, (data) => PlaylistController.update(socket, PLAYLISTS.UPDATE.OUTPUT, data));
    socket.on(PLAYLISTS.GET_ALL.INPUT, (data) => PlaylistController.getAll(socket, PLAYLISTS.GET_ALL.OUTPUT, data));
    socket.on(PLAYLISTS.GET_ONE.INPUT, (data) => PlaylistController.getOne(socket, PLAYLISTS.GET_ONE.OUTPUT, data));
    socket.on(PLAYLISTS.ITEMS.ADD.INPUT, (data) => PlaylistController.addItems(socket, PLAYLISTS.ITEMS.ADD.OUTPUT, data));
    socket.on(PLAYLISTS.ITEMS.REMOVE.INPUT, (data) => PlaylistController.removeContent(socket, PLAYLISTS.ITEMS.REMOVE.OUTPUT, data));
    socket.on(PLAYLISTS.ITEMS.REORDER.INPUT, (data) => PlaylistController.reorderContent(socket, PLAYLISTS.ITEMS.REORDER.OUTPUT, data));
};
