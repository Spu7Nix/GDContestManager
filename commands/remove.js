const fs = require('fs')


const {
    givePoints,
    getMsgByID
} = require('../globalFunctions.js')

module.exports = {
    name: ['remove', 'r'],
    type: 'dm',
    help: '``[contest name] remove [entryID]`` Command to remove an entry from a contest (only works with your own entries of course)',
    execute(client, message, words) {
        let ent = words[2]
        let contests = JSON.parse(fs.readFileSync('contests.json'))
        if (contests.hasOwnProperty(words[1])) {
            const cname = words[1]
            if (!contests[cname].open) {
                message.author.send("Too late! \"" + words[1] + "\" is being judged. Results will be out soon! (Message SputNix if you dont want your entry in the results)")
            }
            if (!contests[cname].entries.hasOwnProperty(ent)) {
                message.author.send("No entry with that id")
                return
            }
            e = contests[cname].entries[ent]
            if (message.author.id != e.author) {
                message.author.send("You can only remove your own entry.")
                return
            }
            const remove = async function () {
                const msg = await getMsgByID(e.message, contests[cname].channel, client)
                //console.log(msg)
                await msg.delete()
            }
            remove()

            delete contests[cname].entries[ent]
            fs.writeFile('contests.json', JSON.stringify(contests, null, 2), (err) => {
                //console.log('Removed entry')
                message.author.send("Entry deleted.")
                givePoints(message.author, -1, message.client)
            })

        } else {
            message.author.send("There is no contest right now named \"" + words[1] + "\"")
        }
    }
}