const fs = require('fs')

const {
    RichEmbed
} = require('discord.js');

const {
    ratabalize,
    getRating,
    givePoints,
    getTopEntries,
    getMsgByID
  } = require('../globalFunctions.js')
  const contestsChannel = "569591968221495306"
module.exports = {
    name: ['extend'],
    type: 'manager',
    help: '``!extend [contest name] [days]`` Extends a contest deadline',
    execute(client, message, words) {

        

        let contests = JSON.parse(fs.readFileSync('contests.json'))
        
        if (!contests.hasOwnProperty(words[1])) {
            message.channel.send("There is no contest right now named \"" + words[1] + "\"");
            return
        }

        let number = parseInt(words[2])
        if (!number){
            message.channel.send('That\'s not a number')
            return
        }

        if (!contests[words[1]].hasOwnProperty('deadline')) {
            message.channel.send("This contest has no deadline");
            return
        }

        contests[words[1]].deadline += number * 86400

        fs.writeFile('contests.json', JSON.stringify(contests, null, 2), (err) => {
            message.channel.send('Extended contest deadline')
            client.channels.get(contestsChannel).send(`**"${words[1]}" deadline have been extended by ${words[2]} days!**`);
        })
        


    }
}