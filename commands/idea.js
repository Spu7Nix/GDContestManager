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

const ideasChannel = '614528277905801220'
const isImageUrl = require('is-image-url');
module.exports = {
    name: ['idea', 'i'],
    type: 'dm',
    help: `\`\`!idea make\`\` to make a contest idea
           \`\`!idea remove [ideaID]\`\` to remove your idea`,
    execute(client, message, words) {
        switch (words[1]) {
            case 'make':
            case 'add':
            case 'create':

                (async () => {
                    await message.channel.send(`Ok, let's make a contest idea. Type \`\`cancel\`\` at any time to cancel.`)

                    let idea = {}
                    let ideaEmbed
                    let ideaDone = false
                    let properties = [{
                            name: 'name',
                            optional: false,
                            type: 'text',
                            desc: 'This is the name of the contest. Keep it short and easy to remember! Remember: it can only be one word. Use dashes instead of spaces.'
                        },
                        {
                            name: 'description',
                            optional: false,
                            type: 'text',
                            desc: 'This is what describes the theme and rules of the contest. Be precise!'
                        },
                        {
                            name: 'criteria',
                            optional: true,
                            type: 'text',
                            desc: 'This is what the contest\'s entries will be judged on. Separate the criteria with commas. Public opinion will be added automatically.',
                            default: 'Creativity, Execution'
                        },
                        {
                            name: 'example image',
                            optional: true,
                            type: 'image',
                            desc: 'This is an example image that makes the contest theme easier to understand.'
                        }
                    ]
                    let cp = 0
                    const sendDescriptor = async() => {
                        let p = properties[cp]
                        const embed = new RichEmbed().setTitle(`**Please send your contest's ${p.name}!**`)
                                                   .setDescription(p.desc)
                                                   .setColor('#74fcab')
                        await message.channel.send(embed)
                        if (p.optional) {
                            message.channel.send(`Type \`\`skip\`\` if you don't want to add this.`)
                        }

                    }

                    sendDescriptor()
                    //handle input
                    let filter = m => m.author.id == message.author.id
                    const input = message.channel.createMessageCollector(filter)


                    //handle canceling
                    filter = m => m.content.toLowerCase().trim() == 'cancel' && m.author.id == message.author.id
                    const cancelChecker = message.channel.createMessageCollector(filter, {
                        time: 600000
                    })
                    cancelChecker.on('collect', m => {
                        cancelChecker.stop()
                        input.stop()
                        message.channel.send('Idea canceled.')
                    });


                    //handle input part 2
                    input.on('collect', async (m) => {

                        if (m.content.toLowerCase().trim() == 'cancel') return
                        //submiting idea
                        if (ideaDone && m.content.toLowerCase().trim() == 'ok') {

                            input.stop()
                            cancelChecker.stop()

                            let data = JSON.parse(fs.readFileSync('data.json'))
                            let i = 0
                            while (data.ideas.hasOwnProperty(i)) {
                                i++
                            }
                            let ideaID = i.toString()
                            ideaEmbed.setFooter(`IdeaID: ${ideaID}`)

                            const msg = await client.channels.get(ideasChannel).send(ideaEmbed)

                            msg.react(client.emojis.get('579368036809834517')).then(() => {
                                msg.react(client.emojis.get('579368037761810442'))
                            })

                            idea.message = msg.id
                            idea.author = message.author.id
                            data.ideas[ideaID] = idea
                            fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {})

                            message.channel.send(`Thanks for submiting your idea! Your idea's ID is ${ideaID}`)
                            return
                        }



                        if (m.content.toLowerCase().trim() == 'skip') {
                            if (properties[cp].optional) {
                                if (properties[cp].hasOwnProperty('default')) {
                                    idea[properties[cp].name] = properties[cp].default
                                }
                            } else {
                                message.channel.send('This is mandatory.')
                                return
                            }

                        } else {
                            if (m.attachments.size > 0) {
                                idea[properties[cp].name] = m.attachments.array()[0].url

                            } else {
                                if (properties[cp].type == 'image') {
                                    if (isImageUrl(m.content)) {
                                        idea[properties[cp].name] = m.content
                                    } else {
                                        message.channel.send('Please send an image or a link to an image!')
                                        return
                                    }
                                } else {
                                    idea[properties[cp].name] = m.content
                                }
                            }
                        }



                        message.channel.send('Thank you!')
                        cp++
                        if (cp >= properties.length) {
                            //validate and finish idea
                            ideaDone = true
                            ideaEmbed = new RichEmbed().setTitle(`**CONTEST IDEA!**`)
                                .addField('**Name: **', idea.name, true)
                                .addField('**Theme: **', idea.description, true)
                                .addField('**Entries will be judged on: **', idea.criteria, true)
                                .setColor(0x00FFFF);
                            if (idea['example image']) {
                                ideaEmbed.setImage(idea['example image'])
                            }

                            await message.channel.send(ideaEmbed)
                            message.channel.send('Write ``ok`` to submit. If you want to cancel, write ``cancel``.')
                        } else {
                            sendDescriptor()
                        }
                    });



                })()

                break

            case 'remove':
            case 'delete':
                let data = JSON.parse(fs.readFileSync('data.json'))
                const ideas = data.ideas

                if (words.length < 3) {
                    message.channel.send('Include your IdeaID')
                    return
                }

                if (!ideas.hasOwnProperty(words[2])) {
                    message.channel.send(`There is no idea with ID "${words[2]}"`)
                    return
                }

                if (ideas[words[2]].author != message.author.id && !global.ownerID.includes(message.author.id)) {
                    message.channel.send(`You can only remove your own idea.`)
                    return
                }

                (async () => {
                    const msg = await getMsgByID(ideas[words[2]].message, ideasChannel, client)
                    await msg.delete()
                })()


                delete data.ideas[words[2]]
                fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
                    message.channel.send("Idea deleted.")
                })

                break

            default:
                message.channel.send('Type ``!idea make`` to submit a contest idea')
                break
        }

    }

}