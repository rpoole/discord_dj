"use strict";

let heroIDs = JSON.parse(fs.readFileSync('heroIDs.json', 'utf8'));
import fs from 'fs';
import path from 'path';
import Discord from 'discord.js';
import MusicPlayer from './player.js';
import ytdl from 'ytdl-core';
import rp from 'request-promise';

let settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
let bot = new Discord.Client();
let player = null;

const ALLOWED_FILE_TYPES = ['.m4a', '.webm', '.mp4', '.mp3'];

let commands = {
  request({msg, args}) {
    ytdl(args.toString(), {filter: function(format) { return !format.bitrate && format.audioBitrate; }})
        .pipe(fs.createWriteStream('test.mp4'));
  },
  summon({msg}) {
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
  start({args}) {
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
  help({msg}) {
    let availableCommands = Object.keys(this).join(', ');
    let response = `Available commands are: ${availableCommands}.`;
    return bot
      .reply(msg, response);
  },
  zack({msg}) {
    let apiKey = 'A9F8F8AE71DB176986D19B3645B3EE4F';
    let tricepzID = '76561198043899518';
    let options = {
      url: `https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v001`,
      qs: {
        key: apiKey,
        account_id: tricepzID
      },
      json: true
    };

    rp(options)
      .then(function (data) {
        let mostRecentMatch = (data.result.matches[0].match_id);
        let optionsTwo = {
          url: `https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1`,
          qs: {
            key: apiKey,
            match_id: mostRecentMatch
          },
          json: true
        };

        rp(optionsTwo)
            .then(function (data) {
                let result = '';
                if (data.result.radiant_win === 0) {
                  console.log('wtf');
                  result = 'loss';
                }
                else {
                  console.log('okay');
                  result = 'win';
                }

                let kills = 0;
                let deaths = 0;
                let assists = 0;
                let heroID = 0;
                let heroName = '';
                let players = [];

                for (let i = 0; i < 10; i++) {
                  players.push(data.result.players[i]);
                  console.log('test');
                }

                players.forEach(v => {
                  if (v.account_id === 83633790) {
                    kills = v.kills;
                    deaths = v.deaths;
                    assists = v.assists;
                    heroID = v.hero_id;
                    console.log(v);
                  }
                });

                let heroes = heroIDs.heroes;

                heroes.forEach(p => {
                  if (p.id === heroID) {
                    heroName = p.localized_name;
                    console.log(heroName);
                  }
                });

                let completeMessage = `Zack's most recent match:\n Hero: ${heroName}\n Result: ${result}\n Kills: ${kills}\n Deaths: ${deaths}\n Assists: ${assists}`;

                return bot
                  .reply(msg, completeMessage);
            })
            .catch(function (err) {
              console.log('second rp failed');
              console.log(err);
            });
      })
      .catch(function (err) {
        console.log('first rp failed');
        console.log(err);
      });

    return Promise.resolve();
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
