const FOLDERS = require('../urls/routes').FOLDERS;
const FolderController = require('../controllers/folder');

exports.routes = (socket) => {
    socket.on(FOLDERS.UPDATE.INPUT, (data) => FolderController.update(socket, FOLDERS.UPDATE.OUTPUT, data));
    socket.on(FOLDERS.CREATE.INPUT, (data) => FolderController.createFolder(socket, FOLDERS.CREATE.OUTPUT, data));
    socket.on(FOLDERS.DETAILS.INPUT, (data) => FolderController.getDetails(socket, FOLDERS.DETAILS.OUTPUT, data));
    socket.on(FOLDERS.CONTENT.INPUT, (data) => FolderController.getFolderContent(socket, FOLDERS.CONTENT.OUTPUT, data));
    socket.on(FOLDERS.EMPLACEMENT.INPUT, (data) => FolderController.getEmplacement(socket, FOLDERS.EMPLACEMENT.OUTPUT, data));
};
