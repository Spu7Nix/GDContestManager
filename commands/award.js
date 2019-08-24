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
  name: ['award'],
  type: 'manager',
  help: '``!award [usertag] [amount]`` gives or takes points from a user',
  execute(client, message, words) {
    let points = parseInt(words[2])
    if (!points) {
      points = parseInt(words[3])
    }
    let user
    if (message.mentions.members.first()) {
      console.log(message.mentions.members.first())
      user = message.mentions.members.first().user
    } else {
      let member = gdmc.members.find(m => m.user.username.toLowerCase() == words[1].toLowerCase())

      if (member) {
        user = (member.user)
      } else {
        let member2 = gdmc.members.find(m => m.user.id == words[1])
        if (member2) {user = (member2.user)} else {
          message.channel.send(`There is no member with id "${words[1]}"`)
          return
        }
      }
    }

    givePoints(user, points, client)

  }
}