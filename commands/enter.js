const fs = require('fs')
const {
    RichEmbed
} = require('discord.js');
const {
    ratabalize,
    givePoints,
    
  } = require('../globalFunctions.js')

const isImageUrl = require('is-image-url');

module.exports = {
    name: ['enter', 'join', 'e'],
    type: 'dm',
    help: '``[contest name] enter [link to your entry (image or gif)]`` Command to enter an entry to a contest, you can also just attach an image.',
    execute(client, message, words) {
        let ent = words[2]
        let contests = JSON.parse(fs.readFileSync('contests.json'))
        
        //Check if contest exists
        if (!contests.hasOwnProperty(words[1])) {
            message.author.send("There is no contest right now named \"" + words[1] + "\"")
            return
        }
        //check if contest is open
        const cname = words[1]
        if (!contests[cname].open) {
            message.author.send("Too late! \"" + words[1] + "\" is being judged. Results will be out soon!")
            return
        }
        let mega = false
        if (contests[cname].hasOwnProperty('type') && contests[cname].type == 'mega'){
            mega = true
        }
        
        //check if entry is image file or link
        if (!mega && words.length < 3 && message.attachments.size < 1) {
            message.author.send("Provide an image or a image link!")
            return
        } else if (!mega && message.attachments.size > 0) {
            ent = message.attachments.array()[0].url
        }

        //check if user is blocked
        let data = JSON.parse(fs.readFileSync('data.json'))
        if (data.blockedUsers.includes(message.author.id)) {
            message.author.send("Your name has been put on a list of blocked users. Contact SputNix if you think this is wrong.")
            return
        }

        //check if participant has reached the entry limit
        let amount = 0;
        let aID = message.author.id
        Object.values(contests[cname].entries).forEach(function (e) {
            if (e.author == aID) {
                amount++
            }
        });

        if (amount >= 3) {
            message.author.send("You have reached the maximum of 3 entries in one contest. Delete one of your entries, or join another contest!")
            return
        }

        //check if entry is a valid image
        if (!mega && !isImageUrl(ent)) {
            message.author.send("Enter with an image or a gif!")
            return
        }


        let author = message.author
        const allIDs = Object.keys(contests[cname].entries)

        for (let i = 0; i < allIDs.length; i++) {
            allIDs[i] = parseInt(allIDs[i])
        }
        let i = 0
        while (allIDs.includes(i)) {
            i++
        }
        let entryID = i.toString()
        message.author.send("Thank you for your entry! Your entry's ID is " + entryID)
        try {
          givePoints(message.author, 1, client)  
        } catch (error) {
            message.channel.send('Something went wrong when trying to give you your point!')
            console.log(error)
        }
        

        const embed = new RichEmbed().setTitle("**NEW ENTRY!**").setColor(0xFFFF00).setImage(ent).setFooter('EntryID: ' + entryID);

        client.channels.get(contests[cname].channel).send(embed).then(async function (message) {
            contests[cname].entries[entryID] = {
                'message': message.id,
                'author': author.id,
                'content': ent,
                'id': entryID
            }
            fs.writeFile('contests.json', JSON.stringify(contests, null, 2), (err) => {
                //console.log('Entered entry')
            })

            ratabalize(message)
        }).catch(function (err) {
            console.log("problem sending entry")
        })
    }
}

