const FOLDERS = require('../urls/routes').FOLDERS;
const FolderController = require('../controllers/folder');

exports.routes = (socket) => {
    socket.on(FOLDERS.RENAME.INPUT, (data) => FolderController.rename(socket, FOLDERS.RENAME.OUTPUT, data));
    socket.on(FOLDERS.CREATE.INPUT, (data) => FolderController.createFolder(socket, FOLDERS.CREATE.OUTPUT, data));
    socket.on(FOLDERS.CONTENT.INPUT, (data) => FolderController.getFolderContent(socket, FOLDERS.CONTENT.OUTPUT, data));
};
