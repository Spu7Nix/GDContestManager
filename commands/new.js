const fs = require('fs')
const isImageUrl = require('is-image-url');

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
const contestsChannel = "569591968221495306"
module.exports = {
    name: ['new'],
    type: 'manager',
    help: '``!new [contest name] ([contest description in brackets]) ([list of criteria in brackets separated by spaces or commas]) [link to example image?] `` will start a new contest.',
    execute(client, message, words) {
        var entryChannel = "none"
        var ecn = -1
        let data = JSON.parse(fs.readFileSync('data.json'))

        console.log(words)

        for (var i = 0; i < data.entryChannels.length; i++) {
            if (!data.entryChannels[i].occupied) {
                entryChannel = data.entryChannels[i].id
                ecn = i
                break
            }
        }


        if (entryChannel == 'none' || ecn == -1) {
            message.channel.send("All entrychannels are occupied right now right now!");
            return
        }

        if (words.length < 4) {
            message.channel.send("Wrong command format!");
            return
        }
        if (words.length > 4 && !isImageUrl(words[4])) {
            message.channel.send("\"" + words[4] + "\" is not an image!");
            return
        }


        let contests = JSON.parse(fs.readFileSync('contests.json'))

        const name = words[1]
        if (contests.hasOwnProperty(name)) {
            message.channel.send("There is already an ongoing contest with this name!");
            return
        }

        const desc = words[2]
        const criteria = words[3].split(', ')
        const image = words[4]
        const date = new Date()
        const deadline = Math.floor(date.getTime() / 1000 + 86400 * 4)
        contests[name] = {
            'deadline': deadline,
            'channel': entryChannel,
            'name': name,
            'info': {
                'desc': desc,
                'image': image
            },
            'entries': {},
            'open': true,
            'criteria': criteria
        }
        fs.writeFile('contests.json', JSON.stringify(contests, null, 2), (err) => {
            if (err) {
                "problem writing contest file"
            }
        })


        data.entryChannels[ecn].occupied = true
        fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.log('problem with writing data file')
            }
        })

        //const embed = new RichEmbed().setTitle('**NEW CONTEST!**').setDescription('**Name: **' + name + '\n' + '**Entries: ** ' + client.channels.get(entryChannel) + '\n' + '**Theme: **' + desc).setColor(0x00FFFF).setImage(image);
        const embed = new RichEmbed().setTitle(`**NEW CONTEST!**`)
            .addField('**Name: **', name, true)
            .addField('**Entries: ** ', client.channels.get(entryChannel), true)
            .addField('**Theme: **', desc, true)
            .addField('**Entries will be judged on: **', words[3], true)
            .addField('**Deadline: **', '4 days from when this message was posted', true)
            .setColor(0x00FFFF);

        if (words.length > 4) {
            embed.setImage(image)
        }
        const send = async function () {
            const notirole = await global.gdmc.roles.find(role => role.name === "notification")
            await notirole.edit({ mentionable: true }, "Temporarily enable mentionability to ping subscribed users");
            let ch = client.channels.get(contestsChannel);
            await ch.send(`${notirole}`);
            ch.send(embed);
            notirole.edit({ mentionable: false }, "Disable mentionability because fuck raiders");
        }
        send()
        client.channels.get(entryChannel).send("**Entries for the new contest \"" + name + "\" will appear here!**");
    }
}
