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
    name: ['myposition', 'mp', 'mypos'],
    type: 'all',
    help: '``!myposition`` Shows your points, your rank and your position on the leaderboard',
    execute(client, message, words) {
        const send = async function () {
            let data = JSON.parse(fs.readFileSync('data.json')).points
            if (!data.hasOwnProperty(message.author.id)) {
                message.channel.send("You haven't gotten any points yet!")
                return
            }
            let points = Object.entries(data)

            points.sort(function (a, b) {
                return a[1] - b[1];
            })
            points.reverse()

            let pos
            for (let i = 0; i < points.length; i++){
                if ( points[i][0] == message.author.id){
                    pos = i
                    break
                }
            }

            let embed = new RichEmbed().setColor('#dcff8c')
            

            for (let i = pos - 1; i < pos + 2; i++) {
                if (i > points.length - 1 || i < 0) continue
                let person = await client.fetchUser(points[i][0])
                let fieldTitle = "*" + (i + 1).toString() + ": " + person.username + "*"
                if (i == pos){
                    fieldTitle = "**" + (i + 1).toString() + ": " + person.username + "**"
                }
                
                if (i == 0) {
                    fieldTitle += " 🥇"
                } else if (i == 1) {
                    fieldTitle += " 🥈"
                } else if (i == 2) {
                    fieldTitle += " 🥉"
                }
        
                
        
                let rank
                for (let j = 0; j < global.ranks.length; j++) {
                    //console.log(points[i][1] + " < " + global.ranks[i].req)
                    if (points[i][1] < global.ranks[j].req) {
                        if (j != 0){
                            rank = global.ranks[j - 1].role
                        } else {
                            rank = 'none'
                        }
                        
                        break
                    }
                }
        
                let fieldContent = "   **Points:** " + points[i][1] + ", **Rank:** " + rank.toString() + "  "
                
                embed.addField(fieldTitle, fieldContent)
                if (i < pos + 1){
                    embed.addBlankField()
                }
            }

            message.channel.send(embed)
        }
        send()
    }

}