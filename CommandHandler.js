const getAllFiles = require('./get-all-files');
const DiscordJS = require('discord.js');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const mongo = require('./mongo');
const ms = require('ms');
const registerCommand = require('./registerCommand');
const moment = require('moment')
require('moment-duration-format')
const reqRolesSchema = require('./models/required-roles-schema');
const cooldownSchema = require('./models/cooldown-schema');
const langSchema = require('./models/language-schema');
const prefixSchema = require('./models/prefix-schema');
const disableCommandsSchema = require('./models/command-schema');
const channelSchema = require('./models/channel-schema');
const statsSchema = require('./models/stats-schema');
const blacklistSchema = require('./models/blacklist-schema')

/**
* @constructor
* @param {DiscordJS.Client} client - DiscordJS Client
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
        this.sendMessageBlackList = options.sendMessageBlackList || false;
        this.commands = new DiscordJS.Collection();
        this.categories = new DiscordJS.Collection();
        this.hiddenCategories = new DiscordJS.Collection();
        this.helpSettings = {};
        this.categories.set("Help", { name: "Help", emoji: "❓", custom: false, hidden: false })
        this.categories.set("Configuration", { name: "Configuration", emoji: "🔨", custom: false, hidden: false })
        this.categories.set("Statistics", { name: "Statistics", emoji: "📊", custom: false, hidden: false })
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

            var files = getAllFiles(path.join(require.main.path, this.commandsDir));
            var amount = files.length;
            if (amount <= 0) {
                return;
            }
            console.log("AdvancedHandler > Loaded " + amount + " command" + (amount === 1 ? "" : "s") + ".");
            for (var _c = 0, files_1 = files; _c < files_1.length; _c++) {
                var _d = files_1[_c], file = _d[0], fileName = _d[1];
                registerCommand(`${file}`, fileName, this, this.disableCommands);
            }

            const defaultFiles = getAllFiles(path.join(__dirname, 'commands'));

            for (let i = 0; i < defaultFiles.length; i++) {

                if (this.disableCommands && this.disableCommands.includes(defaultFiles[i][1])) continue;

                registerCommand(defaultFiles[i][0], defaultFiles[i][1], this, this.disableCommands);
            }


        } else throw new ('Commands directory "' + this.commandsDir + '" doesn\'t exist!');

        client.on('message', async message => {
            let prefix = await this.getPrefix(message.guild)
            if (!message.content.startsWith(prefix)) return;

            let content = message.content;

            const args = content.slice(prefix.length).trim().split(/ +/);

            let firstElement = args.shift().toLocaleLowerCase();

            let isCmdHas = this.isCommandHas(firstElement)

            if (!isCmdHas) return;

            const command = this.getCommand(firstElement);

            let error = command.error;
            if (await this.isUserInBlacklist(message.author.id) && this.isDbConnected()) {
                if (error) {
                    if (await error({
                        command,
                        error: "USER IN BLACKLIST",
                        info: message.member,
                        instance: this,
                        message,
                        guild: message.guild
                    })) {
                        if (typeof await error({
                            command,
                            error: "USER IN BLACKLIST",
                            info: message.member,
                            instance: this,
                            message,
                            guild: message.guild
                        }) === 'string') {
                            return message.reply(await error({
                                command,
                                error: "USER IN BLACKLIST",
                                info: message.member,
                                instance: this,
                                message,
                                guild: message.guild
                            }))
                        } else {
                            return message.reply({
                                embed: await error({
                                    command,
                                    error: "USER IN BLACKLIST",
                                    info: message.member,
                                    instance: this,
                                    message,
                                    guild: message.guild
                                })
                            })
                        }
                    } else {
                        if (this.sendMessageBlackList) return message.reply(await this.getMessage(message.guild, "USER_IN_BLACKLIST"))
                        else return;
                    }
                } else if (this.sendMessageBlackList) return message.reply(await this.getMessage(message.guild, "USER_IN_BLACKLIST"))
                else return;
            }

            if (command.guildOnly && !message.guild) {
                if (error) {
                    if (await error({
                        command,
                        error: "GUILD ONLY COMMAND",
                        info: null,
                        instance: this,
                        message,
                        guild: message.guild
                    })) {
                        if (typeof await error({
                            command,
                            error: "GUILD ONLY COMMAND",
                            info: null,
                            instance: this,
                            message,
                            guild: message.guild
                        }) === 'string') {
                            return message.reply(await error({
                                command,
                                error: "GUILD ONLY COMMAND",
                                info: null,
                                instance: this,
                                message,
                                guild: message.guild
                            }))
                        } else {
                            return message.reply({
                                embed: await error({
                                    command,
                                    error: "GUILD ONLY COMMAND",
                                    info: null,
                                    instance: this,
                                    message,
                                    guild: message.guild
                                })
                            })
                        }
                    } else {
                        return message.reply(await this.getMessage(message.guild, "GUILD_ONLY_COMMAND"))
                    }
                } else return message.reply(await this.getMessage(message.guild, "GUILD_ONLY_COMMAND"))
            }

            if (message.guild && this.isDbConnected()) {
                if (await this.isCommandDisabled(message.guild, command.name)) {
                    if (error) {
                        if (await error({
                            command,
                            error: "COMMAND DISABLED",
                            info: command,
                            instance: this,
                            message,
                            guild: message.guild
                        })) {
                            if (typeof await error({
                                command,
                                error: "COMMAND DISABLED",
                                info: command,
                                instance: this,
                                message,
                                guild: message.guild
                            }) === 'string') {
                                return message.reply(await error({
                                    command,
                                    error: "COMMAND DISABLED",
                                    info: command,
                                    instance: this,
                                    message,
                                    guild: message.guild
                                }))
                            } else {
                                return message.reply({
                                    embed: await error({
                                        command,
                                        error: "COMMAND DISABLED",
                                        info: command,
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    })
                                })
                            }
                        } else {
                            return message.reply(await this.getMessage(message.guild, "COMMAND_DISABLED"))
                        }
                    } else return message.reply(await this.getMessage(message.guild, "COMMAND_DISABLED"))
                }

                if (await this.isChannelDisabled(message.guild, command.name, message.channel)) {
                    if (error) {
                        if (await error({
                            command,
                            error: "CHANNEL DISABLED",
                            info: message.channel,
                            instance: this,
                            message,
                            guild: message.guild
                        })) {
                            if (typeof await error({
                                command,
                                error: "CHANNEL DISABLED",
                                info: message.channel,
                                instance: this,
                                message,
                                guild: message.guild
                            }) === 'string') {
                                return message.reply(await error({
                                    command,
                                    error: "CHANNEL DISABLED",
                                    info: message.channel,
                                    instance: this,
                                    message,
                                    guild: message.guild
                                }))
                            } else {
                                return message.reply({
                                    embed: await error({
                                        command,
                                        error: "CHANNEL DISABLED",
                                        info: message.channel,
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    })
                                })
                            }
                        } else {
                            return message.reply(await this.getMessage(message.guild, "CHANNEL_DISABLED"))
                        }
                    } else return message.reply(await this.getMessage(message.guild, "CHANNEL_DISABLED"))
                }
            }

            if (message.guild) {
                if (command.testOnly && this.testServers) {
                    let isGuildTest = false;

                    if (this.testServers === message.guild.id || this.testServers.includes(message.guild.id)) isGuildTest = true;

                    if (!isGuildTest) {
                        if (error) {
                            if (await error({
                                command,
                                error: "TEST ONLY",
                                info: message.guild ? message.guild : "dm",
                                instance: this,
                                message,
                                guild: message.guild
                            })) {
                                if (typeof await error({
                                    command,
                                    error: "TEST ONLY",
                                    info: message.guild ? message.guild : "dm",
                                    instance: this,
                                    message,
                                    guild: message.guild
                                }) === 'string') {
                                    return message.reply(await error({
                                        command,
                                        error: "TEST ONLY",
                                        info: message.guild ? message.guild : "dm",
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    }))
                                } else {
                                    return message.reply({
                                        embed: await error({
                                            command,
                                            error: "TEST ONLY",
                                            info: message.guild ? message.guild : "dm",
                                            instance: this,
                                            message,
                                            guild: message.guild
                                        })
                                    })
                                }
                            } else {
                                return message.reply(await this.getMessage(message.guild, "TEST_ONLY"))
                            }
                        } else return message.reply(await this.getMessage(message.guild, "TEST_ONLY"))
                    }
                }
            } else if (!message.guild && command.testOnly) {
                if (error) {
                    if (await error({
                        command,
                        error: "TEST ONLY",
                        info: message.guild ? message.guild : "dm",
                        instance: this,
                        message,
                        guild: message.guild
                    })) {
                        if (typeof await error({
                            command,
                            error: "TEST ONLY",
                            info: message.guild ? message.guild : "dm",
                            instance: this,
                            message,
                            guild: message.guild
                        }) === 'string') {
                            return message.reply(await error({
                                command,
                                error: "TEST ONLY",
                                info: message.guild ? message.guild : "dm",
                                instance: this,
                                message,
                                guild: message.guild
                            }))
                        } else {
                            return message.reply({
                                embed: await error({
                                    command,
                                    error: "TEST ONLY",
                                    info: message.guild ? message.guild : "dm",
                                    instance: this,
                                    message,
                                    guild: message.guild
                                })
                            })
                        }
                    } else {
                        return message.reply(await this.getMessage(message.guild, "TEST_ONLY"))
                    }
                } else return message.reply(await this.getMessage(message.guild, "TEST_ONLY"))
            }

            if (command.ownerOnly) {
                let isOwner = false;

                if (this.botOwners === message.author.id || this.botOwners.includes(message.author.id)) isOwner = true;
                if (!isOwner) {
                    if (error) {
                        if (await error({
                            command,
                            error: "BOT OWNERS ONLY",
                            info: message.author,
                            instance: this,
                            message,
                            guild: message.guild
                        })) {
                            if (typeof await error({
                                command,
                                error: "BOT OWNERS ONLY",
                                info: message.author,
                                instance: this,
                                message,
                                guild: message.guild
                            }) === 'string') {
                                return message.reply(await error({
                                    command,
                                    error: "BOT OWNERS ONLY",
                                    info: message.author,
                                    instance: this,
                                    message,
                                    guild: message.guild
                                }))
                            } else {
                                return message.reply({
                                    embed: await error({
                                        command,
                                        error: "BOT OWNERS ONLY",
                                        info: message.author,
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    })
                                })
                            }
                        } else {
                            return message.reply(await this.getMessage(message.guild, "BOT_OWNERS_ONLY"))
                        }
                    } else return message.reply(await this.getMessage(message.guild, "BOT_OWNERS_ONLY"))
                }
            }

            if (this.isDbConnected() && message.guild) {
                const reqRoles = await reqRolesSchema.findOneAndUpdate({ guildID: message.guild.id, command: command.name }, { guildID: message.guild.id, command: command.name }, { upsert: true, new: true, setDefaultsOnInsert: true });
                let roleResult = [];
                if (reqRoles.requiredRoles) {
                    if (typeof reqRoles.requiredRoles === 'object') {

                        for (let i = 0; i < reqRoles.requiredRoles.length; i++) {
                            const role = reqRoles.requiredRoles[i];

                            if (!message.member.roles.cache.has(role)) {
                                roleResult = [role, true]
                                if (error) {
                                    if (await error({
                                        command,
                                        error: "MISSING ROLES",
                                        info: reqRoles.requiredRoles,
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    })) {
                                        if (typeof await error({
                                            command,
                                            error: "MISSING ROLES",
                                            info: reqRoles.requiredRoles,
                                            instance: this,
                                            message,
                                            guild: message.guild
                                        }) === 'string') {
                                            return message.reply(await error({
                                                command,
                                                error: "MISSING ROLES",
                                                info: reqRoles.requiredRoles,
                                                instance: this,
                                                message,
                                                guild: message.guild
                                            }))
                                        } else {
                                            return message.reply({
                                                embed: await error({
                                                    command,
                                                    error: "MISSING ROLES",
                                                    info: reqRoles.requiredRoles,
                                                    instance: this,
                                                    message,
                                                    guild: message.guild
                                                })
                                            })
                                        }
                                    } else {
                                        return message.reply(await this.getMessage(message.guild, "MISSING_ROLES", {
                                            ROLE: message.guild.roles.cache.get(roleResult[0]).name
                                        }))
                                    }
                                } else return message.reply(await this.getMessage(message.guild, "MISSING_ROLES", {
                                    ROLE: message.guild.roles.cache.get(roleResult[0]).name
                                }))
                            }
                        }
                    }
                }
            }

            const permissions = command.requiredPermissions;
            let permResult = [];
            if (permissions && message.guild) {
                for (let i = 0; i < permissions.length; i++) {
                    const perm = permissions[i];

                    if (!message.member.hasPermission(perm)) {
                        permResult = [perm, true]
                        if (error) {
                            if (await error({
                                command,
                                error: "MISSING PERMISSION",
                                info: permResult[0],
                                instance: this,
                                message,
                                guild: message.guild
                            })) {
                                if (typeof await error({
                                    command,
                                    error: "MISSING PERMISSION",
                                    info: permResult[0],
                                    instance: this,
                                    message,
                                    guild: message.guild
                                }) === 'string') {
                                    return message.reply(await error({
                                        command,
                                        error: "MISSING PERMISSION",
                                        info: permResult[0],
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    }))
                                } else {
                                    return message.reply({
                                        embed: await error({
                                            command,
                                            error: "MISSING PERMISSION",
                                            info: permResult[0],
                                            instance: this,
                                            message,
                                            guild: message.guild
                                        })
                                    })
                                }
                            } else {
                                return message.reply(await this.getMessage(message.guild, "MISSING_PERMISSION", {
                                    PERM: permResult[0]
                                }))
                            }
                        } else return message.reply(await this.getMessage(message.guild, "MISSING_PERMISSION", {
                            PERM: permResult[0]
                        }))
                    }
                }
            }

            const requiredBotPermissions = command.requiredBotPermissions;
            let permBotResult = [];
            if (requiredBotPermissions && message.guild) {
                for (let i = 0; i < requiredBotPermissions.length; i++) {
                    const perm = requiredBotPermissions[i];

                    if (!message.guild.me.hasPermission(perm)) {
                        permBotResult = [perm, true]
                        if (error) {
                            if (await error({
                                command,
                                error: "MISSING BOT PERMISSION",
                                info: perm,
                                instance: this,
                                message,
                                guild: message.guild
                            })) {
                                if (typeof await error({
                                    command,
                                    error: "MISSING BOT PERMISSION",
                                    info: perm,
                                    instance: this,
                                    message,
                                    guild: message.guild
                                }) === 'string') {
                                    return message.reply(await error({
                                        command,
                                        error: "MISSING BOT PERMISSION",
                                        info: perm,
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    }))
                                } else {
                                    return message.reply({
                                        embed: await error({
                                            command,
                                            error: "MISSING BOT PERMISSION",
                                            info: perm,
                                            instance: this,
                                            message,
                                            guild: message.guild
                                        })
                                    })
                                }
                            } else {
                                return message.reply(await this.getMessage(message.guild, "MISSING_BOT_PERMISSION", {
                                    PERM: permBotResult[0]
                                }))
                            }
                        } else return message.reply(await this.getMessage(message.guild, "MISSING_BOT_PERMISSION", {
                            PERM: permBotResult[0]
                        }))
                    }
                }
            }

            let commandCooldown = command.cooldown;
            let globalCooldown = command.globalCooldown;
            let userCooldown = command.userCooldown;
            let now = Date.now();

            if ((commandCooldown || globalCooldown || userCooldown) && this.isDbConnected()) {
                let guildId = message.guild ? message.guild.id : "dm"
                let cooldownResult;

                if (commandCooldown) cooldownResult = await cooldownSchema.findOneAndUpdate({ _id: `${guildId}-${message.author.id}-${command.name}`, name: command.name }, { _id: `${guildId}-${message.author.id}-${command.name}` }, { upsert: true, new: true, setDefaultsOnInsert: true });
                if (globalCooldown) cooldownResult = await cooldownSchema.findOneAndUpdate({ _id: `${guildId}-${command.name}`, name: command.name }, { _id: `${guildId}-${command.name}` }, { upsert: true, new: true, setDefaultsOnInsert: true });
                if (userCooldown) cooldownResult = await cooldownSchema.findOneAndUpdate({ _id: `${message.author.id}-${command.name}`, name: command.name }, { _id: `${message.author.id}-${command.name}` }, { upsert: true, new: true, setDefaultsOnInsert: true });

                if (cooldownResult) {
                    if (cooldownResult.cooldown > now) {
                        if (error) {
                            if (await error({
                                command,
                                error: "COOLDOWN",
                                info: this.getLeftTime(cooldownResult.cooldown, now),
                                instance: this,
                                message,
                                guild: message.guild
                            })) {
                                if (typeof await error({
                                    command,
                                    error: "COOLDOWN",
                                    info: this.getLeftTime(cooldownResult.cooldown, now),
                                    instance: this,
                                    message,
                                    guild: message.guild
                                }) === 'string') {
                                    return message.reply(await error({
                                        command,
                                        error: "COOLDOWN",
                                        info: this.getLeftTime(cooldownResult.cooldown, now),
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    }))
                                } else {
                                    return message.reply({
                                        embed: await error({
                                            command,
                                            error: "COOLDOWN",
                                            info: this.getLeftTime(cooldownResult.cooldown, now),
                                            instance: this,
                                            message,
                                            guild: message.guild
                                        })
                                    })
                                }
                            } else {
                                return message.reply(await this.getMessage(message.guild, "COOLDOWN", {
                                    COOLDOWN: this.getLeftTime(cooldownResult.cooldown, now)
                                }))
                            }
                        } else return message.reply(await this.getMessage(message.guild, "COOLDOWN", {
                            COOLDOWN: this.getLeftTime(cooldownResult.cooldown, now)
                        }))
                    } else {
                        if (commandCooldown) {
                            await cooldownSchema.findOneAndUpdate({
                                _id: `${guildId}-${message.author.id}-${command.name}`,
                                name: command.name,
                            }, { cooldown: now + ms(commandCooldown) }, { upsert: true })
                        }
                        if (globalCooldown) {
                            await cooldownSchema.findOneAndUpdate({
                                _id: `${guildId}-${command.name}`,
                                name: command.name,
                            }, { cooldown: now + ms(globalCooldown) }, { upsert: true })
                        }
                        if (userCooldown) {
                            await cooldownSchema.findOneAndUpdate({
                                _id: `${message.author.id}-${command.name}`,
                                name: command.name,
                            }, { cooldown: now + ms(userCooldown) }, { upsert: true })
                        }
                    }

                }
            }

            let minArgs = command.minArgs;
            let maxArgs = command.maxArgs || -1;
            if ((minArgs !== undefined && args.length < minArgs) ||
                (maxArgs !== undefined && maxArgs !== -1 && args.length > maxArgs)) {
                if (args.length < minArgs || args.length > maxArgs) {
                    if (error) {
                        if (await error({
                            command,
                            error: "SYNTAX ERROR",
                            info: args.join(" "),
                            instance: this,
                            message,
                            guild: message.guild
                        })) {
                            if (typeof await error({
                                command,
                                error: "SYNTAX ERROR",
                                info: args.join(" "),
                                instance: this,
                                message,
                                guild: message.guild
                            }) === 'string') {
                                return message.reply(await error({
                                    command,
                                    error: "SYNTAX ERROR",
                                    info: args.join(" "),
                                    instance: this,
                                    message,
                                    guild: message.guild
                                }))
                            } else {
                                return message.reply({
                                    embed: await error({
                                        command,
                                        error: "SYNTAX ERROR",
                                        info: args.join(" "),
                                        instance: this,
                                        message,
                                        guild: message.guild
                                    })
                                })
                            }
                        } else {
                            return message.reply(await this.newSyntaxError(message.guild, command.name))
                        }
                    } else return message.reply(await this.newSyntaxError(message.guild, command.name))
                }
            }



            const _callback = command.callback || command.run || command.execute
            try {
                _callback(
                    {
                        message,
                        channel: message.channel,
                        guild: message.guild,
                        args,
                        text: args.join(" "),
                        client,
                        prefix,
                        instance: this
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
     * @param {Array<string>} owners 
     * @returns {CommandHandler} 
     */
    setBotOwner(owners) {
        if (typeof owners !== 'object') throw new TypeError('Owners must be array!');

        this.botOwners = owners;

        return this;
    }
    /**
     * 
     * @param {Array<string>} servers 
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
         * @param {DiscordJS.Guild} guild
         * @param {string} messageID 
         * @param {object} options
         * @returns {Promise<string>}
         * @expamle 
         * await instance.getMessage(message.guild, "MESSAGE ID", {
         * PREFIX: prefix
         * })
         */
    async getMessage(guild, messageID, options = {}) {
        let result;
        let lang = await this.getLanguage(guild);
        if (typeof messageID !== 'string') throw new TypeError('messageID must be a string!');
        const path = this.messagesPath;

        const messagesPath = JSON.parse(fs.readFileSync(path, 'utf8'));

        if (messageID.includes(".")) {
            let m = messageID.split(".");
            result = messagesPath[m[0]];
            for (let i = 1; i < m.length; i++) {
                let t = m[i];
                result = result[t]
            }
        } else {
            result = messagesPath[messageID];
        }
        result = result[lang];
        for (var i = 0, a = Object.keys(options); i < a.length; i++) {
            var key = a[i];
            var expression = new RegExp("{" + key + "}", 'g');
            result = result.replace(expression, options[key]);
        }
        if (!result) {
            throw new Error("Unkown message ID!");
        }
        return result;

    }

    /**
     * @param {DiscordJS.Guild} guild
     * @param {string} command 
     * @returns {Promise<string>}
     */
    async newSyntaxError(guild, command) {
        command = this.getCommand(command)
        if (!command) return console.error("You can't create syntax error with unkown command!")
        let text = await this.getMessage(guild, "SYNTAX_ERROR", {
            PREFIX: await this.getPrefix(guild),
            COMMAND: command.name,
            ARGUMENTS: command.expectedArgs || ""
        })
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
     * @returns {Array<object>}
     */
    getCategories(message) {
        let authoritativePerms = this.helpSettings.authoritativePerms || [];
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
     * @param {DiscordJS.Guild} guild 
     * @param {string} language
     * @returns {Promise<any>}
     */
    async setLanguage(guild, language) {
        let langs = ['en', 'tr']
        if (!langs.includes(language)) return console.error("Unkown language.")
        const result = await langSchema.findByIdAndUpdate(guild.id, { lang: language }, { upsert: true });

        return result;
    }
    /**
     * 
     * @param {DiscordJS.Guild} guild
     *  @returns {Promise<string>}
     */
    async getLanguage(guild) {
        let lang;

        if (this.isDbConnected()) {
            let result = await langSchema.findOneAndUpdate({ _id: guild ? guild.id : "dm" }, { _id: guild ? guild.id : "dm" }, { upsert: true, new: true, setDefaultsOnInsert: true })
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
     * @param {DiscordJS.Guild} guild
     * @returns {Promise<string>}
     */
    async getPrefix(guild) {
        let prefix;
        if (guild) {
            if (this.isDbConnected()) {
                const result = await prefixSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id }, { upsert: true, new: true, setDefaultsOnInsert: true });
                if (!result.prefix) {
                    result.prefix = this.defaultPrefix; await prefixSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id, prefix: this.defaultPrefix }, { upsert: true, new: true, setDefaultsOnInsert: true });
                };

                prefix = result.prefix;

            } else {
                prefix = this.defaultPrefix;
            }
        }
        else prefix = this.defaultPrefix;

        return prefix;
    }
    /**
     * 
     * @param {DiscordJS.Guild} guild 
     * @param {string} prefix 
     * @returns {Promise<any>}
     */
    async setPrefix(guild, prefix) {
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
        * @returns {object}
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
     * @param {DiscordJS.Guild} guild
     * @param {string} command
     * @returns {Promise<boolean>} 
     */
    async isCommandDisabled(guild, command) {
        command = this.getCommand(command)
        let result = await disableCommandsSchema.findOne({ guildID: guild.id, command: command.name });
        let returns = false
        if (result !== null) returns = true
        return returns
    }
    /**
     * 
     * @param {DiscordJS.Guild} guild 
     * @param {string} command 
     * @param {DiscordJS.Channel} channel 
     * @returns {Promise<boolean>} 
     */
    async isChannelDisabled(guild, command, channel) {
        command = this.getCommand(command)
        let output = false
        let result = await channelSchema.findOne({ guildID: guild.id, command: command.name });
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
    isDbConnected() {
        let connect = false

        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) connect = true

        return connect;
    }
    /**
     * 
     * @returns {uri}
     */
    getDbConnectionURI() {
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
    //stats

    /**
     * 
     * @param {DiscordJS.Guild} guild
     * @returns {Promise<boolean>} 
     */

    async isStatsOn(guild) {

        let result = await statsSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id }, { upsert: true, new: true, setDefaultsOnInsert: true });
        let returns;
        if (result.statu === true) returns = true
        else if (result.statu === false || result.statu === null || !result.statu) returns = false;

        return returns;
    };

    /**
     * 
     * @param {DiscordJS.Guild} guild 
     * @param {string} counter
     * @returns {Promise<boolean>} 
     */
    async isCounterOn(guild, counter) {

        let result = await statsSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id }, { upsert: true, new: true, setDefaultsOnInsert: true });

        counter = counter.toLocaleLowerCase();

        let ch = guild.channels.cache.get(result[counter].channelId);

        let returns = false;

        if (ch || ch !== null) returns = true;

        return returns;
    }

    /**
     * 
     * @param {DiscordJS.Guild} guild
     * @returns {Promise<boolean>} 
     */

    async iStatsCategoryHas(guild) {

        let result = await statsSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id }, { upsert: true, new: true, setDefaultsOnInsert: true });

        counter = counter.toLocaleLowerCase();

        let ch = guild.channels.cache.get(result.categoryId);

        let returns = false;

        if (ch || ch !== null) returns = true;

        return returns;
    }
    /**
     * 
     * @param {string} counter
     * @returns {Promise<string>} 
     */
    async getCounterName(counter, guild) {
        let lang = await this.getLanguage(guild);

        let file = JSON.parse(fs.readFileSync(path.join(__dirname, 'counterNames.json'), 'utf8'));

        let counters = ['all-members', 'members', 'bots', 'category'];

        if (!counters.includes(counter)) {
            throw new TypeError("Unkown counter.")
        }

        let name = file[counter][lang];

        if (counter === 'all-members') {
            name = name.replace(/{COUNT}/g, guild.memberCount)

        } else if (counter === 'members') {
            name = name.replace(/{COUNT}/g, guild.members.cache.filter(m => !m.user.bot).size)

        } else if (counter === 'bots') {
            name = name.replace(/{COUNT}/g, guild.members.cache.filter(m => m.user.bot).size)

        }

        return name;
    }

    //cooldown
    /**
     * 
     * @param {Date} finishDate
     * @param {Date} now
     * @returns {string}
     */
    getLeftTime(finishDate, now) {
        let leftCooldown = finishDate - now;
        let text = '';
        text = moment.duration(leftCooldown).format("d[d], h[h], m[m], s[s]");
        return text;
    }

    //blacklist
    /**
     * 
     * @param {string} userId
     * @returns {Promise<boolean>} 
     */
    async isUserInBlacklist(userId) {
        let result = await blacklistSchema.findOne({ _id: userId });
        if (result === null) return false
        else if (result !== null) return true;
    }
}




module.exports = CommandHandler