const discord = require('discord.js')

const {
  Client
} = discord;

const fs = require('fs')


const client = new Client();
const token = fs.readFileSync('token.txt')

//user ids of all managers
global.ownerID = ['197820335377219584', '205782690912272385']

//rating emojies (1, 2, 3, 4 , 5)
global.ratings = ["\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3"]

//command system
client.commands = new discord.Collection()
global.commandList = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  for (const n of command.name) {
    client.commands.set(n, command);
  }
  let names = command.name
  let string = names[0]

  if (names.length > 1) {
    names.shift()
    string += ` *(${names.join(', ')})*`
  }


  global.commandList.push(string)
}

console.log(`Loaded ${commandFiles.length} commands and ${client.commands.array().length} aliases!`)


//const ratings = ["579368037761810442", "579368037111693312", "579368036528816158", "579368037682249728", "579368036809834517"]
global.ranks = JSON.parse(fs.readFileSync('ranks.json'))

let gdmc

client.on('ready', () => {
  global.gdmc = client.guilds.array()[0]
  gdmc = global.gdmc
  global.judgerole = gdmc.roles.find(role => role.name === "JUDGE")

  for (let i = 0; i < global.ranks.length; i++) {
    global.ranks[i].role = gdmc.roles.find(role => role.name === global.ranks[i].name)
  }



  console.log('online!')

})

const prefix = '!'
client.on('message', message => {
  if (message.channel.id == '605735820044795904') {


    message.react(client.emojis.get('579368036809834517')).then(() => {
      message.react(client.emojis.get('579368037761810442'))
    })




    return
  }
  let content
  if (message.content[0] == prefix) {
    content = message.content
  } else {
    content = specialCase(message)
  }

  if (content[0] != prefix) return

  let words = tokenize(content)

  if (message.attachments.size > 0){
    const attachments = message.attachments.array()
    for (a of attachments){
      words.push(a.url)
    }
  }

  //other commands
  let cmd = client.commands.get(words[0].slice(1))
  if (cmd) {
    console.log(message.author.username + " (" + message.channel.type + ") " + ": " + message.content)

    if (cmd.type == 'dm' && message.channel.type != 'dm' && !global.ownerID.includes(message.author.id)) {
      message.channel.send('This is a DM command. Send the command in a dm to me (this bot)')
      return
    }

    if (cmd.type == 'restricted' && message.channel.id == '557577154787803137') {
      message.channel.send('Don\'t use this here, use the <#591660943348465794> channel instead.')
      return
    }

    if (cmd.type == 'manager' && !global.ownerID.includes(message.author.id)) return
    try {
      cmd.execute(client, message, words)
    } catch (error) {
      message.channel.send("**ERROR: **" + error).then(msg => msg.delete(10000))
      console.log("**ERROR: **" + error)
    }
  }

})

client.on('guildMemberAdd', member => {
  try {
    member.user.send(`Welcome to GDMC, ${member}! \n Write \`\`!notify\`\` in any chat to recieve notificaltions on new contests and results! \n Watch this video for an introduction: https://youtu.be/JQ8I6SLzVB4`);
    console.log(`${member.user.username} has joined`);
  } catch (error) {
    member.user.send(`Welcome to GDMC, ${member}! Watch this video for an introduction: https://youtu.be/JQ8I6SLzVB4`);
  }

});

function specialCase(message) {
  let words = message.content.split(" ")
  if (message.channel.type == 'dm' && (client.commands.get(words[1]))) {
    let newCommand = `!${words[1]} ${words[0]} `
    if (words.length > 2) {
      newCommand += words[2]
    }
    return (newCommand)
  }
  return (message.content)
}

function tokenize(str) {
  var tokens = []
  var current = ""
  var bracketLayers = 0
  for (let c of str) {

    if (c == " " && bracketLayers == 0) {

      tokens.push(current.toLowerCase())
      current = ""

    } else if (c == "(") {
      if (bracketLayers > 0) {
        current += c
      }
      bracketLayers++

    } else if (c == ")") {
      bracketLayers--
      if (bracketLayers > 0) {
        current += c
      }
    } else {
      current += c
    }
  }

  tokens.push(current)
  return (tokens)
}

client.on('error', console.error);
client.login(token)




const updateFunc = async function () {
  //check timers
  let contests = Object.entries(JSON.parse(fs.readFileSync('contests.json')))

  for (const c of contests) {
    if (!c[1].hasOwnProperty('deadline')) continue

    let date = new Date()
    let currentTime = date.getTime() / 1000
    if (currentTime > c[1].deadline && c[1].open) {
      //judge
      let judgeCommand = client.commands.get('judge')
      try {
        judgeCommand.execute(client, {
          content: "!judge " + c[0]
        }, ['!judge', c[0]])
      } catch (error) {
        console.log(error)
      }
      
      console.log('ended contest: ' + c[0])
    }

  }

  // back up

  let data_ = fs.readFileSync('data.json')
  let contests_ = fs.readFileSync('contests.json')
  fs.writeFile('./backups/data-backup.json', data_, (err) => {
    if (err) console.log(err)
  })
  fs.writeFile('./backups/contests-backup.json', contests_, (err) => {
    if (err) console.log(err)
  })

  //change entrychannel names
  contests_ = Object.values(JSON.parse(contests_))
  let channelsOpen = []
  for (let contest of contests_) {
    let channel = await client.channels.get(contest.channel)
    if ( channel ){
      if (contest.open && channel.name != contest.name + '-entries') {
        channel.setName(contest.name + '-entries')
        channelsOpen.push(channel.id)
      } else if (!contest.open && !channelsOpen.includes(channel.id)) {
  
        channel.setName('_')
      }
    }

    
  }

}

setInterval(updateFunc, 60000);