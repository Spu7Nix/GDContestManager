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
    name: ['view', 'v'],
    type: 'all',
    help: '``!view [contest name] [entryID]`` Sends the entry and its rating to the chat. Useful if you want to discuss an entry.',
    execute(client, message, words) {

        

        let contests = JSON.parse(fs.readFileSync('contests.json'))
        if (words.length < 3) {
            message.channel.send("The format for this command is: !view [contest name] [entryID]");
            return
        }
        if (!contests.hasOwnProperty(words[1])) {
            message.channel.send("There is no contest right now named \"" + words[1] + "\"");
            return
        }
        if (!contests[words[1]].entries.hasOwnProperty(words[2])) {
            message.channel.send("There is no entry in this contest with an ID of \"" + words[2] + "\"");
            return
        }


        const send = async function (cntst) {
            let startingMessage = await message.channel.send("Calculating...")

            const e = cntst.entries[words[2]]
            let msg
            try {
                msg = await getMsgByID(e.message, cntst.channel, client)
            } catch (error) {
                message.channel.send('Couldn\'t find message!');
                startingMessage.delete()
            }
            

            var text = ""
            
            if (message.channel.id == '557973955378675742') {
                text = "** RATING: " + await getRating(msg, e.author) + "**   Creator: " + await client.fetchUser(e.author)
            } else {
                text = "** RATING: " + await getRating(msg, e.author) + "**"
            }
            const embed = new RichEmbed().setTitle("ENTRY ID: " + cntst.name + " " + words[2]).setDescription(text).setColor(0xFFFF00).setImage(e.content);
            
            message.channel.send(embed);
            startingMessage.delete()
            


        }

        send(contests[words[1]])
    }
}