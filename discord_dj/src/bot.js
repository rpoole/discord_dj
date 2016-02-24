let settings = JSON.parse(require('fs').readFileSync('settings.json', 'utf8'));
let Discord = require('discord.js');

let bot = new Discord.Client();

let commands = {
  request() {
    return Promise.reject('NYI');
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
        return bot
          .reply(msg, joinedMessage, {tts: true});
      });
  },
  start() {
    return Promise.reject('NYI');
  },
  pause() {
    return Promise.reject('NYI');
  },
  stop() {
    return Promise.reject('NYI');
  },
  help({msg: msg}) {
    let availableCommands = Object.keys(this).join(', ');
    let response = `Available commands are: ${availableCommands}.`;
    return bot
      .reply(msg, response);
  },
};

function runCommand(command, opts) {
  if (!(command in commands)) {
    return Promise.reject("Command not present.");
  }

  return commands[command](opts);
}

function parseCommandInput(cleanContent) {
  let commandArgs = cleanContent.toLowerCase().split(' ');
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
