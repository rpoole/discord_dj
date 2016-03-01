"use strict";

import fs from 'fs';
import path from 'path';
import Discord from 'discord.js';
import MusicPlayer from './player.js';
import ytdl from 'ytdl-core';
import rp from 'request-promise';

let heroIDs = JSON.parse(fs.readFileSync('heroIDs.json', 'utf8'));
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
  zack({msg, args}) {
    let apiKey = 'A9F8F8AE71DB176986D19B3645B3EE4F';
    let tricepzID = '76561198043899518';
    let matchesRequested = 0;
    let heroRequested = 0;
    let heroes = heroIDs.heroes;

    if (isNaN(parseInt(args[0])) === false && isNaN(parseInt(args[1])) === true) {
      matchesRequested = args[0];
      heroRequested = args[1];
    }
    else if (isNaN(parseInt(args[0])) === true && isNaN(parseInt(args[1])) === false) {
      heroRequested = args[0];
      matchesRequested = args[1];
    }

    //console.log(args[0]);
    //console.log(parseInt(args[0]));
    //console.log(typeof (args[0]));
    //console.log(args[1]);
    //console.log(parseInt(args[1]));
    //console.log(typeof (args[1]));

    heroes.forEach(p => {
      let noSpaceName = p.localized_name.replace(/\s/g, '');
      //console.log(noSpaceName);
      if (noSpaceName === heroRequested) {
        heroRequested = p.id;
      }
    });

    let options = {
      url: `https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v001`,
      qs: {
        key: apiKey,
        account_id: tricepzID,
        hero_id: heroRequested,
        matches_requested: matchesRequested
      },
      json: true
    };

    rp(options)
      .then(function (data) {
        let matchIDs = [];
        data.result.matches.forEach(v => {
          matchIDs.push(v.match_id);
        });


        //console.log(matchIDs);

        matchIDs.forEach(v => {
          let optionsTwo = {
            url: `https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1`,
            qs: {
              key: apiKey,
              match_id: v
            },
            json: true
          };

          rp(optionsTwo)
            .then(function (data) {

              let result = 'win';
              let durationMinutes = Math.floor(data.result.duration / 60);
              let durationSeconds = (data.result.duration % 60);

              let kills = 0;
              let deaths = 0;
              let assists = 0;
              let heroID = 0;
              let heroName = '';
              let playerSlot = 0;
              let players = [];

              console.log(data);

              for (let i = 0; i < 10; i++) {
                players.push(data.result.players[i]);
              }

              players.forEach(v => {
                if (v.account_id === 83633790) {
                  kills = v.kills;
                  deaths = v.deaths;
                  assists = v.assists;
                  heroID = v.hero_id;
                  playerSlot = v.player_slot;
                  //console.log(v);
                }
              });

              heroes.forEach(p => {
                if (p.id === heroID) {
                  heroName = p.localized_name;
                  //console.log(heroName);
                }
              });

              if (data.result.radiant_win === false) {
                if (playerSlot <= 5) {
                  result = 'loss';
                }
              }
              else {
                if (playerSlot >= 5) {
                  result = 'loss';
                }
              }

              let completeMessage = `\`\`\`Hero: ${heroName}\nDuration: ${durationMinutes}:${durationSeconds}\nResult: ${result}\nKills: ${kills}\nDeaths: ${deaths}\nAssists: ${assists}\`\`\``;

              return bot
                .sendMessage(msg.channel, completeMessage);
            })
            .catch(function (err) {
              console.log('second rp failed');
              console.log(err);
            });
        });
      })
      .catch(function (err) {
        console.log('first rp failed');
        console.log(err);
      });
    return Promise.resolve();
  },
  dota({msg, args}) {
    let teamName = args[0];
    let options = {
      url: `http://dailydota2.com/match-api`,
      json: true
    };

    console.log(teamName);

    rp(options)
      .then(function (data) {
        data.matches.forEach(v => {
          //console.log(v.team2.team_tag);
          //console.log(v.team1.team_tag);
          if(args[0]) {
            if((v.team2.team_tag === teamName) || (v.team1.team_tag === teamName)) {
              let tempDateTime = new Date(v.starttime_unix * 1000);
              let readableDateTime = tempDateTime.toLocaleString();
              let completeMessage = `${v.team1.team_tag} vs. ${v.team2.team_tag}\n\`\`\`${v.league.name}\nBo${v.series_type}\n${readableDateTime}\`\`\``;

              return bot
                .sendMessage(msg.channel, completeMessage);
            }
          }
          else
          {
            let readableDateTime = new Date(v.starttime_unix * 1000);
            let completeMessage = `${v.team1.team_tag} vs. ${v.team2.team_tag}\n\`\`\`BEST OF ${v.series_type}\nStart Time: ${readableDateTime}\`\`\``;

            return bot
              .sendMessage(msg.channel, completeMessage);
          }
        });
      })
      .catch(function (err) {
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
  let command = commandArgs.splice(0,1);
  command[0] = command[0].substring(1);

  let commandMsgStr = command;
  if (commandArgs.length > 0) {
    commandMsgStr += `: ${commandArgs.join(' ')}`;
  }

  return [command, commandArgs, commandMsgStr];
}

//function delay(interval) {
//  return new Promise(function(resolve) {
//    setTimeout(resolve, interval);
//  });
//}

// register handlers
bot.on('message', msg => {
  let text = msg.cleanContent;
  if(text.indexOf('/', 0) !== 0) {
    console.log(text);
    return;
  }

  let [command, commandArgs, commandMsgStr] = parseCommandInput(msg.cleanContent);

  //console.log(command);
  //console.log(commandArgs);
  //console.log(commandMsgStr);

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
