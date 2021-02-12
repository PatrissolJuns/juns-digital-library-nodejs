const fs = require('fs');
const btoa = require('btoa');
const mm = require('music-metadata');
const Audio = require('../models/Audio');
const PlaylistController = require('../controllers/playlist');
const { getFileExtensionFromMimeType } = require('../helpers');


/**
 * Returns various property of an audio
 * @param audio
 * @returns {Promise<any>}
 */
const getAudioInformation = (audio) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get metadata
            const metadata = await mm.parseFile(audio.path, {duration: true});
            // Get cover art
            const image = mm.selectCover(metadata.common.picture);

            // Initialize default cover art
            let cover = process.env.DEFAULT_AUDIO_COVER, base64String = "";

            // Try to save cover art
            if (image) {
                // Map data from metadata cover art to base64
                for (let i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                }
                /* old system
                let base64String = "";
                var base64 = "data:" + image.format + ";base64," +  btoa(base64String); */

                // Get cover filename from audio source
                const baseFileName = audio.filename.split('.');

                // Set cover filename
                cover = baseFileName.slice(0, baseFileName.length - 1).join('') + '.' + getFileExtensionFromMimeType(image.format);

                try {
                    // Try to transform the base64 into an image file and save it
                    fs.writeFileSync(process.env.IMAGES_STORAGE_DIR + cover, btoa(base64String), {encoding: 'base64'});
                } catch (e) {
                    // Go back to default image in case of failure
                    cover = process.env.DEFAULT_AUDIO_COVER;
                }
            }

            resolve({
                artist: metadata.common.artist === undefined ? "unknown" : metadata.common.artist,
                album: metadata.common.album === undefined ? "unknown" : metadata.common.album,
                cover: cover,
                duration: metadata.format.duration,
                bitrate: metadata.format.bitrate,
                originalTitle: metadata.common.title === undefined ? "unknown" : metadata.common.title,
                title: audio.originalname,
                source: audio.filename,
                size: audio.size,
                year: metadata.common.year === undefined ? "unknown" : metadata.common.year,
            });
        } catch (e) {
            reject(e);
        }
    });
};

exports.createAudio = (req, res, next) => {
    getAudioInformation(req.file)
        .then(async (_data) => {
            const audio = new Audio({
                ..._data,
                title: req.body.title ? req.body.title : _data.title,
                isBookmark: false,
                userId: req.user.userId,
                folderId: req.body.folderId,
            });

            try {
                await audio.save();
                res.status(200).json({
                    message: "Audio successfully saved!",
                    data: audio
                });
            } catch (error) {
                res.status(400).json({
                    error: error
                });
            }
        })
        .catch(error => {
            res.status(400).json({
                error: error
            });
        });
};

exports.find = (query = {}) => Audio.find(query);

