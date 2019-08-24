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
  name: ['eval'],
  type: 'manager',
  help: '``!delete (code in brackets)``',
  execute(client, message, words) {
    if (message.author.id != '197820335377219584'){
      message.channel.send('only lord sput can do this')
      return
    }
    try {
      eval(words[1])
    } catch (error) {
      message.channel.send(`**ERROR: **${error}`)
    }
    
  }
}