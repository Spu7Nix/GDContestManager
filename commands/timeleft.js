const fs = require('fs')

const {
    RichEmbed
} = require('discord.js');



module.exports = {
    name: ['timeleft', 'tl'],
    type: 'all',
    help: '``!timeleft [contest name]`` Shows how much time there is left before the contest closes \n ``!timeleft all`` Shows the remaining time for all the currently open contests',
    execute(client, message, words) {
        let contests = JSON.parse(fs.readFileSync('contests.json'))
        if (!contests.hasOwnProperty(words[1]) && words[1] != 'all') {
            message.channel.send("There is no contest right now named \"" + words[1] + "\"");
            return
        }
        if(words[1] != 'all'){
            if (!contests[words[1]].hasOwnProperty("deadline")) {
                message.channel.send("This contest has no deadline!");
                return
            }
    
            if (!contests[words[1]].open) {
                message.channel.send("This contest has ended!");
                return
            }
        }
        
        const send = async function () {
            if (words[1] == 'all') {
                let count = 0
                let embed = new RichEmbed().setTitle('TIME LEFT FOR ALL CONTESTS').setColor('#e67393')
                for (let contest of Object.values(contests)) {
                    
                    if (!contest.hasOwnProperty("deadline")) {
                        continue
                    }

                    let deadline = contest.deadline
                    let currentDate = new Date();

                    let timeleft = deadline - (currentDate.getTime() / 1000)
                    if (timeleft < 1){
                        continue
                    }

                    embed.addField(contest.name, secondsToDhms(timeleft))
                    count++
                }
                if (count == 0){
                    message.channel.send(`There are no contests with deadlines right now!`)
                } else {
                    message.channel.send(embed)
                }

            } else {
                let deadline = contests[words[1]].deadline
                let currentDate = new Date();

                let timeleft = deadline - (currentDate.getTime() / 1000)
                if (timeleft < 1){
                    message.channel.send('This contest is already over!')
                    return
                }

                message.channel.send(secondsToDhms(timeleft))
            }

        }
        send()







    }
}

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}