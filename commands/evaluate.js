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
const judgingChannel = "559421975437508634"

module.exports = {
  name: ['evaluate'],
  type: 'manager',
  help: '``!evaluate [contest name]`` will end and delete a contest and return a .json file of the judged entries',
  execute(client, message, words) {
    let contests = JSON.parse(fs.readFileSync('contests.json'))
    const c = words[1]
    if (words.length < 2) {
      message.channel.send("Provide the contest.");
      return
    }
    if (!contests.hasOwnProperty(c)) {
      message.channel.send("There is no contest with the name \"" + c + "\"");
      return
    }
    if (contests[c].open) {
      message.channel.send("This contest hasnt been judged yet, send \"!judge " + c + "\" instead.");
      return
    }
    let amount = 10
    if (words.length > 2) {
      amount = parseInt(words[2])
    }
    const judgings = contests[c].judgings
    let se = []

    const calculate = async function (judging) {
      if (judging == null) {

        return
      }
      let j = judging

      const user = await client.fetchUser(j.author)
      j.name = user.username



      //console.log(user.username)
      for (const crit of contests[c].criteria) {
        j.messages[crit] = await getRating(await getMsgByID(j.messages[crit], judgingChannel, client), j.author)
      }
      j.messages['public opinion'] = j.score
      j.score = null
      se.push(j)
    }
    const rest = async function (judging) {
      for (let j of judgings) {
        await calculate(j)
      }
      await se.sort((a, b) => {
        return arrAvg(Object.values(b.messages)) - arrAvg(Object.values(a.messages))
      })

      for (let i = 0; i < 5; i++) {
        contests[c].top5.push(se[i])
      }

      fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
          if (err) {
              console.log('problem with writing data file')
          }
      })

      fs.writeFile('results_' + c + '.json', JSON.stringify({
        'name': contests[c].name,
        'description': contests[c].info.desc,
        'entries': se
      }, null, 2), (err) => {

      });
      await message.channel.send("Here is the results file!", {
        files: ['./results_' + c + '.json']
      })
      fs.unlink('./results_' + c + '.json', (err) => {});
      contests = JSON.parse(fs.readFileSync('contests.json'))
      //end contest
      //contests[c] = null
      //delete contests[c]
      fs.writeFile('contests.json', JSON.stringify(contests, null, 2), (err) => {
        //console.log(contests)
      })
    }
    rest()



  }
}

function arrAvg(arr){

  var sum = 0;
  for( var i = 0; i < arr.length; i++ ){
      sum += arr[i];
  }

  return(sum/arr.length);
}
