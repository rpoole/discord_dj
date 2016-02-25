"use strict";

let fs = require('fs');
let path = require('path');
let Discord = require('discord.js');
let settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
let rest = require('node-rest-client');
let MusicPlayer = require('./player.js');
let ytdl = require('ytdl-core');

let bot = new Discord.Client();
let player = null;

const ALLOWED_FILE_TYPES = ['.m4a', '.webm', '.mp4', '.mp3'];

let commands = {
  request({msg: msg, args: args}) {
    ytdl(args.toString(), {filter: function(format) { return !format.bitrate && format.audioBitrate; }})
        .pipe(fs.createWriteStream('test.mp4'));
  },
  summon({msg: msg}) {
    if (!msg.author.voiceChannel) {
      return Promise.reject('You must be in a voice room!');
    }

    return bot
      .joinVoiceChannel(msg.author.voiceChannel)
      .then(() => {
        let joinedMessage = 'The big D is here to give you some Jays.';
        player = new MusicPlayer(bot.voiceConnection);
        console.log(player);
        return bot
          .reply(msg, joinedMessage);
      });
  },
  start({args: args}) {
    if (!bot.voiceConnection) {
      return Promise.reject('You need to summon the bot to a room first!.');
    }

    let selectedPlaylists = args;
    let playlists = getDirectories(settings.playlistFolder);
    let fileNames = [];

    playlists.forEach(p => {
      if (selectedPlaylists.length > 0 && selectedPlaylists.indexOf(p) === -1) {
        return;
      }

      let playlistPath = `${settings.playlistFolder}${p}/`;
      let files = fs.readdirSync(playlistPath);
      files.forEach(f => {
        if (ALLOWED_FILE_TYPES.indexOf(path.extname(f)) !== -1) {
          let filePath = path.resolve(`${playlistPath}${f}`);

          fileNames.push(filePath);
        }
      });
    });
    player.addSongsToCurrentPlaylist(fileNames);
    return player.start();
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
  test({msg: msg}) {
    let apiKey = 'A9F8F8AE71DB176986D19B3645B3EE4F';
    let tricepzID = '76561198043899518';
    let test = new rest.Client();
    let radiantVictory = '';
    test.get(`https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v001/?account_id=${tricepzID}&key=${apiKey}`,
        function (data) {
          let mostRecentMatch = (data.result.matches[0].match_id);
          test.get(`https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1/?key=${apiKey}&match_id=${mostRecentMatch}`,
            function (data) {
              if (data.result.radiant_win === 0) {
                console.log('wtf');
                radiantVictory = 'lost';
              }
              else {
                console.log('okay');
                radiantVictory = 'won';
                console.log('zzz');
                return radiantVictory;
              }

              data.result.players.find( function isZack(element) {
                var start = '83633790';
                while (start != element) {
                  return false;
                }
                return element;
              });
            });
        });
    return bot
        .reply(msg, radiantVictory);
  }
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

bot.on("debug", info => {
  console.log(info);
});

function handleErr(err) {
  console.error(err);
  process.exit();
}
