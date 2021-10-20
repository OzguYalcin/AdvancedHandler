let second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24,
    week = day * 7,
    month = week * 4,
    year = month * 12;
const permissions = require('./permissions');
const ms = require('ms')
const registerCommand = (filePath, fileName, instance, disableCommands) => {

    const command = require(filePath);
    if (!command.name) command.name = fileName
    let commandName = command.name;

    let callbackCounter = 0;
    if (command.callback) callbackCounter++
    if (command.execute) callbackCounter++
    if (command.run) callbackCounter++

    if (callbackCounter === 0) throw new TypeError('Commands must have "callback", "execute" or "run" functions, but not multiple.');

    if (callbackCounter > 1) throw new TypeError('Commands can have "callback", "execute", or "run" functions, but not multiple.');

    if (!command.name && instance.showWarns) {
        console.warn("AdvancedHandler > \"" + filePath + "\" Command have no name. Name set to \"" + fileName + "\".")
    };

    let cooldownCounter = 0;
    if (command.cooldown) cooldownCounter++;
    if (command.userCooldown) cooldownCounter++;
    if (command.globalCooldown) cooldownCounter++

    if (cooldownCounter > 1) throw new TypeError(`${commandName} command must not have multiple cooldown types.`)

    let cooldown = command.cooldown,
        userCooldown = command.userCooldown,
        globalCooldown = command.globalCooldown;

    if ((cooldown || userCooldown || globalCooldown)) {
        checkCooldown((cooldown || userCooldown || globalCooldown), fileName)
    }

    const requiredPermissions = command.requiredPermissions || command.permissions;
    if (requiredPermissions && typeof requiredPermissions === 'object') {

        for (let i = 0; i < requiredPermissions.length; i++) {
            const permission = requiredPermissions[i];

            if (!permissions.includes(permission)) throw new TypeError("Command located at \"" + filePath + "\" has an invalid permission: \"" + permission + "\". Permissions must be all upper case.");


        }

    } else if (requiredPermissions && typeof requiredPermissions === 'string') {
        const permission = requiredPermissions;
        if (!permissions.includes(permission)) throw new TypeError("Command located at \"" + filePath + "\" has an invalid permission: \"" + permission + "\". Permissions must be all upper case.");
    }


    if (command.maxArgs && !command.expectedArgs) {
        throw new TypeError("Command located at \"" + filePath + "\" if have maxArgs must have expectedArgs")
    } else if (command.minArgs && !command.expectedArgs) {
        throw new TypeError("Command located at \"" + filePath + "\" if have minArgs must have expectedArgs")

    }

    let missing = [];

    if (!command.category) missing.push("Category");

    if (!command.description) missing.push("Description");
    if (missing.length >= 1 && instance.showWarns) console.warn("AdvancedHandler > Command \"" + commandName + "\" does not have the following properties: " + missing + ".");

    if (command.testOnly && !instance.testServers) console.warn("AdvancedHandler > Command \"" + commandName + "\" has \"testOnly\" set to true, but no test servers are defined.")

    if (command.ownerOnly && !instance.botOwners) {
        if (commandName === 'blacklist') {
            return
        }
        console.warn("AdvancedHandler > Command \"" + commandName + "\" has \"ownerOnly\" set to true, but no bot owners are defined.")
    }

    if ((command.init && typeof command.init === 'function')) {
        command.init({
            client: instance.client,
            instance
        })
    }

    return instance.commands.set(commandName, command)

}
function checkCooldown(cooldown, fileName) {
    if (cooldown.endsWith("s")) {
        if (ms(cooldown) > minute) throw new TypeError(`Invalid duration type in "${fileName}" file.`)
        else if (ms(cooldown) < second) throw new TypeError(`Invalid duration type in "${fileName}" file.`)
    } else if (cooldown.endsWith("m")) {
        if (ms(cooldown) > hour) throw new TypeError(`Invalid duration type in "${fileName}" file.`)
        else if (ms(cooldown) < minute) throw new TypeError(`Invalid duration type in "${fileName}" file.`)
    } else if (cooldown.endsWith("h")) {
        if (ms(cooldown) > day) throw new TypeError(`Invalid duration type in "${fileName}" file.`)
        else if (ms(cooldown) < hour) throw new TypeError(`Invalid duration type in "${fileName}" file.`)
    } else if (cooldown.endsWith("d")) {
        if (ms(cooldown) > year) throw new TypeError(`Invalid duration type in "${fileName}" file.`)
        else if (ms(cooldown) < day) throw new TypeError(`Invalid duration type in "${fileName}" file.`)
    }
    return false;
}
module.exports = registerCommand;