'use strict';
let express = require('express');
let app = express();
let path = require('path');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let entry = {
        songName : "Give me one good reason",
        artist : "Blink-182",
        genre : "Rock",
        rank : 6,
        releaseDate : "2004-01-01"
    };

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

app.get('/addSong', function(req,res,next){
    let song = new Song({
        songName : "Lose Yourself",
        artist : "Eminem",
        genre : "Rap",
        rank : 3,
        releaseDate : "2003-01-01"
        
    });
    song.save(function(err){
        if (err) {
            console.error(err);
        } else {
            res.send('song was saved');
        }
    })
});

app.get('/songs', function(req,res,next){
    // pass empty object in find to get all, to get specific pass a property like name:'Autumn' to get all puppies named Autumn
    Song.find({}, function(err, result){
        if (err){
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

let artistsSchema = new Schema({
        artist: {
            type: String,
            required: true
        },
        genre: {
            type: String,
            required: true
        }
});

let Artist = mongoose.model('Artist', artistsSchema);

app.get('/', function(req,res,next){
    res.send('Welcome to the best website in the world');
});

app.get('/addArtist', function(req,res,next){
    let artist = new Artist({
        artist : "Cascada",
        genre : "Dance"
    });
    artist.save(function(err){
        if (err) {
            console.error(err);
        } else {
            res.send('artist was saved');
        }
    })
});

app.get('/artists', function(req,res,next){
    // pass empty object in find to get all, to get specific pass a property like name:'Autumn' to get all puppies named Autumn
    Artist.find({}, function(err, result){
        if (err){
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/addSongPlusArtist', function(req,res,next){
    
    let song = new Song({
        songName : entry.songName,
        artist : entry.artist,
        genre : entry.genre,
        rank : entry.rank,
        releaseDate : entry.releaseDate
        
    });
    let artist = new Artist({
        artist : entry.artist,
        genre : entry.genre
    });
    
    artist.save(function(err){
        if (err) {
            console.error(err);
            res.send('Error saving to artists collection');
        } else {
            console.log('artist was saved');
            song.save(function(err){
                if (err) {
                    console.error(err);
                    res.send('Saved to artists collection, but failed saving to songs collection');
                } else {
                    console.log('song was saved');
                    res.send('Saved to artists and songs collection');
                }
            });
        }
    });
});
// test
app.listen(8080, function() {
    console.log('The app is listening on port 8080!');
});