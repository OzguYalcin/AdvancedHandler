const getAllFiles = require('./get-all-files');
const DiscordJS = require('discord.js');
const path = require('path');
const fs = require('fs');
const permissions = require('./permissions');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const ms = require('ms');
/**
* @param {any} client
* @param {Object} options
*/

class CommandHandler {

    constructor(client, options) {
        if (!client) throw new TypeError(`AdvancedHandler > No client specified`);
        if (!options.commandsDir) options.commandsDir = 'commands', console.warn(`AdvancedHandler > No commands directory specified. Using "commands".`);
        if (!options.defaultPrefix) options.defaultPrefix = '!', console.warn(`AdvancedHandler > No prefix specified. Using "!".`);
        if (!options.mongoURI) console.warn(`AdvancedHandler > No mongoURI specified. Some features don't work!`);
        this.client = client;
        this.commandsDir = options.commandsDir;
        this.defaultPrefix = options.defaultPrefix;
        this.mongoURI = options.mongoURI;
        this.ignoreBots = options.ignoreBots;
        this.showWarns = options.showWarns;
        this.disableCommands = options.disableDefaultCommands || [];
        this.botOwners = options.botOwners;
        this.testServers = options.testServers;
        this.messagesPath = options.messagesPath || path.join(__dirname, 'messagesPath.json');
        this.dbOptions = options.dbOptions;
        this.commands = new DiscordJS.Collection();

        if (fs.existsSync(this.commandsDir)) {

            if (this.mongoURI) mongo(this.mongoURI, this.dbOptions);

            var files = getAllFiles(this.commandsDir);
            var amount = files.length;
            if (amount <= 0) {
                return;
            }
            console.log("AdvancedHandler > Loaded " + amount + " command" + (amount === 1 ? "" : "s") + ".");
            for (var _c = 0, files_1 = files; _c < files_1.length; _c++) {
                var _d = files_1[_c], file = _d[0], fileName = _d[1];
                file = path.join(__dirname, _d[0])
                const C = file.split("\\")[0];
                const Path = file.split("\\")[1];
                file = `${C}\\${Path}\\${_d[0]}`
                this.registerCommand(file, fileName, this, this.disableCommands);
            }

            const defaultFiles = getAllFiles(path.join(__dirname, 'commands'));

            for (let i = 0; i < defaultFiles.length; i++) {
                this.registerCommand(defaultFiles[i][0], defaultFiles[i][1], this, this.disableCommands);
            }

            client.on('message', async message => {
                let prefix = message.guild ? await this.getPrefix(message.guild, this) : this.defaultPrefix;
                if (!message.content.startsWith(prefix)) return;

                let content = message.content;

                const args = content.slice(prefix.length).trim().split(/ +/);

                let firstElement = args.shift().toLocaleLowerCase();

                let isCmdHas = this.isCommandHas(firstElement, this)



                if (!isCmdHas) return;

                firstElement = isCmdHas[1]

                const command = this.commands.get(firstElement);


                if (command.guildOnly && !message.guild) {
                    return message.reply(this.getMessage(this, "GUILD_ONLY_COMMAND"));
                }
                if (message.guild) {
                    if (command.testOnly && !this.testServers && this.showWarns) {
                        console.warn("AdvancedHandler > Command \"" + firstElement + "\" has \"testOnly\" set to true, but no test servers are defined.")
                        return message.reply(this.getMessage(this, "SOMETHINK_WENT_WRONG"));
                    } else if (command.testOnly && typeof this.testServers === 'object') {
                        let isGuildTest = false;

                        this.testServers.forEach((item) => {
                            if (item === message.guild.id) isGuildTest = true;
                        })

                        if (isGuildTest === false) {
                            return message.reply(this.getMessage(this, "TEST_ONLY"));
                        }
                    }
                } else if (!message.guild && command.testOnly && typeof this.testServers === 'string') {
                    return message.reply(this.getMessage(this, "TEST_ONLY"));
                }

                if (command.ownersOnly && !this.botOwners && this.showWarns) {
                    console.warn("AdvancedHandler > Command \"" + firstElement + "\" has \"ownersOnly\" set to true, but no owners are defined.")
                    return message.reply(this.getMessage(this, "SOMETHINK_WENT_WRONG"));
                } else if (command.testOnly && typeof this.botOwners === 'object') {
                    let isOwner = false;

                    this.botOwners.forEach(item => {
                        if (item === message.author.id) isOwner = true;
                    })
                    if (isOwner === false) {
                        return message.reply(this.getMessage(this, "BOT_OWNERS_ONLY"));
                    }
                } else if (command.ownersOnly && typeof this.botOwners === 'string' && this.botOwners !== message.author.id) {
                    return message.reply(this.getMessage(this, "BOT_OWNERS_ONLY"));
                }

                const permissions = command.requiredPermissions || command.permissions;
                let permResult = [];
                if (permissions && typeof permissions === 'object') {
                    for (let i = 0; i < permissions.length; i++) {
                        const perm = permissions[i];

                        if (!message.member.hasPermission(perm)) {
                            permResult = [perm, true]
                        }
                    }
                } else
                    if (permissions && typeof permissions === 'string') {
                        if (!message.member.hasPermission(permissions)) {
                            permResult = [permissions, true]
                        }
                    }
                if (permResult.length !== 0) {
                    let text = this.getMessage(this, "MISSING_PERMISSION")
                        .replace("{PERM}", permResult[0])

                    return message.reply(text)
                }
                const reqRolesSchema = require('./models/required-roles-schema');
                const reqRoles = await reqRolesSchema.findOneAndUpdate({ guildID: message.guild.id, command: firstElement }, { guildID: message.guild.id, command: firstElement }, { upsert: true, new: true, setDefaultsOnInsert: true });
                let roleResult = [];
                if (reqRoles.requiredRoles) {
                    if (typeof reqRoles.requiredRoles === 'object') {

                        for (let i = 0; i < reqRoles.requiredRoles.length; i++) {
                            const role = reqRoles.requiredRoles[i];

                            if (!message.member.roles.cache.has(role)) {
                                roleResult = [role, true]
                            }
                        }
                    }
                }
                if (roleResult.length !== 0) {
                    let text = this.getMessage(this, "MISSING_ROLES")
                        .replace("{ROLES}", roleResult[0])

                    return message.reply(text)
                }

                let minArgs = command.minArgs;
                let maxArgs = command.maxArgs;
                let expectedArgs = command.expectedArgs;

                if (command.maxArgs && !command.expectedArgs) {
                    throw new TypeError("Command \"" + firstElement + "\" if have maxArgs must have expectedArgs")
                } else if (command.minArgs && !command.expectedArgs) {
                    throw new TypeError("Command  \"" + firstElement + "\" if have minArgs must have expectedArgs")

                }

                if (typeof minArgs === 'number' && typeof maxArgs === 'number' && typeof expectedArgs === 'string') {
                    if (args.length < minArgs || args.length > maxArgs) {
                        const text = this.newSytnaxError(prefix, firstElement, expectedArgs, this);
                        return message.reply(text)
                    }
                }

                let commandCooldown = command.cooldown;
                let now = Date.now();

                const cooldownSchema = require('./models/cooldown');

                if (commandCooldown) {
                    let cooldownFinishTime = await cooldownSchema.findOne({ _id: `${message.guild.id}-${message.author.id}`, name: firstElement });

                    if (cooldownFinishTime) {
                        if (cooldownFinishTime.cooldown > now) {
                            return message.reply(this.getMessage(this, "COOLDOWN").replace(/{COOLDOWN}/g, this.getLeftTime(cooldownFinishTime.cooldown, Date.now())))
                        } else {
                            await cooldownSchema.findOneAndUpdate({
                                _id: `${message.guild.id}-${message.author.id}`,
                                name: firstElement,
                            }, { cooldown: now + ms(commandCooldown) }, { upsert: true })
                        }

                    }
                }

                const _callback = command.callback || command.run || command.execute
                try {
                    _callback(
                        {
                            client: client,
                            message: message,
                            args: args,
                            instance: this,
                            prefix: prefix
                        }
                    )
                } catch (e) {
                    console.log(e);
                }
            })
        } else throw new ('Commands directory "' + this.commandsDir + '" doesn\'t exist!');
    }
}


