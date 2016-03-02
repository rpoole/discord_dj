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

    let shufflePos = args.indexOf('shuffle');
    let shuffle = shufflePos !== -1;
    if (shuffle) {
      args.splice(shufflePos, 1);
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
    return player.start(shuffle);
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
  stats({msg, args}) {
    // <editor-fold desc="zzz">
    let apiKey = 'A9F8F8AE71DB176986D19B3645B3EE4F';
    let playerID = '';
    let matchesRequested = 0;
    let heroRequested = 0;
    let heroes = heroIDs.heroes;
    let players = {
        zack: ['76561198043899518', '83633790'],
        scott: ['76561198031758954', '71493226'],
        rob: ['76561198026942332', '66676604'],
        ralph: ['76561197977345234', '17079506'],
        aaron: ['76561198021710539', '61444811'],
        joseph: ['76561198010457614', '50191886'],
        john: ['76561198186925302', '226659574'],
        steve: ['76561197977310218', '17044490'],
        matt: ['76561197964365391', '4099663'],
        alex: ['76561197964638003', '4372275'],
        jake: ['76561198158605918', '198340190'],
        tom: ['76561198024081774', '63816046']
    };
    let allMessages = [];

    let secondArgIsNum = isNaN(parseInt(args[1]));
    let thirdArgIsNum = isNaN(parseInt(args[2]));

    if(!secondArgIsNum && thirdArgIsNum) {
      [, matchesRequested, heroRequested] = args;
    }
    else {
      [, heroRequested, matchesRequested] = args;
    }

    let playerRequested = args[0];
    playerID = players[playerRequested];

    heroes.forEach(p => {
      let noSpaceName = p.localized_name.replace(' ', '');
      if (noSpaceName === heroRequested) {
        heroRequested = p.id;
      }
    });

    if(typeof matchesRequested === 'undefined') {
      matchesRequested = 0;
    }
    if(typeof heroRequested === 'undefined') {
      heroRequested = 0;
    }

    let options = {
      url: `https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/v001`,
      qs: {
        key: apiKey,
        account_id: playerID[0],
        hero_id: heroRequested,
        matches_requested: matchesRequested
      },
      json: true
    };
    //</editor-fold>
    return rp(options)
      .then(data => {
        let matchIDs = [];
        data.result.matches.forEach(v => {
          matchIDs.push(v.match_id);
        });

        // TODO loop using promises
        matchIDs.forEach(k => {
          let optionsTwo = {
            url: `https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v1`,
            qs: {
              key: apiKey,
              match_id: k
            },
            json: true
          };

          rp(optionsTwo)
            .then(data => {
              //<editor-fold desc="zzz">
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
              let matchDate = new Date(data.result.start_time * 1000);

              for (let i = 0; i < 10; i++) {
                players.push(data.result.players[i]);
              }

              players.forEach(v => {
                if (v.account_id === parseInt(playerID[1])) {
                  kills = v.kills;
                  deaths = v.deaths;
                  assists = v.assists;
                  heroID = v.hero_id;
                  playerSlot = v.player_slot;
                }
              });

              heroes.forEach(p => {
                if (p.id === heroID) {
                  heroName = p.localized_name;
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

              let readableDateTime = matchDate.toLocaleString();
              let completeMessage = `\`\`\`${readableDateTime}\nHero: ${heroName}\nDuration: ${durationMinutes}:${durationSeconds}\nResult: ${result}\nKills: ${kills}\nDeaths: ${deaths}\nAssists: ${assists}\`\`\``;
              // </editor-fold>

              allMessages.push(completeMessage);
              console.log(`ALL MESSAGES: ${allMessages.length}`);
              console.log(`MATCHES REQUESTED: ${matchesRequested}`);
              if (parseInt(allMessages.length) === parseInt(matchesRequested)) {
                allMessages.sort();
                allMessages.reverse();
                bot.sendMessage(msg.channel, allMessages);
                console.log(allMessages);
              }
              console.log('test3');
            })
            .catch(err => {
              console.error('second rp failed');
              console.error(err);
            });
        });
      });
  },
  dota({msg, args}) {
    let teamName = args[0];
    let options = {
      url: `http://dailydota2.com/match-api`,
      json: true
    };

    return rp(options)
      .then(function (data) {
        data.matches.forEach(v => {
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
      });
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
  commandArgs.shift();
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
