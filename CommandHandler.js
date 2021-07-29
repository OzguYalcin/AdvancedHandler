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
        this.defaultLang = options.defaultLang || options.defaultLanguage || "en"
        this.mongoURI = options.mongoURI;
        this.ignoreBots = options.ignoreBots || true;
        this.showWarns = options.showWarns || true;
        this.disableCommands = options.disableDefaultCommands || [];
        this.botOwners = options.botOwners;
        this.testServers = options.testServers;
        this.messagesPath = options.messagesPath || path.join(__dirname, 'messages.json');
        this.dbOptions = options.dbOptions;
        this.commands = new DiscordJS.Collection();
        this.categories = new DiscordJS.Collection();
        this.hiddenCategories = new DiscordJS.Collection();
        this.helpSettings = {};
        this.categories.set("Help", { name: "Help", emoji: "❓", custom: false, hidden: false })
        this.categories.set("Configuration", { name: "Configuration", emoji: "🔨", custom: false, hidden: false })
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
                return message.reply(await this.getMessage(message.guild, "GUILD_ONLY_COMMAND"));
            }

            if (message.guild && this.isDBConnected()) {
                if (await this.isCommandDisabled(message.guild, command.name ? command.name : command.secondName)) {
                    return message.reply(await this.getMessage(message.guild, "COMMAND_DISABLED"))
                }

                if (await this.isChannelDisabled(message.guild, command.name ? command.name : command.secondName, message.channel)) {
                    return message.reply(await this.getMessage(message.guild, "CHANNEL_DISABLED"))
                }
            }

            if (message.guild) {
                if (command.testOnly && !this.testServers && this.showWarns) {
                    console.warn("AdvancedHandler > Command \"" + firstElement + "\" has \"testOnly\" set to true, but no test servers are defined.")
                    return message.reply(await this.getMessage(message.guild, "SOMETHINK_WENT_WRONG"));
                } else if (command.testOnly && typeof this.testServers === 'object') {
                    let isGuildTest = false;

                    this.testServers.forEach((item) => {
                        if (item === message.guild.id) isGuildTest = true;
                    })

                    if (isGuildTest === false) {
                        return message.reply(await this.getMessage(message.guild, "TEST_ONLY"));
                    }
                }
            } else if (!message.guild && command.testOnly && typeof this.testServers === 'string') {
                return message.reply(await this.getMessage(message.guild, "TEST_ONLY"));
            }

            if (command.ownersOnly && !this.botOwners && this.showWarns) {
                console.warn("AdvancedHandler > Command \"" + firstElement + "\" has \"ownersOnly\" set to true, but no owners are defined.")
                return message.reply(await this.getMessage(message.guild, "SOMETHINK_WENT_WRONG"));
            } else if (command.testOnly && typeof this.botOwners === 'object') {
                let isOwner = false;

                this.botOwners.forEach(item => {
                    if (item === message.author.id) isOwner = true;
                })
                if (isOwner === false) {
                    return message.reply(await this.getMessage(message.guild, "BOT_OWNERS_ONLY"));
                }
            } else if (command.ownersOnly && typeof this.botOwners === 'string' && this.botOwners !== message.author.id) {
                return message.reply(await this.getMessage(message.guild, "BOT_OWNERS_ONLY"));
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
                    let text = await this.getMessage(message.guild, "MISSING_ROLES", { ROLE: roleResult[0] })

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
                let text = await this.getMessage(message.guild, "MISSING_PERMISSION", { PERM: permResult[0] })

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
                let text = await this.getMessage(message.guild, "MISSING_BOT_PERMISSION", { PERM: permBotResult[0] })

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
                    const text = await this.newSyntaxError(message.guild, firstElement, expectedArgs);
                    return message.reply(text)
                }
            }

            let commandCooldown = command.cooldown;
            let now = Date.now();

            const cooldownSchema = require('./models/cooldown-schema');
            if (this.isDBConnected() && commandCooldown) {
                let cooldownFinishTime = await cooldownSchema.findOneAndUpdate({ _id: `${message.guild.id}-${message.author.id}-${firstElement}`, name: firstElement }, { _id: `${message.guild.id}-${message.author.id}-${firstElement}` }, { upsert: true });

                if (cooldownFinishTime) {
                    if (cooldownFinishTime.cooldown > now) {
                        return message.reply(await this.getMessage(message.guild, "COOLDOWN", { COOLDOWN: getLeftTime(cooldownFinishTime.cooldown, now) }))
                    } else {
                        await cooldownSchema.findOneAndUpdate({
                            _id: `${message.guild.id}-${message.author.id}-${firstElement}`,
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

    //Options

    /**
     * 
     * @param {boolean} ignoreBots 
     * @returns {CommandHandler}
     */
    setIgnoreBots(ignoreBots) {
        if (typeof ignoreBots !== 'boolean') throw new TypeError('Ignore bots must be boolean!');

        this.ignoreBots = ignoreBots;

        return this;
    }
    /**
     * 
     * @param {boolean} showWarns 
     * @returns {CommandHandler} 
     */
    setShowWarns(showWarns) {
        if (typeof showWarns !== 'boolean') throw new TypeError('Show warns must be boolean!');

        this.showWarns = showWarns;

        return this;
    }
    /**
     * 
     * @param {object} owners 
     * @returns {CommandHandler} 
     */
    setBotOwners(owners) {
        if (typeof owners !== 'object') throw new TypeError('Owners must be array!');

        this.botOwners = owners;

        return this;
    }
    /**
     * 
     * @param {object} servers 
     * @returns {CommandHandler} 
     */
    setTestServers(servers) {
        if (typeof servers !== 'object') throw new TypeError('Test servers must be array!');

        this.testServers = servers;

        return this;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    //message
    /**
     * 
     * @param {string} path 
     * @returns {CommandHandler} 
     */
    setMessagesPath(path) {
        if (!typeof path === 'string') throw new TypeError('Path must be string!');

        this.messagesPath = path;

        return this;
    }
    /**
    * @param {message.guild|any} guild
    * @param {string} messageID 
    * @param {object} options
    * @returns {string}
    * @expamle 
    * await instance.getMessage(message.guild, "MESSAGE ID", {
    * PREFIX: prefix
    * })
    */
    async getMessage(guild, messageID, options = {}) {
        let message;
        let lang = await this.getLanguage(guild);
        if (typeof messageID !== 'string') throw new TypeError('messageID must be a string!');
        const path = this.messagesPath;

        const messagesPath = JSON.parse(fs.readFileSync(path, 'utf8'));
        message = messagesPath[messageID];

        if (!message) {
            throw new Error("Unkown message ID!");
        }

        return message[lang]
            .replace(/{CHANNELS}/g, options.CHANNELS)
            .replace(/{CHANNEL}/g, options.CHANNEL)
            .replace(/{EMOJI}/g, options.EMOJI)
            .replace(/{CATEGORY}/g, options.CATEGORY)
            .replace(/{PREFIX}/g, options.PREFIX)
            .replace(/{LANG}/g, options.LANG)
            .replace(/{COMMAND}/g, options.COMMAND)
            .replace(/{ARGUMENTS}/g, options.ARGUMENTS)
            .replace(/{ROLE}/g, options.ROLE)
            .replace(/{PERM}/g, options.PERM)
            .replace(/{COOLDOWN}/g, options.COOLDOWN);
    }




    /**
     * @param {message.guild|any} guild
     * @param {string} command 
     * @param {string} args 
     * @returns {string}
     * @example
     * await instance.newSyntaxError(message.guild, "required-roles", "[add | remove] [command name] [role id | mention role]")
     */
    async newSyntaxError(guild, command, args) {
        let text = await this.getMessage(guild, "SYNTAX_ERROR", { PREFIX: await this.getPrefix(guild), COMMAND: command, ARGUMENTS: args })
        return text;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    //Help
    /**
         * 
         * @param {object} settings - Help Settings
         * @example
         * {
        embed: {
            color: "RED"
        },
        authoritativePerms: [
            "ADMINISTRATOR",
            "KICK_MEMBERS",
            "BAN_MEMBERS"
        ],
        categories: [
            {
                name: "Admin", 
                emoji: "emoji ID", 
                custom: true, 
                hidden: true 
            },
            {
                name: "Configuration",
                emoji: "🔨",
                custom: false,
                hidden: false
            }
        ]
    }
         * @returns {CommandHandler}
         */
    setHelpSettings(settings) {
        let categories = settings.categories;
        if (!categories || !categories.length) throw new Error("At least one category must be specified!");
        if (!settings.embed || !settings.embed.color) settings.embed = {
            color: null
        };

        if (!settings.authoritativePerms) settings.authoritativePerms = ["ADMINISTRATOR"];

        if (!settings.embed.withPages) settings.embed.withPages = true;
        if (!settings.embed.destroy) settings.embed.destroy = true;
        if (!settings.embed.home) settings.embed.home = true;

        if (settings.embed.withPages) {

            for (let category of categories) {
                if (!category.name) throw new Error("The category must have a name");
                if (!category.emoji) throw new Error("Emoji is required for each category of withPages true!")
                if (!category.custom) category.custom = false;
                if (!category.hidden) category.hidden = false;
                if (this.isNameUsed(category.name)) throw new Error("Names must be used once!");
                if (this.isEmojiUsed(category.emoji)) throw new Error("Emojis must be used once!");
                if (typeof category.name !== 'string') throw new TypeError("Category name must be string!");
                if (typeof category.emoji !== 'string') throw new TypeError("Category emoji must be string!");
                if (typeof category.custom !== 'boolean') throw new TypeError("Category emoji custom must be boolean!");
                if (typeof category.hidden !== 'boolean') throw new TypeError("Category hidden must be boolean!");

                this.categories.set(category.name, category);
            }

        } else {
            for (let category of categories) {
                if (!category.name) throw new Error("The category must have a name");
                if (category.emoji && !category.custom) category.custom = false;
                if (!category.hidden) category.hidden = false;
                if (this.isNameUsed(category.name)) throw new Error("Names must be used once!");

                if (typeof category.name !== 'string') throw new TypeError("Category name must be string!");
                if (typeof category.emoji !== 'string') throw new TypeError("Category emoji must be string!");
                if (typeof category.custom !== 'boolean') throw new TypeError("Category emoji custom must be boolean!");
                if (typeof category.hidden !== 'boolean') throw new TypeError("Category hidden must be boolean!");

                this.categories.set(category.name, category);
            }
        }
        this.helpSettings = settings;
        return this;
    }
    /**
     * 
     * @param {string} emoji 
     * @returns {boolean}
     */
    isEmojiUsed(emoji) {
        let result;

        const e = this.categories.filter(c => c.emoji === emoji);

        if (e.size !== 0) result = true
        else result = false

        return result;
    }
    /**
         * 
         * @param {string} name 
         * @returns {boolean}
         */
    isNameUsed(name) {
        let result;

        const e = this.categories.filter(c => c.name === name);
        if (e.size !== 0) result = true
        else result = false

        return result;
    }
    /**
     * 
     * @param {string} emoji 
     * @returns {category}
     */
    getCategoryByEmoji(emoji) {
        let result;

        result = this.categories.filter(c => c.emoji = emoji)

        if (result.size === 0) result = this.categories.filter(c => c.emoji === emoji.id);

        if (result.size === 0) result = undefined;

        return result;
    }
    /**
         * 
         * @param {string} name 
         * @returns {category}
         */
    getCategoryByName(name) {
        let result;

        result = this.categories.filter(c => c.name = name);

        if (result.size === 0) result = undefined;

        return result;
    }
    /**
     * 
     * @param {message} message 
     * @param {object} authoritativePerms 
     * @returns {any}
     */
    getCategories(message, authoritativePerms) {
        let perm = false, categories = this.categories
        for (let i = 0; i < authoritativePerms.length; i++) {
            let _perm = authoritativePerms[i];
            if (message.member.hasPermission(_perm)) perm = true
            else continue;
        }

        if (perm) categories = this.categories;
        else categories = this.categories.filter(c => c.hidden === false);

        return categories;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Lang
    /**
     * 
     * @param {message.guild|any} guild 
     * @param {string} language
     * @returns {any}
     */
    async setLanguage(guild, language) {
        const langSchema = require("./models/language-schema");

        const result = await langSchema.findByIdAndUpdate(guild.id, { lang: language }, { upsert: true });

        return result;
    }
    /**
     * 
     * @param {message.guild|any} guild
     *  @returns {language}
     */
    async getLanguage(guild) {
        const langSchema = require('./models/language-schema');
        let lang;

        if (this.isDBConnected()) {
            let result = await langSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id }, { upsert: true, new: true, setDefaultsOnInsert: true })
            if (!result.lang) result.lang = this.defaultLang;
            lang = result.lang
        } else {
            lang = this.defaultLang;
        }
        return lang
    }

    /**
     * 
     * @param {string} language
     * @returns {CommandHandler}
     */
    setDefaultLanguage(language) {
        if (typeof language !== 'string') throw new TypeError('Language must be string!');
        const langs = ["tr", "en"]
        if (!langs.includes(language.toLocaleLowerCase())) throw new Error("Unkown language!");

        this.defaultLang = language;

        return this;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Prefix
    /**
        * 
        * @param {string} prefix 
        * @returns {CommandHandler}
        */
    setDefaultPrefix(prefix) {
        if (typeof prefix !== 'string') throw new TypeError('Prefix must be string!');
        this.defaultPrefix = prefix;

        return this;
    }
    /**
     * 
     * @param {any} guild
     * @returns {prefix}
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
     * @param {message.guild|any} guild 
     * @param {string} prefix 
     * @returns {any}
     */
    async setPrefix(guild, prefix) {
        const prefixSchema = require('./models/prefix-schema');

        const result = await prefixSchema.findByIdAndUpdate(guild.id, { prefix: prefix }, { upsert: true });

        return result;
    }

    /////////////////////////////////////////////////////////////////////////////
    //command
    /**
     * 
     * @param {object} commands 
     * @returns {CommandHandler}
     */
    setDisableDefaultCommands(commands) {
        if (typeof commands !== 'object') throw new TypeError('Disable default commands must be array!');

        this.disableCommands = commands;

        return this;
    }
    /**
     * 
     * @param {string} command 
     * @returns {boolean}
     */
    isCommandHas(command) {
        let has
        const commands = this.commands;
        if (commands.has(command.toLocaleLowerCase())) {
            has = true
        } else {

            for (let i = 0; i < commands.size; i++) {
                let cmd = commands.first(i + 1)[i]
                if (cmd.aliases && cmd.aliases.includes(command.toLocaleLowerCase())) has = true
            }
        }
        return has;
    }
    /**
        * 
        * @param {string} command 
        * @returns {command}
        */
    getCommand(command) {
        let cmd;

        let commands = this.commands;
        for (let i = 0; i < commands.size; i++) {
            let commandNamee = commands.first(i + 1)[i].name
            let cmd = commands.first(i + 1)[i];
            if (commandNamee === command) {
                return cmd;
            } else if (cmd.aliases) {
                if (cmd.aliases === command.toLocaleLowerCase() || cmd.aliases.includes(command.toLocaleLowerCase())) {
                    return cmd
                } else {
                    cmd = undefined;
                }
            }
        }

        return cmd;
    }
    /**
         * 
         * @param {string} dir 
         * @returns {CommandHandler}
         */
    setCommandsDir(dir) {
        if (typeof dir !== 'string') throw new TypeError('Directory must be string!');

        this.commandsDir = dir;

        return this
    }
    /**
     * 
     * @param {message.guild|any} guild
     * @param {string} command
     * @returns {boolean} 
     */
    async isCommandDisabled(guild, command) {
        const disableCommandsSchema = require('./models/command-schema');
        let result = await disableCommandsSchema.findOne({ guildID: guild.id, command: command });
        let returns = false
        if (result !== null) returns = true
        return returns
    }
    /**
     * 
     * @param {message.guild|any} guild 
     * @param {string} command 
     * @param {any} channel 
     * @returns {boolean} 
     */
    async isChannelDisabled(guild, command, channel) {
        const ChannelSchema = require('./models/channel-schema');
        let output = false
        let result = await ChannelSchema.findOne({ guildID: guild.id, command: command });
        if (result === null) return output;
        if (result !== null && result.channels !== null && result.channels.includes(channel.id)) output = true;

        return output
    }
    //////////////////////////////////////////////////////////////////////

    //mongoDB
    /**
     * 
     * @param {object} dbOptions 
     * @returns {CommandHandler}
     */
    setDbOptions(dbOptions) {
        if (typeof dbOptions !== 'object') throw new TypeError('DB options must be object!');

        this.dbOptions = dbOptions;

        return this;

    }
    /**
     * 
     * @returns {boolean}
     */
    isDBConnected() {
        let connect = false

        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) connect = true

        return connect;
    }
    /**
     * 
     * @returns {uri}
     */
    getDBConnectURI() {
        return this.mongoURI;
    }
    /**
    * 
    * @param {string} uri
    * @returns {CommandHandler}
    */
    setMongoURI(uri) {
        if (typeof uri !== 'string') throw new TypeError('mongoDB uri must be string!');

        this.mongoURI = uri;

        return this;
    }
    //////////////////////////////////////////////////////////////////////
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