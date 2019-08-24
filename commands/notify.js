

module.exports = {
    name: ['notify'],
    type: 'all',
    help: '``!notify`` Toggles your notification role',
    execute(client, message, words) {
        const toggle = async function () {
            message.delete(1000)
            let member = gdmc.members.find(m => m.user == message.author)
            if (await member.roles.find(role => role.id === "570494934600384512")) {
                member.removeRole("570494934600384512")
                message.author.send("You now don't have the notification role!")
                return
            }
            member.addRole("570494934600384512")
            message.author.send("You now have the notification role!")
        }
        toggle()
    }
}