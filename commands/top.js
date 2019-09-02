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

module.exports = {
    name: ['top', 't', 'toplist', 'list'],
    type: 'restricted',
    help: '``!top [amount] [contest name]`` will show a toplist of the highest rated entries in a contest (max is 5)',
    execute(client, message, words) {
        let contests = JSON.parse(fs.readFileSync('contests.json'))


        if (!contests.hasOwnProperty(words[2])) {
          message.channel.send("There is no contest right now named \"" + words[2] + "\"");
          return
        }

        const send = async function(cntst){
          let startingMessage = await message.channel.send("Calculating, this might take a while...")

          if (contests[words[2]].channel == '0') {
            message.channel.send('This contest is being judged right now. Wait for the results!')
          }
          let top = await getTopEntries(contests[words[2]], parseInt(words[1]), client)
          var amount = Math.min(parseInt(words[1]), Object.values(contests[words[2]].entries).length)

          startingMessage.delete()
          for (var i = 0; i < amount; i++) {
            const e = top[i]
            const msg =  await getMsgByID(e.message, cntst.channel, client)

            var text = ""
            if (message.channel.id == '557973955378675742') {
              
              text = "** RATING:" + await getRating(msg, e.author) + "**   Creator: " + await client.fetchUser(e.author)
            } else {
              text = "** RATING:" + await getRating(msg, e.author) + "**"
            }
            const embed = new RichEmbed().setTitle("ENTRY #" + (i + 1).toString()).setDescription(text).setColor(0xFF0000).setImage(e.content);

            await message.channel.send(embed);

          }
        }

        send(contests[words[2]])
    }
}