CommandHandler.prototype.registerCommand = (filePath, fileName, instance, disableCommands) => {

    const command = require(filePath);

    let commandName = command.name || fileName;

    let callbackCounter = 0;
    const defaultCommand = ["prefix", "enable", "disable", "requiredrole"];
    if (disableCommands.includes(commandName) && !defaultCommand.includes(commandName)) return;
    if (command.callback) callbackCounter++
    if (command.execute) callbackCounter++
    if (command.run) callbackCounter++

    if (callbackCounter === 0) throw new TypeError('Commands must have "callback", "execute" or "run" functions, but not multiple.');

    if (callbackCounter > 1) throw new TypeError('Commands can have "callback", "execute", or "run" functions, but not multiple.');

    if (!command.name && instance.showWarns) {
        console.warn("AdvancedHandler > \"" + filePath + "\" Command have no name. Name set to \"" + fileName + "\".")
    };



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

    if (commandName && typeof commandName !== 'string') {
        throw new TypeError('Command name must be string!');
    } else if (commandName && typeof commandName === 'string') {
        instance.commands.set(commandName, command)
    }



}

CommandHandler.prototype.getPrefix = async (guild, instance) => {
    const prefixSchema = require('./models/prefix-schema');
    let prefix, result;
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        result = await prefixSchema.findByIdAndUpdate(guild.id, { _id: guild.id }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return result.prefix
    } else {
        result = { prefix: instance.defaultPrefix };
        prefix = result.prefix;
        return prefix;
    }
}

