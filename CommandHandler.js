const getAllFiles = require('./get-all-files');
const DiscordJS = require('discord.js');
const path = require('path');
const fs = require('fs');
const permissions = require('./permissions');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const ms = require('ms');
const registerCommand = require('./registerCommand');
/**
* @constructor
* @param {DiscordJS.Client|any} client - DiscordJS Client
* @param {object} options - CommandHandler options
* @example
* new AdvancedHandler.CommandHandler(client, {
* commandsDir: "commands",
* defaultPrefix: "!",
* ignoreBots: true,
* showWarns: true,
* botOwners: ["ID 1", "ID2"],
* testServers: ["ID 1", "ID 2"],
* messagesPath: "your messages path",
* mongoURI: "your mongoDB connection uri",
* dbOptions: {
        keepAlive: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
    }
* });
* @returns
*/

class CommandHandler {

    constructor(client, options = {}) {
        if (!client) throw new TypeError(`AdvancedHandler > No client specified`);
        this.client = client;
        this.commandsDir = options.commandsDir;
        this.defaultPrefix = options.defaultPrefix;
        this.mongoURI = options.mongoURI;
        this.ignoreBots = options.ignoreBots || true;
        this.showWarns = options.showWarns || true;
        this.disableCommands = options.disableDefaultCommands || [];
        this.botOwners = options.botOwners;
        this.testServers = options.testServers;
        this.messagesPath = options.messagesPath || path.join(__dirname, 'messagesPath.json');
        this.dbOptions = options.dbOptions;
        this.commands = new DiscordJS.Collection();
        //this.categories = new DiscordJS.Collection();
        //this.hiddenCategories = new DiscordJS.Collection();
        //this.categorySettings = options.categorySettings;

        //this.categories.set("Help", { name: "Help", emoji: "❓", custom: false, hidden: false })
        //this.categories.set("Configuration", { name: "Configuration", emoji: "🔨", custom: false, hidden: false })

        //this.setCategory(this.categorySettings, this);


    }

    ////////////////////

    async run() {
        mongo(this.mongoURI, this.dpOptions);
        let client = this.client;
        if (this.showWarns === true) {
            if (!this.commandsDir) this.commandsDir = "commands", console.warn("AdvancedHandler > No commands dir specified. Using \"commands\".");
            if (!this.mongoURI) return console.warn("AdvancedHandler > No mongoDB connection uri. Some features don\'t work!");
            if (!this.defaultPrefix) this.defaultPrefix = "!", console.warn("AdvancedHandler > No default prefix specified. Using \"!\".");
        }
        if (fs.existsSync(this.commandsDir)) {

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
                registerCommand(file, fileName, this, this.disableCommands);
            }

            const defaultFiles = getAllFiles(path.join(__dirname, 'commands'));

            for (let i = 0; i < defaultFiles.length; i++) {

                if (this.disableCommands && this.disableCommands.includes(defaultFiles[i][1])) continue;

                registerCommand(defaultFiles[i][0], defaultFiles[i][1], this, this.disableCommands);
            }


        } else throw new ('Commands directory "' + this.commandsDir + '" doesn\'t exist!');

        client.on('message', async message => {
            let prefix = message.guild ? await this.getPrefix(message.guild) : this.defaultPrefix;
            this.prefix = prefix;
            if (!message.content.startsWith(prefix)) return;

            let content = message.content;

            const args = content.slice(prefix.length).trim().split(/ +/);

            let firstElement = args.shift().toLocaleLowerCase();

            let isCmdHas = this.isCommandHas(firstElement)



            if (!isCmdHas) return;

            const command = this.getCommand(firstElement);
            if (command.guildOnly && !message.guild) {
                return message.reply(this.getMessage("GUILD_ONLY_COMMAND"));
            }
            if (message.guild) {
                if (command.testOnly && !this.testServers && this.showWarns) {
                    console.warn("AdvancedHandler > Command \"" + firstElement + "\" has \"testOnly\" set to true, but no test servers are defined.")
                    return message.reply(this.getMessage("SOMETHINK_WENT_WRONG"));
                } else if (command.testOnly && typeof this.testServers === 'object') {
                    let isGuildTest = false;

                    this.testServers.forEach((item) => {
                        if (item === message.guild.id) isGuildTest = true;
                    })

                    if (isGuildTest === false) {
                        return message.reply(this.getMessage("TEST_ONLY"));
                    }
                }
            } else if (!message.guild && command.testOnly && typeof this.testServers === 'string') {
                return message.reply(this.getMessage("TEST_ONLY"));
            }

            if (command.ownersOnly && !this.botOwners && this.showWarns) {
                console.warn("AdvancedHandler > Command \"" + firstElement + "\" has \"ownersOnly\" set to true, but no owners are defined.")
                return message.reply(this.getMessage("SOMETHINK_WENT_WRONG"));
            } else if (command.testOnly && typeof this.botOwners === 'object') {
                let isOwner = false;

                this.botOwners.forEach(item => {
                    if (item === message.author.id) isOwner = true;
                })
                if (isOwner === false) {
                    return message.reply(this.getMessage("BOT_OWNERS_ONLY"));
                }
            } else if (command.ownersOnly && typeof this.botOwners === 'string' && this.botOwners !== message.author.id) {
                return message.reply(this.getMessage("BOT_OWNERS_ONLY"));
            }
            if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
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
                    let text = this.getMessage("MISSING_ROLES")
                        .replace("{ROLES}", roleResult[0])

                    return message.reply(text)
                }
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
                let text = this.getMessage("MISSING_PERMISSION")
                    .replace("{PERM}", permResult[0])

                return message.reply(text)
            }

