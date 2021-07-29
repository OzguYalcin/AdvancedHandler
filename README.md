# AdvancedHandler
Advanced DiscordJS Command &amp; Feature Handler. This Command Handler is made for discord bot developers and makes botting easy.

# Installation

## NPM

```
npm install advancedhandler
```

# Usage

## Main File

```js
const DiscordJS = require('discord.js');

const AdvancedHandler = required('advancedhandler');

const client = new DiscordJS.Client();

client.on('ready', () => {
    console.log('I am ready!');

    new AdvancedHandler.CommandHandler(client, {
        //Specified the commands dir. Must be string.
        commandsDir: 'commands',
        //Specified the default prefix. Must be string.
        defaultPrefix: '$',
        //Specified the disabled default commands. Must be array.
        disableDefaultCommands: [
            'channel',
            'command',
            'help',
            'language',
            'prefix',
            'required-roles'
        ],
        //Specified the bot owners. Must be array.
        botOwners: [
            'ID 1',
            'ID 2'
        ],
        //Specified the bot test servers. Must be array.
        testServers: [
            'ID 1',
            'ID 2',
        ],
        //Specified the bot ignore the bots or not. Must be boolean.
        ignoreBots: true,
        //Specified the bot show warns or not. Must be boolean.
        showWarns: true,
        //Specified the messagesPath. Must be string.
        //If you write your own path you must copy default path then paste to the your path.
        messagesPath: 'messages.json',
        //Specified the mongoDB connection URI. Must be string.
        mongoURI: 'YOUR SECRET URI',
        //Specified the mongoDB connection options. Must be object.
        dbOptions: {
        keepAlive: true, 
        useNewUrlParser: true,
        useUnifiedTopology: true, 
        useFindAndModify: false
        }
    }).run();
    //If you don't use the run function CommandHandler not work and run function must be used last.

    new AdvancedHandler.FeatureHandler(client, 'features') 
    // Second parametre is specified your features dir. Must be string
})
```

### Main File Functions

```js
.setDefaultPrefix("NEW_PREFIX")
.setCommandsDir("NEW_DIRECTORY")
.setMongoURI("YOUR_SECRET_MONGO_URI")
.setDisableDefaultCommands([
        'channel',
        'command',
        'help',
        'language',
        'prefix',
        'required-roles'
])
.setShowWarns(true) //Must be boolean
.setIgnoreBots(true)
.setBotOwners([
'owner ID',
'owner ID'
])
.setTestServers([
'server ID',
'server ID',
])
.setMessagesPath('Your own messages path')
.setDbOptions('Your mongoDB connection options')
 .setHelpSettings({
     embed: {
        color: "RED"
     }
        authoritativePerms: [
            "ADMINISTRATOR",
            "KICK_MEMBERS",
            "BAN_MEMBERS"
        ],
        categories: [
            {
                name: "Admin",
                emoji: "861615112750366731",
                custom: true,
                hidden: true
            },
            {
                name: "Fun",
                emoji: "😄",
                custom: false,
                hidden: false
            }
        ]
    })
.setDefaultLanguage("en") // en or tr (tr = turkish, en = english)
.run() // This function must be the last used function
```

## Command File
```js
module.exports = {
    name: 'hello', //Must be string
    aliases: ['hi'], //Must be array
    cooldown: '5s', //Must be string
    minArgs: 0, //Must be number
    maxArgs: 1, //Must be number
    expectedArgs: '<optional text>',
    requiredPermissions: ['MANAGE_GUILD'], //Must be Array
    requiredBotPermissions: ['MANAGE_GUILD'], //Must be Array 
    guildOnly: true, //Must be boolean
    ownerOnly: true, //Must be boolean
    testOnly: true, //Must be boolean
    callback: async ({ client, message, args, prefix, instance }) => { //callback or execute or run
        message.reply('Hi! My prefix is ' + prefix + '.');
    }
}
```
### Callback parametters

#### client:

Your discord.js client.

#### message:

Your discord.js message.

#### args:

Your message arguments.

#### prefix:

Bots prefix.

#### instance:
CommandHandler's "this".

##### Instance functions:

```js
//Lang
await setLanguage(guild, language);
await getLanguage(guild);

//Prefix
await setPrefix(guild, prefix);
await getPrefix(guild);

//Commands
isCommandHas(command);
getCommand(command)
await isCommandDisabled(guild, command)
await isChannelDisabled(guild, command, channel)
//channel is not the channel name channel collection.

//mongoDB
getDBConnectURI();
isDBConnected();

//message
await getMessage(guild, messageID, options)
//options example:
//{
//     PREFIX:prefix,
//     COOLDOWN: cooldown,
//     LANG: language,
//     COMMAND: command,
//     ARGUMENTS: arguments,
//     ROLE: role,
//     PERM: permission,
//     CHANNELS: channels,
//     CHANNEL: channel
// }
//Return the message from messages path and it replace the "prefix, cooldown, language, command, arguments, role, perm, channels, channel"
//If there are variables in the text you want to write, here are the equations:
// {PREFIX} = specified prefix.
// {COOLDOWN} = specified cooldown.
// {LANG} = specified language.
// {COMMAND} = specified command name.
// {ARGUMENTS} = specified expectedArgs.
// {ROLE} = specified role.
// {PERM} = specified permission.
// {CHANNELS} = specified some channels.
// {CHANNEL} = specified a channel.

await newSyntaxError(guild, command, args)
//example
//If you use like this: 
//await newSyntaxError(guild, "required-roles", "[add | remove] [command name] [role id | mention role]")
//Return this:
//"{PREFIX}required-roles [add | remove] [command name] [role id | mention role]
//and it replace the "{PREFIX}"
```

## Feature File

```js
module.exports = client => {
    client.on('ready', () => {
        console.log('I am ready!' + ' ' + client.user.tag)
    })
}
```

# CommandHandler Default Commands
## Channel
name: Channel <br />
aliases: null <br />
category: Configuration <br />
description: Enables or disables a command (or all) for a channel or some channel. <br />
usage: {PREFIX}channel [enable | disable] [command | all] [tag channel | tag channels] <br />

## Command
name: Command
aliases: null <br />
category: Configuration <br />
description: Makes a command enable or disable for this guild <br />
usage: {PREFIX}command [enable | disable] [command] <br />

## Help 
name: Help <br />
aliases: command <br />
category: Help <br />
description: Displays this bot's commands <br />
usage: {PREFIX}help [command] <br />

## Language
name: language <br />
aliases: lang <br />
category: Configuration <br />
description: Displays or sets the language for this Discord server <br />
usage: {PREFIX}language [language] <br /> 

## Prefix
name: prefix <br />
aliases: null <br />
category: Configuration <br />
description: Displays or sets the prefix for the current guild <br />
usage: {PREFIX}prefix [prefix] <br />

## Required-roles
name: required-roles <br />
aliases: reqroles, requiredroles, reqrole, required-role <br />
category: Configuration <br />
description: Specifies what role each command requires. <br />
usage: {PREFIX}required-roles [add | remove] [command name] [role id | mention role] <br />