CommandHandler.prototype.getMessage = (instance, messageName) => {
    let message;
    if (typeof messageName !== 'string') throw new TypeError('messageName must be a string!');
    const path = instance.messagesPath;

    const messagesPath = JSON.parse(fs.readFileSync(path, 'utf8'));

    message = messagesPath[messageName] || 'undefined message';

    return message;
}

CommandHandler.prototype.isDBConnected = () => {
    let mongooseConnect = false;

    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) mongooseConnect = true;

    return mongooseConnect;
}

CommandHandler.prototype.getDBConnectURI = (instance) => {
    let uri

    uri = instance.mongoURI;

    return uri;
}

CommandHandler.prototype.newSytnaxError = (prefix, commandName, arguments, instance) => {
    let text = CommandHandler.prototype.getMessage(instance, "SYNTAX_ERROR")
        .replace("{PREFIX}", prefix)
        .replace("{COMMAND}", commandName)
        .replace("{ARGUMENTS}", arguments)

    return text;
}

CommandHandler.prototype.isCommandHas = (command, instance) => {
    let has
    const commands = instance.commands;
    if (commands.has(command.toLocaleLowerCase())) {
        has = [true, command];
    } else {

        for (let i = 0; i < commands.size; i++) {
            let cmd = commands.first(i + 1)[i]
            if (cmd.aliases && cmd.aliases.includes(command)) has = [true, cmd.name || command];
        }
    }
    return has;
}

CommandHandler.prototype.getLeftTime = (finishCooldownDate, Datenow) => {
    const moment = require('moment')
    require('moment-duration-format')
    let now = Datenow;
    let leftCooldown = finishCooldownDate - now;
    let text = '';

    if (leftCooldown <= 0) {
    } else {
        text = moment.duration(leftCooldown).format("d[d], h[h], m[m], s[s]");
    }
    return text;
}
module.exports = CommandHandler