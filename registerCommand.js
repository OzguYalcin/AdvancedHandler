
const permissions = require('./permissions');
const ms = require('ms')
const registerCommand = (filePath, fileName, instance, disableCommands) => {

    const command = require(filePath);
    if(!command.name) command.name = fileName
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
     if(command.cooldown) cooldownCounter++;
     if(command.userCooldown) cooldownCounter++;
     if(command.guildCooldown) cooldownCounter++

     if(cooldownCounter > 1) throw new TypeError(`${commandName} command must not have multiple cooldown types.`)

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


    let missing = [];

    if (!command.category) missing.push("Category");

    if (!command.description) missing.push("Description");
    if (missing.length >= 1 && instance.showWarns) console.warn("AdvancedHandler > Command \"" + commandName + "\" does not have the following properties: " + missing + ".");

    if (command.testOnly && !instance.testServers) console.warn("AdvancedHandler > Command \"" + commandName + "\" has \"testOnly\" set to true, but no test servers are defined.")

    if (command.ownersOnly && !instance.botOwners) console.warn("AdvancedHandler > Command \"" + commandName + "\" has \"ownersOnly\" set to true, but no bot owners are defined.")

    if (command.maxArgs && !command.expectedArgs) {
        throw new TypeError("Command located at \"" + filePath + "\" if have maxArgs must have expectedArgs")
    } else if (command.minArgs && !command.expectedArgs) {
        throw new TypeError("Command located at \"" + filePath + "\" if have minArgs must have expectedArgs")

    }   

    if(command.cooldown) {
        if(ms(command.cooldown) >= 0) throw new Error("Command cooldown can not be 0(h, s, d, m)")
    }

    if(command.userCooldown) {
        if(ms(command.userCooldown) >= 0) throw new Error("Command user cooldown can not be 0(h, s, d, m)")
    }

    if(command.guildCooldown) {
        if(ms(command.guildCooldown) >= 1000 * 60) throw new Error("Command guild cooldown  must be bigger then 1 minute!")

    }

    if (commandName && typeof commandName !== 'string') {
        throw new TypeError('Command name must be string!');
    } else if (commandName && typeof commandName === 'string') {
        instance.commands.set(commandName, command)
    }



}
module.exports = registerCommand;