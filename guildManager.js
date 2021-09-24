const Discord = require('discord.js');
const ytdl = require('ytdl-core');

class ServerItem {
    constructor(channelId, conn){
        this.channelId = channelId;
        this.conn = conn;
        this.queue = []; //song queue
        this.currentSong = null;
        this.dispatcher = null;
    }
    addSong(song) {
        this.queue.push(song);
    }
}

//contains all servers in which the bot is playing music currently
const servers = new Discord.Collection();

//gets voice channel while checking if user is allowed to call commands
const getChannel = message => {
    let voiceChannel = message.member.voice.channel;

    //check if user is in a channel
    if (!voiceChannel) {
        message.reply('Please join a voice channel first!');
        return null;
    }
    //return if bot not in a channel
    if(!servers.has(voiceChannel.guild.id)) {
        message.reply('Not in a channel!');
        return null;
    }
    //return if not in the same channel as bot
    if (voiceChannel.id != servers.get(voiceChannel.guild.id).channelId) {
        message.reply('Join the correct voice channel first!');
        return null;
    }

    return voiceChannel;
};

const join = async (message) => {
    let voiceChannel = message.member.voice.channel;

    if (!voiceChannel) return message.reply('Please join a voice channel first!');

    //check if bot already joined another channel
    if(servers.has(voiceChannel.guild.id)) {
        if(servers.get(voiceChannel.guild.id).channelId != voiceChannel.id) return message.reply('Already in a different channel!');
    }else {//else join and add to the servers collection
        let conn = await voiceChannel.join();
        servers.set(voiceChannel.guild.id, new ServerItem(voiceChannel.id, conn));
    }
};

const leave = (message) => {
    let voiceChannel = getChannel(message);
    if(!voiceChannel) return;

    //remove from servers collection
    servers.delete(voiceChannel.guild.id);

    voiceChannel.leave();
};

const playSong = (guildId) => {
    let server = servers.get(guildId);

    if(!server.queue.length) {
        server.currentSong = null;
        return;
    }
    server.currentSong = server.queue.shift();
    server.dispatcher = server.conn.play(ytdl(`https://www.youtube.com/watch?v=${server.currentSong.id}`, {filter: 'audioonly'}));
    
    server.dispatcher.on('finish', () => {
        playSong(guildId);
    });
};

module.exports = {
    servers: servers,
    join: join,
    leave: leave,
    getChannel: getChannel,
    playSong: playSong
}