            const requiredBotPermissions = command.requiredBotPermissions;
            let permBotResult = [];
            if (requiredBotPermissions && typeof requiredBotPermissions === 'object') {
                for (let i = 0; i < requiredBotPermissions.length; i++) {
                    const perm = requiredBotPermissions[i];

                    if (!message.guild.me.hasPermission(perm)) {
                        permBotResult = [perm, true]
                    }
                }
            } else
                if (requiredBotPermissions && typeof requiredBotPermissions === 'string') {
                    if (!message.guild.me.hasPermission(requiredBotPermissions)) {
                        permBotResult = [requiredBotPermissions, true]
                    }
                }
            if (permBotResult.length !== 0) {
                let text = this.getMessage("MISSING_BOT_PERMISSION")
                    .replace("{PERM}", permBotResult[0])

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

            if (expectedArgs) {
                if (args.length < minArgs || args.length > maxArgs) {
                    const text = this.newSyntaxError(firstElement, expectedArgs);
                    return message.reply(text)
                }
            }

            let commandCooldown = command.cooldown;
            let now = Date.now();

            const cooldownSchema = require('./models/cooldown');

            if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2 && commandCooldown) {
                let cooldownFinishTime = await cooldownSchema.findOne({ _id: `${message.guild.id}-${message.author.id}`, name: firstElement });

                if (cooldownFinishTime) {
                    if (cooldownFinishTime.cooldown > now) {
                        return message.reply(this.getMessage("COOLDOWN").replace(/{COOLDOWN}/g, getLeftTime(cooldownFinishTime.cooldown, Date.now())))
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
    }


    /**
        * 
        * @param {string} prefix 
        * @returns 
        */
    setDefaultPrefix(prefix) {
        if (typeof prefix !== 'string') throw new Error('Prefix must be string!');
        this.defaultPrefix = prefix;

        return this;
    }
    /**
     * 
     * @param {string} dir 
     * @returns 
     */
    setCommandsDir(dir) {
        if (typeof dir !== 'string') throw new Error('Directory must be string!');

        this.commandsDir = dir;

        return this
    }
    /**
     * 
     * @param {string} uri 
     * @returns 
     */
    setMongoURI(uri) {
        if (typeof uri !== 'string') throw new Error('mongoDB uri must be string!');

        this.mongoURI = uri;

        return this;
    }
    /*setCategory(Categories) {
        if (!typeof Categories === 'object') throw new Error('First parametre must be an Array!');
    
        for (let i = 0; i < Categories.length; i++) {
            let category = Categories[i];
    
            if (!category.name) throw new TypeError("Name is required for categories!");
    
            if (!category.emoji) throw new TypeError("Emoji is required for categories!");
    
            if (this.isEmojiUsed(category.emoji)) throw new TypeError("\"" + category.emoji + "\"" + " emoji is already used!");
    
            if (!category.custom) category.custom = false;
    
            if (!category.hidden) category.hidden = false;
    
            this.categories.set(category.name, category);
        }
    
    }*/
    /**
     * 
     * @param {boolean} ignoreBots 
     * @returns 
     */
    setIgnoreBots(ignoreBots) {
        if (typeof ignoreBots !== 'boolean') throw new Error('Ignore bots must be boolean!');

        this.ignoreBots = ignoreBots;

        return this;
    }
    /**
     * 
     * @param {boolean} showWarns 
     * @returns 
     */
    setShowWarns(showWarns) {
        if (typeof showWarns !== 'boolean') throw new Error('Show warns must be boolean!');

        this.showWarns = showWarns;

        return this;
    }
    /**
     * 
     * @param {object} commands 
     * @returns 
     */
    setDisableDefaultCommands(commands) {
        if (typeof commands !== 'object') throw new Error('Disable default commands must be array!');

        this.disableCommands = commands;

        return this;
    }
    /**
     * 
     * @param {object} owners 
     * @returns 
     */
    setBotOwners(owners) {
        if (typeof owners !== 'object') throw new Error('Owners must be array!');

        this.botOwners = owners;

        return this;
    }
    /**
     * 
     * @param {object} servers 
     * @returns 
     */
    setTestServers(servers) {
        if (typeof servers !== 'object') throw new Error('Test servers must be array!');

        this.testServers = servers;

        return this;
    }
    /**
     * 
     * @param {object} dbOptions 
     * @returns 
     */
    setDbOptions(dbOptions) {
        if (typeof dbOptions !== 'object') throw new Error('DB options must be object!');

        this.dbOptions = dbOptions;

        return this;

    }
    /**
     * 
     * @param {string} path 
     * @returns 
     */
    setMessagesPath(path) {
        if (!typeof path === 'string') throw new Error('Path must be string!');

        this.messagesPath = path;

        return this;
    }


    //gets
    /**
     * 
     * @param {any} guild
     * @returns 
     */
    async getPrefix(guild) {
        const prefixSchema = require('./models/prefix-schema');
        let prefix;
        if (this.isDBConnected()) {
            const result = await prefixSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id }, { upsert: true, new: true, setDefaultsOnInsert: true });
            if (!result.prefix) {
                result.prefix = this.defaultPrefix; await prefixSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id, prefix: this.defaultPrefix }, { upsert: true, new: true, setDefaultsOnInsert: true });
            };

