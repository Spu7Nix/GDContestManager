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
  name: ['delete'],
  type: 'manager',
  help: '``!delete [contest name] [entryID] ([reason in brackets])`` removes an entry, do this instead of deleting the message, as that will not delete the entry from the contest itself',
  execute(client, message, words) {
    let contests = JSON.parse(fs.readFileSync('contests.json'))
    const c = words[1]
    if (words.length < 4) {
      message.channel.send("Provide the contest and the id and the reason for removal (!remove contestExample 10 (nsfw content))");
      return
    }
    if (!contests.hasOwnProperty(c)) {
      message.channel.send("There is no contest with the name \"" + c + "\"");
      return
    }
    if (!contests[c].entries.hasOwnProperty(words[2])) {
      message.channel.send("There is no entry with the id \"" + words[2] + "\"");
      return
    }
    const delt = async function () {

      const user = await client.fetchUser(contests[c].entries[words[2]].author)
      user.send("Your entry for the " + c + " contest was removed by a manager. Reason: " + words[3])
      const message = await getMsgByID(contests[c].entries[words[2]].message, contests[c].channel, client)
      await message.delete()
      contests[c].entries[words[2]] = null
      delete contests[c].entries[words[2]]

      fs.writeFile('contests.json', JSON.stringify(contests, null, 2), (err) => {
        //console.log(contests)
      })
    }
    delt()

  }
}