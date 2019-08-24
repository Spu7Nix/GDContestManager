const fs = require('fs')

const {
    RichEmbed
} = require('discord.js');

const {
    ratabalize,
    getRating,
    givePoints,
    getTopEntries,
    getMsgByID,
    updateLeaderboard
} = require('../globalFunctions.js')

const hiddenFields = [
    'color',
    'title',
    'like_message',
    'leaderboard_quote',
    'avatar',
    'image'
]

const defSettings = {
    ___likes: [],
    ___settings: {
        show_name: false,
        inline: false,
        avatar: true,
        title: true
    }
}

module.exports = {
    name: ['profile', 'p'],
    type: 'restricted',
    help:  `\`\`!profile [someones tag or name]\`\` View someones profile.
            \`\`!profile set ([field title in brackets]) ([text in brackets])\`\` Set a field in your profile to some value. If the field doesnt exist, a new field is made.
            \`\`!profile delete ([field title in brackets])\`\` deletes a field in your profile.
            \`\`!profile like [someones tag or name]\`\` likes a profile.
            \`\`!profile like\`\` likes the last viewed profile.
            \`\`!profile toggle [setting]\`\` toggles a setting.
            
            **Settings**:\`\` ${Object.keys(defSettings.___settings).join(', ')}\`\`
            **Hidden fields you can edit**:\`\` ${hiddenFields.join(', ')}\`\``,
    execute(client, message) {
        let data = JSON.parse(fs.readFileSync('data.json'))
        let profiles = data.profiles
        let words = tokenize(message.content)

        let allSettings = Object.keys(defSettings.___settings)

        const checkSetting = function(user, setting){
            let psettings = profiles[user.id].___settings
            let dsettings = defSettings.___settings
            if (psettings.hasOwnProperty(setting)){
                return(psettings[setting])
            } else {
                profiles[user.id].___settings[setting] = dsettings[setting]
                return(dsettings[setting])
            }
            
        }

        const viewProfile = function (user) {
            let targetProfile = user.id
            let username = user.username
            if (!profiles.hasOwnProperty(targetProfile)) {
                message.channel.send('This user has an empty profile.')
                return
            }

            data.last_opened[message.channel.id] = targetProfile


            let profile = profiles[targetProfile]

            if (!profile.hasOwnProperty('___settings')) {
                profiles[targetProfile].___settings = defSettings.___settings
            }
            let embed = new RichEmbed().setColor(profile.color || '#8c8c8c')
                
                .setFooter(profile.___likes.length + (profile.___likes.length == 1 ? ' like' : ' likes'))
            
            if (checkSetting(user, 'avatar')){
                embed.setThumbnail(profile.avatar || user.displayAvatarURL)
            }

            if (checkSetting(user, 'title')){
                embed.setTitle(profile.title ? `**${profile.title}**` : `**${username}'s profile**`)
            }

            if (checkSetting(user, 'show_name')) {
                embed.setAuthor(username, user.displayAvatarURL)
            }

            if (profile.hasOwnProperty('image')) {
                embed.setImage(profile.image)
            }
            for (let field of Object.entries(profile)) {
                if (!hiddenFields.includes(field[0]) && !field[0].startsWith('___')) {
                    embed.addField(`**${field[0]}**`, field[1], profile.___settings.inline)
                }
            }
            message.channel.send(embed)
        }
        const doAction = async function () {
            if (words.length == 1) {
                viewProfile(message.author)
            }

            if (words.length == 2 && words[1] != 'like') {
                if (words[1] == 'random' || words[1] == 'r') {

                    let member = false
                    const pUsers = Object.keys(data.profiles)
                    while (!member) {
                        let id = pUsers[getRandomInt(pUsers.length)]
                        member = await gdmc.members.find(m => m.user.id == id)
                    }

                    viewProfile(member.user)




                } else


                if (message.channel.type != 'dm' && message.mentions.members.array().length == 1) {
                    viewProfile(message.mentions.members.first().user)
                } else {
                    let member = gdmc.members.find(m => m.user.username.toLowerCase() == words[1].toLowerCase())

                    if (member) {
                        viewProfile(member.user)
                    } else {
                        message.channel.send(`There is no member with name "${words[1]}"`)
                        return
                    }

                }

            } else if (words[1] == 'set') {
                let tp = message.author.id
                if (!profiles.hasOwnProperty(tp)) {
                    profiles[tp] = defSettings
                }
                if (words.length < 4) {
                    message.channel.send('Wrong format, type ``!help profile``')
                    return
                }
                if (!profiles[tp].hasOwnProperty(words[2]) && Object.size(profiles[tp]) >= 20) {
                    message.channel.send('You cant have more than 20 fields.')
                    return
                }
                if (words[2].startsWith('___')) {
                    message.channel.send('Invalid field name.')
                    return
                }

                if (words[3].length > 200) {
                    message.channel.send('A field value cant be more than 200 characters')
                    return
                }
                profiles[tp][words[2]] = words[3]
                viewProfile(message.author)

            } else if (words[1] == 'delete' || words[1] == 'remove') {
                let tp = message.author.id
                if (!profiles.hasOwnProperty(tp)) {
                    message.channel.send('You dont have any fields in your profile.')
                    return
                }
                if (words.length < 3) {
                    message.channel.send('Wrong format, type ``!help profile``')
                    return
                }
                if (!profiles[tp].hasOwnProperty(words[2])) {
                    message.channel.send(`You have no field with the keyword ${words[2]}`)
                    return
                }

                if (words[2].startsWith('___')) {
                    message.channel.send('You cant delete this field.')
                    return
                }
                profiles[tp][words[2]] = null
                delete profiles[tp][words[2]]
                viewProfile(message.author)
            } else if (words[1] == 'like') {
                let tp
                let username
                if (words.length == 2){
                    if (!data.last_opened.hasOwnProperty(message.channel.id)) return
                    let id = data.last_opened[message.channel.id]
                    
                    let member = await gdmc.members.find(m => m.user.id == id)
                    
                    let user = member.user
                    tp = user.id
                    username = user.username
                } else {
                    if (message.mentions.members.array().length == 1) {
                        tp = message.mentions.members.first().user.id
                        username = message.mentions.members.first().user.username
                    } else {
                        let member = gdmc.members.find(m => m.user.username.toLowerCase() == words[2].toLowerCase())
                        if (member) {
                            tp = member.user.id
                            username = member.user.username
                        } else {
                            message.channel.send(`There is no member with name "${words[2]}"`)
                            return
                        }
    
                    }
                }
                
                if (!profiles.hasOwnProperty(tp)) {
                    message.channel.send('This user does not have a profile.')
                    return
                }
                
                if (profiles[tp].___likes.includes(message.author.id)) {
                    message.channel.send('You have already liked this profile!')
                    return
                }
                profiles[tp].___likes.push(message.author.id)
                if (profiles[tp].hasOwnProperty('like_message')) {
                    message.channel.send(`**${username} says:** ` + profiles[tp].like_message)
                } else {
                    message.channel.send(`You have liked ${username}'s profile!`)
                }

            } else if (words[1] == 'toggle') {
                let tp = message.author.id
                if (!profiles.hasOwnProperty(tp)) {
                    profiles[tp] = defSettings
                }
                if (!profiles[tp].hasOwnProperty('___settings')) {
                    profiles[tp].___settings = defSettings.___settings
                }
                if (words.length < 3) {
                    message.channel.send('Wrong format, type ``!help profile``')
                    return
                }
                if (!allSettings.includes(words[2]) || words[2].startsWith('___')) {
                    message.channel.send('This setting does not exist.')
                    return
                }
                if (!profiles[tp].___settings.hasOwnProperty(words[2])){
                    profiles[tp].___settings[words[2]] = defSettings.___settings[words[2]]
                }

                profiles[tp].___settings[words[2]] = !profiles[tp].___settings[words[2]]
                viewProfile(message.author)

            }

            data.profiles = profiles
            fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
                updateLeaderboard(client)
            })
        }
        doAction()


    }

}

Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
const separator = ',,'

function tokenize(str) {
    var tokens = []
    var current = ""
    var bracketLayers = 0

    for (let ci = 0; ci < str.length; ci++) {
        let c = str[ci]
        if (bracketMode = true) {
            if (c == " " && bracketLayers == 0) {

                tokens.push(current)
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
            if (current.endsWith(separator)) {

                current = current.substring(0, str.length - separator.length)
                tokens.push(current)
                let rest = str.substring(ci + 1, str.length);

                let args = rest.split(separator)
                tokens.pop()
                tokens = [...tokens, ...args]
                for (let i = 0; i < tokens.length; i++) {
                    tokens[i] = tokens[i].trim()
                }
                tokens = tokens.filter(el => el.trim() != '')

                return (tokens)
            }

        }

    }

    for (let i = 0; i < tokens.length; i++) {
        tokens[i] = tokens[i].trim()
    }

    tokens = tokens.filter(el => el.trim() != '')

    tokens.push(current)
    return (tokens)
}