            prefix = result.prefix;

        } else {
            prefix = this.defaultPrefix;
        }
        return prefix;
    }
    /**
     * 
     * @param {string} messageName 
     * @returns 
     */
    getMessage(messageName) {
        let message;
        if (typeof messageName !== 'string') throw new TypeError('messageName must be a string!');
        const path = this.messagesPath;

        const messagesPath = JSON.parse(fs.readFileSync(path, 'utf8'));

        message = messagesPath[messageName] || 'undefined message';

        return message;
    }

    getDBConnectURI() {
        return this.mongoURI;
    }
    /**
     * 
     * @param {string} commandName 
     * @param {string} args 
     * @returns 
     */
    newSyntaxError(commandName, args) {
        let text = this.getMessage("SYNTAX_ERROR")
            .replace(/{PREFIX}/g, this.prefix)
            .replace(/{COMMAND}/g, commandName)
            .replace(/{ARGUMENTS}/g, args);

        return text;
    }
    /**
     * 
     * @param {string} commandName 
     * @returns 
     */
    isCommandHas(commandName) {
        let has
        const commands = this.commands;
        if (commands.has(commandName.toLocaleLowerCase())) {
            has = true
        } else {

            for (let i = 0; i < commands.size; i++) {
                let cmd = commands.first(i + 1)[i]
                if (cmd.aliases && cmd.aliases.includes(commandName.toLocaleLowerCase())) has = true
            }
        }
        return has;
    }
    /**
        * 
        * @param {string} commandName 
        * @returns 
        */
    getCommand(commandName) {
        let cmd;

        let commands = this.commands;
        for (let i = 0; i < commands.size; i++) {
            let commandNamee = commands.first(i + 1)[i].name
            let cmd = commands.first(i + 1)[i];
            if (commandNamee === commandName) {
                return cmd;
            } else if (cmd.aliases) {
                if (cmd.aliases === commandName.toLocaleLowerCase() || cmd.aliases.includes(commandName.toLocaleLowerCase())) {
                    return cmd
                } else {
                    cmd = undefined;
                }
            }
        }

        return cmd;
    }


    /*getCategory(category) {
        let cat = this.categories.get(category) || this.hiddenCategories.get(category);

        return cat;
    }*/

    /*getCategoryEmoji(category) {

        let emoji = this.categories.get(category).emoji || this.hiddenCategories.get(category).emoji;

        return emoji;
    }*/

    /*isEmojiUsed(emoji) {
        let has = false
        this.categories.forEach(item => {
            if (item.emoji === emoji) has = true;
        })
        return has;
    }*/

    isDBConnected() {
        let connect = false

        if (mongoose.connection.readyState === 1||mongoose.connection.readyState === 2) connect = true

        return connect;
    }
}



const getLeftTime = (finishCooldownDate, Datenow) => {
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