exports.getAllAudio = (req, res, next) => {
    Audio.find().then(
        (audios) => {
            // console.log(audios);
            res.status(200).json(audios);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getOneAudio = (req, res, next) => {
    Audio.findOne({
        _id: req.params.id
    }).then(
        (audio) => {
            res.status(200).json(audio);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.getFromDBOneAudio = (_id) => {
    // console.log("inside _id = ",_id);
    return Audio.findOne({
        _id: _id
    }).then(
        (audio) => {
            // console.log("inside audio = ",audio);
            return audio;
        }
    ).catch(
        (error) => {
            return null;
        }
    );
}

exports.renameAudio = (req, res, next) => {
    Audio.findOne({
        _id: req.params.id
    }).then(
        (_audio) => {
            /*const audio = new Audio({
                _id: req.params.id,
                ..._audio,
                name: req.body.name,
            });*/
            let t = JSON.parse(JSON.stringify(_audio));
            t.track = req.body.track;

            Audio.updateOne({_id: req.params.id}, t).then(
                () => {
                    res.status(200).json({
                        message: 'audio updated successfully!'
                    });
                }
            ).catch(
                (error) => {
                    res.status(400).json({
                        error: error
                    });
                }
            );
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.deleteAudio = async (req, res, next) => {
    let audio = await this.getFromDBOneAudio(req.params.id);
    console.log(" audio._id = ", audio._id);
    let audioId = "" + audio._id;
    let playlists = await PlaylistController.getFromDBPlaylists();
    console.log("playlistsAll = ",playlists);

    Audio.deleteOne({_id: req.params.id}).then(
        () => {
            playlists.map(async playlist => {
                let response = await PlaylistController.updateFromDBOnePlaylist(
                    playlist._id, playlist.name, [audioId], false
                );
                if(!response) {
                    res.status(500).json({
                        error: "something went wrong"
                    });
                }
            });
            res.status(200).json({
                message: 'Deleted!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.toggleBookmark = (req, res, next) => {
    Audio.findOne({
        _id: req.params.id
    }).then(
        (_audio) => {
            let t = JSON.parse(JSON.stringify(_audio));
            t.isBookmark = !t.isBookmark;

            Audio.updateOne({_id: req.params.id}, t).then(
                () => {
                    res.status(200).json({
                        message: 'audio updated successfully!'
                    });
                }
            ).catch(
                (error) => {
                    res.status(400).json({
                        error: error
                    });
                }
            );
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.getAll = (socket, outputEvent, data) => {
    Audio
        .find({})
        .then(audios => {
            socket.emit(outputEvent, {status: true, data: audios});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while getting all audios"});
        });
};

exports.getOneById = (socket, outputEvent, data) => {
    Audio
        .find({_id: data.id})
        .then(audio => {
            socket.emit(outputEvent, {status: true, data: audio});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while getting one audio by id"});
        });
};

exports.rename = (socket, outputEvent, data) => {
    if (!data.title) {
        socket.emit(outputEvent, {status: false, error: "INVALID_TITLE", message: "Invalid title given"});
    }

    Audio
        .findByIdAndUpdate(data.id, {title: data.title})
        .then(async audio => {
            socket.emit(outputEvent, {status: true, data: audio});
        })
        .catch(error => {
            socket.emit(outputEvent, {status: false, error: error, message: "Error while getting one audio by id"});
        });
};

/*
exports.updateFromDBBelongToPlaylist = async (_id, _newBelongToPlaylist, _isAdd) => {
    let audio = await this.getFromDBOneAudio(_id);
    let newBelongToPlaylist = [];
    if(_isAdd)
        newBelongToPlaylist = [...new Set([...audio.belongToPlaylist, ..._newBelongToPlaylist])];
    else {
        newBelongToPlaylist = audio.belongToPlaylist.filter(playlistId => {
            console.log("playlistId = "+ playlistId+" value = " + !_newBelongToPlaylist.includes(playlistId));
            return !_newBelongToPlaylist.includes(playlistId);
        });
    }
    const newAudio = JSON.parse(JSON.stringify(audio));
    newAudio.belongToPlaylist = newBelongToPlaylist;

    // update the audio
    return Audio.updateOne({_id: _id}, newAudio).then(() => {return true;}).catch(() => {return false;});
}
*/

/*exports.updateAudio = (req, res, next) => {
    let response = this.updateFromDBOneAudio(req.params.id, req.body.name,
        req.body.belongToPlaylist, req.body.isAdd);
    if(response) {
        res.status(200).json({
            message: 'audio updated successfully!'
        });
    }
    else {
        res.status(400).json({
            error: 'An error occur'
        });
    }
}*/

/*exports.updateFromDBOneAudio = async (_id, _newName, _newBelongToPlaylist, _isAdd) => {
    let audio = await this.getFromDBOneAudio(_id);
    if(audio !== null) {
        let audioId = audio._id;
        let newBelongToPlaylist = [];
        let response = [];

        // update the playlist first
        _newBelongToPlaylist.map( async item => {
            let ItemPlaylist = PlaylistController.getFromDBOnePlaylist(item);
            if(ItemPlaylist !== null) response.push(await PlaylistController.updateFromDBAudioList(item, [audioId], _isAdd))
        });
        if(response.some(i => i === false)) return false;

        // update the belongToPlaylist attribute
        if(_isAdd)
            // newBelongToPlaylist = [...new Set(audio.belongToPlaylist.slice().concat(_newBelongToPlaylist))];
            newBelongToPlaylist = [...new Set([...audio.belongToPlaylist, ..._newBelongToPlaylist])];
        else {
            newBelongToPlaylist = audio.belongToPlaylist.filter(playlistId => {
                // console.log("playlistId = "+ playlistId+" value = " + !_newBelongToPlaylist.includes(playlistId));
                return !_newBelongToPlaylist.includes(playlistId);
            });
        }

        // create the new audio
        const newAudio = JSON.parse(JSON.stringify(audio));
        newAudio.track = _newName;
        newAudio.belongToPlaylist = newBelongToPlaylist;

        // update the audio
        return Audio.updateOne({_id: _id}, newAudio).then(
            () => {
                // res.status(200).json(playlist);
                return true;
            }
        ).catch(
            (error) => {
                return false;
            }
        );
    }
}

console.log("************************************* start action *************************************  ");

const t = async () => {
    console.log("belongToPlaylist bef = ", (await this.getFromDBOneAudio("5d97ec2603ca1a32aab08789")).belongToPlaylist);
    console.log("audioList bef = ", (await PlaylistController.getFromDBOnePlaylist("5d9ca5a25837a208e50c63f6")).audioList);

    console.log("**************************************************************************");
    console.log("**************************************************************************");
    /!*let a1 = [1,2,3,4]; let a2 = [1,4,6,8,9];
    let arr = [...new Set(a1.slice().concat(a2))];
    let arr1 = [...new Set([...a1, ...a2])];
    console.log("arr =  ", arr1);*!/
    let resAudio = await this.updateFromDBOneAudio("5d97eb5703ca1a32aab08786",
        "longue", ["5d9ca5a25837a208e50c63f6"], false);
    console.log("res = ",resAudio);

    /!*let re = await PlaylistController.updateFromDBAudioList("5d9ca5a25837a208e50c63f6",
        ["5d97ec2603ca1a32aab08789"], false);
    console.log("re =  ", re);*!/

    /!*let re = await this.updateFromDBBelongToPlaylist("5d97ec2603ca1a32aab08789",
        ["5d9ca5a25837a208e50c63f6"], false);
    console.log("re =  ", re);  *!/


    let resPlaylist = await PlaylistController.updateFromDBOnePlaylist("5d9ca5a25837a208e50c63f6",
        "Test 2", ["5d97eb5703ca1a32aab08786"], false);
    console.log("res = ",resPlaylist);

    console.log("**************************************************************************");
    console.log("**************************************************************************");
    console.log("belongToPlaylist aft = ", (await this.getFromDBOneAudio("5d97ec2603ca1a32aab08789")).belongToPlaylist);
    console.log("audioList aft = ", (await PlaylistController.getFromDBOnePlaylist("5d9ca5a25837a208e50c63f6")).audioList);
    /!*res.then(
        (data) => console.log("data = ",data)
    ).catch(
        (error) => console.log("error = ",error)
    );*!/
}

// t();

console.log("************************************* end action *************************************  ");
*/

/*
let globalState = [
    { id: 1, name: "Dashgum - Admin Panel Theme"},
    { id: 2, name: "Extensive collection of plugins"},
    { id: 3, name: "Free updates always, no extra fees."},
    { id: 4, name: "More features coming soon"}
];



router.get('/getPlaylists', (req, res) => {
    return res.json(globalState);
});

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
    /!*Data.find((err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data });
    });*!/
    jsmediatags.read("./longue.mp3", {
        onSuccess: function(tag) {
            console.log(tag);
            console.log(tag.tags.picture);
            // console.log(tag.tags.picture.data);
            // console.log(tag.tags.APIC);
            let image =tag.tags.picture; let base64String = "";
            for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i]);
            }
            // console.log("base64String = ",base64String);
            // console.log("base64String = ",btoa(base64String));
            // var base64 = "data:" + image.format + ";base64," +  (new Buffer.from(base64String).toString('base64'));
            var base64 = "data:" + image.format + ";base64," +  btoa(base64String);
            // console.log("base64 = ", base64);
            return res.json([{
                name: tag.tags.title,
                singer: tag.tags.artist,
                cover: base64,
                musicSrc: "http://localhost:5200/api/music"
            }]);

        },
        onError: function(error) {
            console.log(':(', error.type, error.info);
        }
    });
});

router.get('/music', (req, res) => {
    res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');
    res.download("./longue.mp3");
});

// this is our update method
// this method overwrites existing data in our database
router.post('/updateData', (req, res) => {
    const { id, update } = req.body;
    Data.findByIdAndUpdate(id, update, (err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});

let r = (l = 7) => Math.random().toString(36).substr(2, l);





// this is our delete method
// this method removes existing data in our database
router.delete('/deleteData', (req, res) => {
    const { id } = req.body;
    Data.findByIdAndRemove(id, (err) => {
        if (err) return res.send(err);
        return res.json({ success: true });
    });
});

// this is our create methid
// this method adds new data in our database
router.post('/putData', (req, res) => {
    let data = new Data();

    const { id, message } = req.body;

    if ((!id && id !== 0) || !message) {
        return res.json({
            success: false,
            error: 'INVALID INPUTS',
        });
    }
    data.message = message;
    data.id = id;
    data.save((err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});*/


/*

exports.createThing = (req, res, next) => {
    const thing = new Thing({
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        userId: req.body.userId
    });
    thing.save().then(
        () => {
            res.status(200).json({
                message: 'Post saved successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getOneThing = (req, res, next) => {
    Thing.findOne({
        _id: req.params.id
    }).then(
        (thing) => {
            res.status(200).json(thing);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifyThing = (req, res, next) => {
    const thing = new Thing({
        _id: req.params.id,
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        userId: req.body.userId
    });
    Thing.updateOne({_id: req.params.id}, thing).then(
        () => {
            res.status(200).json({
                message: 'Thing updated successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.deleteThing = (req, res, next) => {
    Thing.deleteOne({_id: req.params.id}).then(
        () => {
            res.status(200).json({
                message: 'Deleted!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getAllStuff = (req, res, next) => {
    Thing.find().then(
        (things) => {
            res.status(200).json(things);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};*/
