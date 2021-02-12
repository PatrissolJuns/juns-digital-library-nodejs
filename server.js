// Enable .env
require('dotenv').config();

const cors = require('cors');
const logger = require('morgan');
const io = require('socket.io')();
const express = require('express');
const jwt = require('./utils/jwt');
const ROUTES = require('./urls/routes');
const bodyParser = require('body-parser');
const initIO = require('./sockets').initIO;
const initMongoDb = require('./mongodb').initMongoDb;
const errorHandler = require('./utils/error-handler');

const app = express();

// Group of Routes
const userRoutes = require('./routes/user');
const audioRoutes = require('./routes/audio');
const playlistRoutes = require('./routes/playlist');
// const folderRoutes = require('./routes/folder');

// Handle Cors
app.use(cors());

// Enable jwt for authentication
app.use(jwt());

// Initialize mongo database
initMongoDb();

const router = express.Router();

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(logger('dev'));
// app.use(express.json());
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit:'50mb', parameterLimit: 1000000 }));

// Setting entry point to get static file
app.use(ROUTES.STORAGE_AUDIOS.ROUTE, express.static(ROUTES.STORAGE_AUDIOS.DESTINATION));
app.use(ROUTES.STORAGE_IMAGES.ROUTE, express.static(ROUTES.STORAGE_IMAGES.DESTINATION));

// Setting general model route
router.use('/audios', audioRoutes);
router.use('/users', userRoutes);
router.use('/playlists', playlistRoutes);
// router.use('/folder', folderRoutes);

// Prefixes of all api routes
app.use('/api', router);

// Index
app.use('/', function (req, res){
    res.status(200).json({
        message: 'Welcome to JDL'
    });
});

// Enable errors handling
app.use(errorHandler);

// launch our backend into a port
const server = app.listen(process.env.PORT || 5201, () => console.log(`LISTENING ON PORT ${process.env.PORT}`));

io.attach(server,{ transports: ["websocket"] });

initIO(io);
