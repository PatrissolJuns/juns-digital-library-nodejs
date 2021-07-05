// Enable .env
require('dotenv').config();

const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const io = require('socket.io')();
const express = require('express');
const jwt = require('./utils/jwt');
const bodyParser = require('body-parser');
const initIO = require('./sockets').initIO;
const {STORAGE} = require('./urls/routes');
const stream = require('./media-processing/stream');
const initMongoDb = require('./mongodb').initMongoDb;
const {errorHandler} = require('./utils/error-handler');

const app = express();

// Group of Routes
const userRoutes = require('./routes/user');
const audioRoutes = require('./routes/audio');

// Handle Cors
app.use(cors());

// Setting entry point to get static file
// And disable authentication
app.use(STORAGE.AUDIOS.HLS, stream.getAudioHlsContent);
// app.use(STORAGE.VIDEOS.HLS, stream.getAudioHlsContent);
app.use(STORAGE.AUDIOS.COVER, stream.getAudioCoverContent);
// app.use(STORAGE.VIDEOS.COVER, stream.getVideoCoverContent);
app.use(STORAGE.AUDIOS.RAW, stream.getRawAudioContent);

// Enable jwt for authentication
app.use(jwt());

// Initialize mongo database
initMongoDb();

const router = express.Router();

// (optional) only made for logging and
app.use(logger('dev'));

// bodyParser, parses the request body to be a readable json format
// app.use(express.json());
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit:'50mb', parameterLimit: 1000000 }));

// Setting general model route
router.use('/audios', audioRoutes);
router.use('/users', userRoutes);

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
