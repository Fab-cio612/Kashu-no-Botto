const Discord = require('discord.js');
const config = require('./config.json');
const { token } = require('./token.json');

const { commands } = require('./commands.js')

const client = new Discord.Client();

client.once('ready', () => {
    console.log('ready!');
    client.user.setActivity(' | ;help', { type: 'LISTENING' });
});

client.on('message', message => {
    //check if command
    if(!message.content.startsWith(config.prefix) || message.author.bot) return;

    //parse
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    //check if command exists and execute
    for(let c of commands){
        if(c.command == cmd){
            return c.execute(message, args);
        }
    }

    //else send message
    return message.channel.send("I don't know that command");
});

client.login(process.env.TOKEN);