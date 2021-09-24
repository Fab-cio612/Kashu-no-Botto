const axios = require('axios');

class Song {
    constructor(id, title, artist, duration) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.duration = duration;
    }
}

const searchSong = async (query) => {
    let res = null;

    try {
        //search song from youtube
        res = await axios(`https://www.youtube.com/results?search_query=${query}`);
    } catch(err) {
        console.log(err);
        return res;
    }
    
    let data = res.data;
    //use regex and methods to extract information from youtube response
    let id = data.match(/{"videoRenderer":{"videoId":".*?"/).shift().split('"')[5];
    let title = data.match(/"title":{"runs":\[{"text":".*?"}/).shift().split('"')[7];
    let artist = data.match(/"longBylineText":{"runs":\[{"text":".*?"/).shift().split('"')[7];
    let duration = data.match(/"lengthText":.*?"simpleText":".*?"/).shift().split('"')[13];
        
    return new Song(id, title, artist, duration);
}

module.exports.searchSong = searchSong;