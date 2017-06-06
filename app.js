'use strict';
let express = require('express');
let app = express();
let path = require('path');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let request = require('request');
let moment = require('moment');

let CronJob = require('cron').CronJob;
let cors = require('cors');

new CronJob('0 9 * * *', function() {
  dailyRankingsRequest();
}, null, true, 'America/New_York');

let dateAndTime = moment().utcOffset('-0400').format('MM-DD-YY hh:mm A');
console.log(dateAndTime);
let date = moment().format('MM-DD-YY');

let Schema = mongoose.Schema;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function loopEntries(entryArray) {
    for(let i =0;i<entryArray.length;i=i+1){
        // blank "clean" object to add data to
        let cleanObj = {};

        // Add data fields
        cleanObj.songName = entryArray[i]["im:name"]["label"];
        cleanObj.artist = entryArray[i]["im:artist"]["label"];
        cleanObj.genre = entryArray[i]["category"]["attributes"]["term"];
        cleanObj.rank = i + 1; // Because indexes start at 0
        cleanObj.releaseDate = entryArray[i]["im:releaseDate"]["label"];
        cleanObj.dateAndTime = dateAndTime;
        cleanObj.date = date;
        
        // push each clean object to mongoose
        let SongModel = Song;
        SongModel.create(cleanObj, function(err, result){
            console.log("Updated Song with id of ", result._id);
        });
    }
}

function dailyRankingsRequest() {
    request('https://itunes.apple.com/us/rss/topsongs/limit=100/explicit=true/json', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    
    let json = JSON.parse(body); // string to object
    let entries = json.feed.entry; // this part should be an array of objects
    loopEntries(entries);
    });
}

let songsRankingsSchema = new Schema({
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

let Song = mongoose.model('Song', songsRankingsSchema);

mongoose.connect('mongodb://localhost/songsRankings', function(err){
   if (err){
       console.error(err);
   } else {
       console.log('connected to songs rankings database');
   }
});

app.get('/songs', function(req,res,next){
    // pass empty object in find to get all, to get specific pass a property like name:'Autumn' to get all puppies named Autumn
    let allSongs = Song.find({}, function(err, result){
        if (err){
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/songs/:dateParam', function(req,res,next){
    // pass empty object in find to get all, to get specific pass a property like name:'Autumn' to get all puppies named Autumn
    let allSongs = Song.find({date: req.params.dateParam}).sort({rank: 1}).exec(function(err, result){
        if (err){
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/songs/byname/:songParam', function(req,res,next){
    // pass empty object in find to get all, to get specific pass a property like name:'Autumn' to get all puppies named Autumn
    let allSongs = Song.find({songName: req.params.songParam}, function(err, result){
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

app.listen(8080, function() {
    console.log('The app is listening on port 8080!');
});