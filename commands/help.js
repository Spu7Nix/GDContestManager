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
    name: ['help', 'h'],
    type: 'all',
    help: 'this',
    execute(client, message, words) {
        if (words.length < 2){
            let embed = new RichEmbed().setTitle('**LIST OF COMMANDS:**')
            let desc = ''
            for(let command of global.commandList){
                
                desc += `!help ${command} \n`
                
            }
            embed.setDescription(desc)
            message.channel.send(embed)
            
            return
        }
        if (client.commands.get(words[1])) {
            let cmd = client.commands.get(words[1])
            const embed = new RichEmbed().setTitle('**COMMAND HELP**').addField('Aliases:', cmd.name.join(', ')).addField('Type:', cmd.type).addField('Description:', cmd.help)
            message.channel.send(embed)
            return
        }
        message.channel.send('No command with name: ' + words[1])
    }
}