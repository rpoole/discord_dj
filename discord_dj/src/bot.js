var Discord = require('discord.js');

var bot = new Discord.Client();

var sent = false;
bot.on('message', function(msg) {
    if (msg.isMentioned(bot)) {
        console.log('hi');
    }

});

bot.on('ready', function () {
    console.log(bot.channels[0]);

    var c = null;
    for (var i = 0; i < bot.channels.length; i++) {
        if (bot.channels[i].name === 'general') {
            bot.sendMessage(bot.channels[i], "Ready to play music!");
        }
    }
});

bot.login('dev.discorddj@gmail.com','', function(err, token) {
    if (err) {
        console.log(err);
        exit();
    }
});

