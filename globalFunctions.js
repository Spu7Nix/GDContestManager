const {
    
    RichEmbed
} = require('discord.js');
const fs = require('fs')

const ratings = global.ratings
module.exports = {
    ratabalize: async function (message) {
        for (let i = 0; i < ratings.length; i++) {
            await message.react(ratings[i])
        }
    },
    getRating: async function (message, creator) {
        //let rating = 0
        //let count = 0
        if (!message){
            return 0
        }
        let reactions = message.reactions.array()
        
        let ratingsObj = {}
        for (let i = 0; i < ratings.length; i++) {
            let r = reactions[i]
            let usersColection = await r.fetchUsers()
            let users = usersColection.array()

            for(let u of users){
                if(u.id != "557576307513491468"){
                    if (creator && u.id == creator){
                        continue
                    }
                    if (ratingsObj[u.id]){
                        ratingsObj[u.id].rating += i + 1
                        ratingsObj[u.id].count += 1
                    } else {
                        ratingsObj[u.id] = {
                            rating: i + 1,
                            count: 1
                        }
                    }
                }
            }
        }
        
        ratingsObj = Object.values(ratingsObj)
        let rating = 0
        for (let i = 0; i < ratingsObj.length; i++) {
            rating += ratingsObj[i].rating / ratingsObj[i].count
        }
        
        return (Math.floor((rating / ratingsObj.length) * 100) / 100)
    },
    givePoints: function (author, amount, client) {
        let data = JSON.parse(fs.readFileSync('data.json'))
        let mRank
        let member = global.gdmc.members.find(m => m.user == author)

        for (let rank of global.ranks) {
            if (member.roles.find(role => role === rank.role)) {
                mRank = rank
                break
            }
        }

        let currentPoints = parseInt(data.points[author.id])
        if (!currentPoints) {
            currentPoints = 0
        }

        data.points[author.id] = currentPoints + amount

        let msg;
        if (amount > 0) {
            msg = "You have earned " + amount.toString() + " point"
        } else {
            msg = "You lost " + Math.abs(amount).toString() + " point"
        }
        if (Math.abs(amount) > 1) {
            msg = msg + "s"
        }
        msg = msg + "!"
        msg = msg + " You now have " + data.points[author.id] + " point"
        if (Math.abs(data.points[author.id]) > 1) {
            msg = msg + "s"
        }
        msg = msg + "!"
        author.send(msg)

        for (let i = 0; i < global.ranks.length; i++) {
            //console.log(data.points[author.id] + " < " + global.ranks[i].req)
            if (data.points[author.id] < global.ranks[i].req) {
                if (i == 0 && mRank) {
                    member.removeRole(mRank.role.id)
                    author.send("**You have lost your rank!**")
                } else if (global.ranks[i - 1] != mRank) {
                    let newrank = global.ranks[i - 1]
                    if (mRank) {
                        member.removeRole(mRank.role.id)
                    }
                    //console.log(global.ranks[i].role.id)
                    member.addRole(newrank.role.id)
                    if (mRank && mRank.req > newrank.req) {
                        author.send("**Your rank has dropped to " + newrank.name + "**")
                    } else {
                        author.send("**You have earned the " + newrank.name + " rank!**")
                    }


                }
                break
            }
        }
        fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
            module.exports.updateLeaderboard(client)
        })
    },
    getTopEntries: async function (cont, am, client) {
        let amount = Math.min(am, Object.values(cont.entries).length)
        let top = []
        let entList = Object.values(cont.entries)

        let cachedRatings = []
        const getCRating = function(index){
            return cachedRatings[index]
        }

        
        const cacheRating = async function(i){
            
            
                
            
            return module.exports.getRating(await module.exports.getMsgByID(entList[i].message, cont.channel, client), entList[i].author)
        }
 
        console.log("Getting top entries...")
        let start = new Date()
        
        //getting all scores at the same time
        for (let i = 0; i < entList.length; i++) {
            cachedRatings.push(cacheRating(i))
        }

        cachedRatings = await Promise.all(cachedRatings)

        
        for (let i = 0; i < amount; i++) {

            let topEnt = entList[0]
            let topMsg = await module.exports.getMsgByID(topEnt.message, cont.channel, client)
            let topIndex = 0

            for (let j = 0; j < entList.length; j++) {
                let thisMsg = undefined
                try {
                    thisMsg = await module.exports.getMsgByID(entList[j].message, cont.channel, client)
                } catch (error) {
                    console.log('One message could not be found in getTopEntries. ' + entList[j].id)
                }

                if (thisMsg && getCRating(j) > getCRating(topIndex)) {
                    topEnt = entList[j]
                    topMsg = thisMsg
                    topIndex = j
                }
            }
            entList.splice(topIndex, 1)
            cachedRatings.splice(topIndex, 1)
            top.push(topEnt)
        }
        let end = new Date()
        console.log(`Done in ${end.getTime() - start.getTime()} milliseconds!`)
        return (top)
    },
    getMsgByID: function (id, channel, client) {
        return client.channels.get(channel).fetchMessage(id)
    },
    updateLeaderboard: async function (client) {

        let lbmsg = await module.exports.getMsgByID("589846456916115459", "589841922621964303", client)
        let data__ = JSON.parse(fs.readFileSync('data.json'))
        let points = Object.entries(data__.points)
        let profiles = data__.profiles
    
        points.sort(function (a, b) {
            return a[1] - b[1];
        })
        points.reverse()
        let embed = new RichEmbed().setTitle("**LEADERBOARD: **").setColor('#dcff8c')
        
        
        for (let i = 0; i < 10; i++) {
            let person = await client.fetchUser(points[i][0])
            let fieldTitle = "**" + (i + 1).toString() + ":** " + person.username
            
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
                    rank = global.ranks[j - 1].role
                    break
                }
            }
    
            let fieldContent = "   **Points:** " + points[i][1] + ", **Rank:** " + rank.toString() + "  "
            if (profiles.hasOwnProperty(points[i][0]) && profiles[points[i][0]].hasOwnProperty('leaderboard_quote')){
                fieldContent += `*"${profiles[points[i][0]].leaderboard_quote.replace('*', '')}"*`
            }
            embed.addField(fieldTitle, fieldContent)
            embed.addBlankField()
        }
    
        lbmsg.edit(embed)
    }

}

