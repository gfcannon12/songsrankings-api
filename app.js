'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const request = require('request');
const moment = require('moment-timezone');

const CronJob = require('cron').CronJob;
const cors = require('cors');

new CronJob('5 5 * * *', function() {
  dailyRankingsRequest();
}, null, true, 'UTC');

const dateAndTime = moment().utc()
const dateAndTimeET = dateAndTime.tz('America/New_York');
console.log('dateAndTimeET', dateAndTimeET.format('MM-DD-YY HH:mm'));
const date = dateAndTimeET.format('MM-DD-YY');

const Schema = mongoose.Schema;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

async function loopEntries(entryArray) {
    for(let i =0;i<entryArray.length;i=i+1){
        // blank "clean" object to add data to
        const cleanObj = {};

        // Add data fields
        cleanObj.songName = entryArray[i]["im:name"]["label"];
        cleanObj.artist = entryArray[i]["im:artist"]["label"];
        cleanObj.genre = entryArray[i]["category"]["attributes"]["term"];
        cleanObj.rank = i + 1; // Because indexes start at 0
        cleanObj.releaseDate = entryArray[i]["im:releaseDate"]["label"];
        cleanObj.dateAndTime = dateAndTime;
        cleanObj.date = date;
        
        // push each clean object to mongoose
        const SongModel = Song;
        try {
            const entry = await SongModel.create(cleanObj);
            if (typeof entry.errors !== 'undefined') {
                console.error(entry.errors);
            } else console.log(`${entry._doc.songName} saved to database`);
        } catch(e) {
            console.error(e);
        }
    }
}

function dailyRankingsRequest() {
    request('https://itunes.apple.com/us/rss/topsongs/limit=100/explicit=true/json', function (error, response, body) {
        if (error) {
          console.log('error:', error);
        } else console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    
    const json = JSON.parse(body); // string to object
    const entries = json.feed.entry; // this part should be an array of objects
    loopEntries(entries);
    });
}

const songsRankingsSchema = new Schema({
    songName: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    rank: {
        type: Number,
        required: true
    },
    releaseDate: {
        type: String,
        required: true
    },
    artistImage: {
        type: String
    },
    songPreview: {
        type: String
    },
   songLink: {
        type: String
    },
    artistLink: {
        type: String
    },
    dateAndTime: {
        type: String
    },
    date: {
        type: String
    }
});

const Song = mongoose.model('Song', songsRankingsSchema);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err) => {
    if (err) { console.log('Error connecting to Mongo', err);
    } else { console.log('Connected to the songsrankings database'); }
});

app.get('/songs', function(req,res,next){
    // pass empty object in find to get all, to get specific pass a property like name:'Autumn' to get all puppies named Autumn
    const allSongs = Song.find({}, function(err, result){
        if (err){
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/songs/:dateParam', function(req,res,next){
    // pass empty object in find to get all, to get specific pass a property like name:'Autumn' to get all puppies named Autumn
    const allSongs = Song.find({date: req.params.dateParam}).sort({rank: 1}).exec(function(err, result){
        if (err){
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/songs/byname/:songParam', function(req,res,next){
    // pass empty object in find to get all, to get specific pass a property like name:'Autumn' to get all puppies named Autumn
    const allSongs = Song.find({songName: req.params.songParam}).sort({date: 1}).exec(function(err, result){
        if (err){
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/', function(req,res,next){
    res.send('Welcome to the best website in the world');
});

app.listen(process.env.PORT || 8080, function() {
    console.log(`The app is listening on port ${process.env.PORT || 8080}`);
});