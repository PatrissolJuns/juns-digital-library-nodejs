const initMongoDb = require('./mongodb').initMongoDb;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const jwt = require('./utils/jwt');
const errorHandler = require('./utils/error-handler');
// const Data = require('./data');

const app = express();

const userRoutes = require('./routes/user');
const audioRoutes = require('./routes/audio');
const playlistRoutes = require('./routes/playlist');
// const folderRoutes = require('./routes/folder');
const path = require('path');

require('dotenv').config();


/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});*/

app.use(cors());
app.use(jwt());


const router = express.Router();

initMongoDb();

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false, limit:'50mb', parameterLimit: 1000000 }));
app.use(logger('dev'));
app.use(bodyParser.json({limit:'50mb'}));

// Setting entry point to get static file
app.use('/file/audios', express.static(path.join(__dirname, '/Storage/audios')));
app.use('/file/images', express.static(path.join(__dirname, '/Storage/images')));

// Setting general model route
router.use('/audio', audioRoutes);
router.use('/users', userRoutes);
router.use('/playlist', playlistRoutes);
// router.use('/folder', folderRoutes);

// append /api for our http requests
app.use('/api', router);

//
app.use('/', function (req, res){
    res.status(200).json({
        message: 'hello This is the backend app'
    });
});

app.use(errorHandler);

// launch our backend into a port
app.listen(process.env.PORT || 5201, () => console.log(`LISTENING ON PORT ${process.env.PORT}`));
