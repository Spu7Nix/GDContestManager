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
  name: ['judge'],
  type: 'manager',
  help: '``!judge [contest name] [amount?]`` will close a contest and it will send the top [amount] entries to be judged',
  execute(client, message, words) {
    const judgerole = global.judgerole
    let contests = JSON.parse(fs.readFileSync('contests.json'))
    let data = JSON.parse(fs.readFileSync('data.json'))
    const c = words[1]

    if (!contests.hasOwnProperty(c)) {
      message.channel.send("There is no contest with the name \"" + c + "\"");
      return
    }

    contests[c].open = false
    contests[c].channel = '0'
    for(let i = 0; i < data.entryChannels.length; i++){
      if (data.entryChannels[i].id == contests[c].channel){
        data.entryChannels[i].occupied = false
        break
      }
    }
    fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
      //console.log('closed entrychannel')
    })

    client.channels.get(contests[c].channel).send("**\"" + c + "\" is now closed. Results coming soon.**")
    

    //send messages in judging channels
    let amount
    if (words.length < 3) {
      amount = 15
    } else {
      amount = parseInt(words[2])
    }
    const send = async function () {
      let entries = await getTopEntries(contests[c], amount, client)
      const channel = await client.channels.get("559421975437508634")
      //let taggedrole = client.roles.find(role => role.name === "JUDGE")
      await judgerole.setMentionable(true)
      await channel.send(`${judgerole} **Time to judge "${contests[c].name}"!** `) //${judgerole}
      judgerole.setMentionable(false)
      const ea = Array.from(entries)

      contests[c].judgings = []

      for (e of ea) {
        const index = parseInt(e.id)

        try {
          let msg = await getMsgByID(e.message, contests[c].channel, client)
        } catch (error) {
          message.channel.send('One message could not be found. ' + e.content)
          continue
        }
        contests[c].judgings[index] = {
          content: e.content,
          author: e.author,
          score: await getRating(await getMsgByID(e.message, contests[c].channel, client), e.author),
          messages: {}
        }
        const embed = new RichEmbed().setTitle("**JUDGE THIS ENTRY!**").setColor(0xFFFF00).setImage(e.content)

        await channel.send(embed)

        for (const crit of contests[c].criteria) {
          channel.send("**Rate this entry on its \"" + crit + "\"**").then(function (message) {

            contests[c].judgings[index].messages[crit] = message.id
            ratabalize(message)
            fs.writeFile('contests.json', JSON.stringify(contests, null, 2), (err) => {
              //nothing
            })
          }).catch(function (err) {
            console.log("problem sending judge message")
          })
        }
      }

    }
    send()




  }
}