"use strict";

let fs = require('fs');
let path = require('path');
let Discord = require('discord.js');
let settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
let MusicPlayer = require('./player.js');
let ytdl = require('ytdl-core');
let ffmpeg = require('ffmpeg');

let bot = new Discord.Client();
let player = null;

const ALLOWED_FILE_TYPES = ['.m4a', '.webm', '.mp4'];

let commands = {
  request({msg: msg, args: args}) {
    ytdl(args.toString(), {filter: function(format) { return !format.bitrate && format.audioBitrate; }})
        .pipe(fs.createWriteStream('test.mp4'));
  },
  summon({msg: msg, args: args}) {
    if (args.length === 0) {
      return Promise.reject('No room supplied.');
    }

    let roomName = args.join(' ');
    let channel = bot.channels.filter( c => c.name.toLowerCase() === roomName);

    if (channel.length != 1) {
      return Promise.reject(`Unable to find channel ${roomName}.`);
    }

    channel = channel[0];

    return bot
      .joinVoiceChannel(channel)
      .then(() => {
        let joinedMessage = 'The big D is here to give you some Jays.';
        player = new MusicPlayer(bot.voiceConnection);
        return bot
          .reply(msg, joinedMessage, {tts: true});
      });
  },
  start({}) {
    if (!bot.voiceConnection) {
      return Promise.reject('You need to summon the bot to a room first!.');
    }

    let playlists = getDirectories(settings.playlistFolder);
    let fileNames = [];
    playlists.forEach(p => {
      let playlistPath = `${settings.playlistFolder}/${p}/`;
      let files = fs.readdirSync(playlistPath);
      files.forEach(f => {
        if (ALLOWED_FILE_TYPES.indexOf(path.extname(f)) !== -1) {
          let filePath = `${playlistPath}${f}`;
          fileNames.push(filePath);
        }
      });
    });

    return bot.voiceConnection.playFile(fileNames[0]);
  },
  skip() {
    return player.skip();
  },
  stop() {
    if (!bot.voiceConnection) {
      return Promise.reject('You need to summon the bot to a room first!.');
    }

    return player.stop();
  },
  help({msg: msg}) {
    let availableCommands = Object.keys(this).join(', ');
    let response = `Available commands are: ${availableCommands}.`;
    return bot
      .reply(msg, response);
  },
};

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(file => {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

function runCommand(command, opts) {
  if (!(command in commands)) {
    return Promise.reject("Command not present.");
  }

  return commands[command](opts);
}

function parseCommandInput(cleanContent) {
  let commandArgs = cleanContent.split(' ');
  commandArgs.shift(); // remove the mention
  let command = commandArgs.splice(0,1);

  let commandMsgStr = command;
  if (commandArgs.length > 0) {
    commandMsgStr += `: ${commandArgs.join(' ')}`;
  }

  return [command, commandArgs, commandMsgStr];
}

// register handlers
bot.on('message', msg => {
  if (!msg.isMentioned(bot.user)) {
    return;
  }

  let [command, commandArgs, commandMsgStr] = parseCommandInput(msg.cleanContent);

  let opts = {
    msg: msg,
    args: commandArgs,
  };

  runCommand(command, opts)
    .then(() => {
      console.info(`Successfully ran ${commandMsgStr}.`);
    })
    .catch(err => {
      bot
        .reply(msg, `Unable to run ${commandMsgStr}.\nReason: ${err}`)
        .catch(handleErr);
    });
});

bot.on('ready', () => {
  console.info('Bot ready!');
});

// start the bot
bot
  .login(settings.discord.username, settings.discord.password)
  .catch(handleErr)
  .then(() => { 
    console.info('Successful login!'); 
  });

function handleErr(err) {
  console.error(err);
  exit();
}
