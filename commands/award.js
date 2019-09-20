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
  help: `\`\`!award [usertag] [amount]\`\` gives or takes points from a user
         \`\`!award [contest name]\`\` awards the top 5 users based on the contest's results`,
  execute: async function(client, message, words) {
    let user
    if (words.length > 2) { // !award [usertag] [amount]
      let points = parseInt(words[2])
      if (!points) {
        points = parseInt(words[3])
      }
      getUser(words[1])
      givePoints(user, points, client)
    } else { // !award [contest name]
      let contests = JSON.parse(fs.readFileSync('contests.json'))
      const c = words[1]
      if (contests[c].open) {
        message.channel.send("This contest is still open, please try again when the contest is over.");
        return
      }
      if (contests[c].top5.length < 5) {
        message.channel.send("This contest does not have an evaluted top 5 list, please try again later.");
        return
      }

      const awardedPoints = [10, 7, 5, 3, 3]
      for (let i = 0; i < 5; i++) {
        getUser(contests[c].top5[i])
        givePoints(user, awardedPoints[i], client)
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
          let member2 = await client.fetchUser(words[1])
          if (member2) {user = (member2.user)} else {
            message.channel.send(`There is no member with id "${words[1]}"`)
            return
          }
        }
      }

      givePoints(user, points, client)
    }

    const getUser = async function (username) {
      if (message.mentions.members.first()) {
        console.log(message.mentions.members.first())
        user = message.mentions.members.first().user
      } else {
        let member = gdmc.members.find(m => m.user.username.toLowerCase() == username.toLowerCase())

        if (member) {
          user = (member.user)
        } else {
          let member2 = await client.fetchUser(username)
          if (member2) {user = (member2.user)} else {
            message.channel.send(`There is no member with id "${username}"`)
            return
          }
        }
      }
    }
  }
}
