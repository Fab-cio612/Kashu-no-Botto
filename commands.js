const Discord = require('discord.js');
const { prefix, color } = require('./config.json');
const { join, leave, servers, getChannel, playSong } = require('./guildManager.js');
const { searchSong } = require('./songFetcher.js');

const commands = [
    {
        command: 'play',
        desc: 'play a song from youtube',
        execute: async (message, args) => {
            if(!args.length) return;

            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.reply('Please join a voice channel first!');

            //bot should join if not joined yet
            if(!servers.has(message.member.guild.id)) await join(message);
            //user should be in the same channel to use command
            if(servers.get(voiceChannel.guild.id).channelId != voiceChannel.id) return message.reply("join the correct channel first!");

            //search song and add to queue
            let song = await searchSong(args.join('+'));

            if(!song) return message.reply("Couldn't find that song");

            servers.get(message.member.guild.id).addSong(song);
            //play if no song is being played
            if(servers.get(message.member.guild.id).currentSong == null) playSong(message.member.guild.id);

            //send message about song
            const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setTitle(song.title)
			.setDescription(`${song.artist} | ${song.duration}`);

            return message.channel.send(embed);
        }
    },
    {
        command: 'join',
        desc: 'make the bot join the voice channel',
        execute: (message, args) => {
            join(message);
        }
    },
    {
        command: 'leave',
        desc: 'make the bot leave your voice channel',
        execute: (message, args) => {
            leave(message);
        }
    },
    {
        command: 'skip',
        desc: 'skips current song',
        execute: (message, args) => {
            let d = servers.get(message.member.guild.id).dispatcher;
            d.destroy();
            playSong(message.member.guild.id);

        }
    },
    {
        command: 'pause',
        desc: 'pauses current song',
        execute: (message, args) => {
            let voiceChannel = getChannel(message);
            if (!voiceChannel) return;

            servers.get(message.member.guild.id).dispatcher.pause();

            message.channel.send('Paused!');
        }
    },
    {
        command: 'resume',
        desc: 'resumes current song',
        execute: (message, args) => {
            let voiceChannel = getChannel(message);
            if (!voiceChannel) return;

            servers.get(message.member.guild.id).dispatcher.pause();

            message.channel.send('resumed!');
        }
    },
    {
        command: 'shuffle',
        desc: 'shuffles queue',
        execute: (message, args) => {
            let voiceChannel = getChannel(message);
            if (!voiceChannel) return;

            let queue = servers.get(message.member.guild.id).queue;

            let c = queue.length;

            while (c > 0) {
                let i = Math.floor(Math.random() * c);
                c--;
        
                let temp = queue[c];
                queue[c] = queue[i];
                queue[i] = temp;
            }
        }
    },
    {
        command: 'help',
        desc: 'shows list of commands',
        execute: (message, args) => {
            let list = commands.map(c => "**" + `${prefix}` + c.command + "**: " + c.desc).join('\n');

            const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setTitle('Command list:')
			.setDescription(list);

		    return message.channel.send(embed);
        }
    },
    {
        command: 'info',
        desc: 'info about current song',
        execute: (message, args) => {
            let voiceChannel = getChannel(message);
            if (!voiceChannel) return;

            let song = servers.get(message.member.guild.id).currentSong;
            
            const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setTitle(song.title)
			.setDescription(`${song.artist} | ${song.duration}`);

            return message.channel.send(embed);
        }
    }
];

module.exports.commands = commands;