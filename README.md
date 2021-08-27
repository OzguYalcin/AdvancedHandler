# AdvancedHandler
Advanced DiscordJS Command & Feature Handler. This Command Handler is made for discord bot developers and makes botting easy.

# Installation
## NPM
```
npm install advancedhandler
```

# Topics
- [AdvancedHandler](#advancedhandler)
- [Installation](#installation)
  - [NPM](#npm)
- [Topics](#topics)
- [Setup](#setup)
- [CommandHandler Main File Methods](#commandhandler-main-file-methods)
- [Commands](#commands)
- [Features](#features)
- [Default Commands](#default-commands)

# Setup
Here is a basic example of how to setup AdvancedHandler. When calling the constructor you can pass in an options object that configures AdvancedHandler to how you want. Here is a full example of all options:

index.js
```js
const DiscordJS = require('discord.js');
const AdvancedHandler = require('advancedhandler');

const client = new DiscordJS.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    // The client is a required as the first argument.
    // The second argument is the options object and its not required.

    new AdvancedHandler.CommandHandler(client, {
        // The name of the local folder for your command files
        commandsDir: 'commands',

        // The name of the local folder for your feature files
        featuresDir: 'features',

        // The name of the local file for your message text and translations
        // Omitting this will use the own messages path
        messagesPath: '',

        // Specified the prefix your bot should use
        // Default "!"
        defaultPrefix: "$",

        // If AdvancedHandler warning should be shown or not, default true
        showWarns: true,

        // Specified the language your bot should use
        // Must be supported in your messages.json file
        // en = english, tr = turkish
        defaultLanguage: "en",

        // If your commands should not be ran by a bot, default true
        ignoreBots: true,

        // Your mongoDB connection uri. 
        // If you don't use mongoDB database some features and commands will don't work
        mongoURI: "MONGODB_CONNECTION_URI",

        // Various options for your MongoDB database connection
        dbOptions: {
            // These 4 are the default options
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        },

        // What server/guild IDs are used for testing only commands
        // Must be array
        testServers: [
            'ID1',
            'ID2',
            'ID3'
        ],

        // Specified the bot owners.
        // Must be array
        botOwners: [
            'ID1',
            'ID2',
            'ID3'
        ],

        //Specified the which default commands be disable
        //If another command the name as same. Default command will be work
        disabledDefaultCommands: [
            // 'blacklist',
            // 'channel',
            // 'command',
            // 'help',
            // 'language',
            // 'prefix',
            // 'required-roles',
            // 'stats'
        ]
    }).run()
    //This function is so important.
    //If you don't call this function "CommandHandler" will don't work

    // The client is a required as the first argument.
    // The second argument is the feature file and its not required.

    new AdvancedHandler.FeatureHandler(client, 'features')
})

client.login("YOUR TOKEN");
```

# CommandHandler Main File Methods
Here the methods for using in main file:

```js
new AdvancedHandler.CommandHandler(client)
    // It set the "ignoreBots". Must be boolean
    .setIgnoreBots(true)

    // It set the "showWarns". Must be boolean
    .setShowWarns(true)

    // It set the "botOwners". Must be array
    .setBotOwners([
        'ID1',
        'ID2',
        'ID3'
    ])

    // It set the "testServers". Must be array
    .setTestServers([
        'ID1',
        'ID2',
        'ID3'
    ])

    // It set the "messagesPath". Must be string
    .setMessagesPath("your path here")

    // It customize the help menu 
    // Must be object
    // Must specified a category.
    .setHelpSettings({
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
    })

    // It set the "defaultLanguage". Must be string
    .setDefaultLanguage("en")

    // It set the "defaultPrefix". Must be string
    .setDefaultPrefix("$")

    // It set the "disableDefaultCommands". Must be array
    .setDisableDefaultCommands([
        // 'blacklist',
        // 'channel',
        // 'command',
        // 'help',
        // 'language',
        // 'prefix',
        // 'required-roles',
        // 'stats'
    ])

    // It set the "commandsDir". Must be string
    .setCommandsDir("commands")

    // It set the "mongoURI". Must be string
    .setMongoURI("YOUR MONGODB CONNECTION URI")

    // It set the "dbOptions". Must be object
    .setDbOptions({
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
```

# Commands

## Shortcuts
 - [Ping pong command example](#ping-pong-command-example)
  - [Command properties](#command-properties)
  - [Correct argument usage](#correct-argument-usage)
  - [Bot owners only command](#bot-owners-only-command)
  - [Test servers](#test-servers)
  - [Handling command errors](#handling-command-errors)
  - [Command cooldowns](#command-cooldowns)
  - [Required user and bot permissions](#required-user-and-bot-permissions)
  - [Command categories and help settings](#command-categories-and-help-settings)
  - [Instance methods](#instance-methods)

## Ping pong command example
AdvancedHandler is easy to get setup and working. On this page you will learn how to create a simple "Ping -> Pong" command example. <br/>
First you must setup AdvancedHandler in your main file:

index.js
```js
const DiscordJS = require('discord.js')
const { CommandHandler } = require('advancedhandler')

const client = new DiscordJS.Client()

client.on('ready', () => {
    new CommandHandler(client, {
        // The name of the local folder for your command files
        commandsDir: 'commands'
    })
})

client.login("YOUR TOKEN HERE")
```
Then create a "commands" folder where you can create a "ping.js" file with the following contents:
```js
module.exports = {
    // Best practice for the built-in help menu
    category: 'Fun',
    description: 'A simple ping pong command.',
    
    // Invoked when the command is actually ran
    callback: ({ message }) => {
        message.reply("Pong!")
    }
}
```
After inviting your bot to a Discord server and running `!ping` ("!" is the default command prefix) within that server, your bot should reply with `Pong!`.

## Command properties
This page assumes you have a basic bot running using AdvancedHandler as seen [here](#ping-pong-command-example). <br/>
There are many options you have when it comes to commands, all are optional aside from a callback function which could alternatively be named run or execute as well. <br/><br/>

All commands are exported as objects who have properties to dictate the command's functionality. Here is a complete list of all current properties available to you:

```js
module.exports = {
    // The primary name of the command.
    // If omitted the name of the file will take it's place.
    name: 'ping',

    // Alternative aliases, can be an array of strings.
    aliases: ['p'],

    // The name and description of the category for the command.
    // Used in the built-in help menu.
    category: 'Fun',
    description: 'A simple ping pong command.',

    // The correct arguments to use for this command.
    // Displayed when the number of arguments is incorrect
    // from "minArgs" and "maxArgs".
    expectedArgs: '',

    // The minimum and maximum amount of arguments.
    // Tells CommandHandler when to send the correct usage of this command.
    // Setting maxArgs to -1 (the default) will allow any number of arguments.
    minArgs: 0,
    maxArgs: 0,

    //If you want to customize the syntax error message. Its in the "Error Handling" part.

    // What Discord permissions the user needs to run the command.
    // Note that invalid permissions will throw an error to prevent typos.
    requiredPermissions: ['ADMINISTRATOR'],

    // What Discord permissions the bot needs to run the command.
    // Note that invalid permissions will throw an error to prevent typos.
    requiredBotPermissions: ['MANAGE_GUILD'],

    // How long the user needs to wait before using this command again.
    // s = seconds, m = minutes, h = hours, and d = days.
    // Guild cooldowns are a per-guild system. User wait even if (s)he don't use that command
    // User cooldowns are a per-user system. User wait even if server is different

    cooldown: '10s',
    globalCooldown: '10h',
    userCooldown: '10m',

    // Forces this command to only be runnable from whitelisted user IDs.
    // You can define these IDs in the "options" object passed to the constructor.
    ownerOnly: false,

    // Forces this command to only be runnable from whitelisted guild IDs.
    // You can define these IDs in the "options" object passed to the constructor.
    testOnly: false,

    // Forces this command to only be ran in guilds rather than DMs and guilds.
    guildOnly: false,

    // The function that is invoked whenever the command is ran by a user.
    // This function can be called "run" or "execute" as well.
    // An object is passed in as an argument that provides additional data.
    // You can destructure any properties you need like so:
    callback: ({
        message,    // The DJS message object
        channel,    // The DJS channel object
        args,       // An array of arguments without the command prefix/name
        text,       // A joined string of the above arguments
        client,     // Your bot's client object
        prefix,     // The prefix used to run this command
        instance,   // Your CommandHandler instance
    }) => {}
}
```
## Correct argument usage
You can specify the exact arguments and the minimum/maximum number of arguments for each command. If the user provides an incorrect number of arguments then CommandHandler will automatically tell them the correct usage based off of the command properties you provided. Here is an example: <br/>

add.js
```js
module.exports = {
    // Best practice for the built-in help menu
    category: 'Math',
    description: 'Adds two numbers together',
    
    // For the correct usage of the command
    expectedArgs: '<Number 1> <Number 2>',
    minArgs: 2,
    maxArgs: 2,
    
    // Invoked when the command is actually ran
    callback: ({ channel, args }) => {
        // Convert the arguments into numbers
        const number1 = parseInt(args[0])
        const number2 = parseInt(args[1])
        
        const sum = number1 + number2;
        
        // Reply with the sum
        channel.send(`The sum is ${sum}`)
    }
}
```
If the user runs !add or `!add 5` your bot will respond with `Incorrect usage! Please use !add <Number 1> <Number2>.` If the user runs `!add 5 10` it will then respond with `The sum is 15`.

## Bot owners only command
Some commands should only be available to the bot owners. A perfect example of this is a "status" command that updates the status of your bot. CommandHandler comes with this capability. <br/> <br/>
Here is how your command file should be setup:

status.js
```js
const setStatus = (client, status) => {
  client.user.setPresence({
    status: 'online',
    activity: {
      name: status
    }
  })
}

module.exports = {
  // Best practice for the built-in help menu
  category: 'Math',
  description: 'Adds two numbers together',
  
  // We need at least 1 word for the status.
  // maxArgs is -1 by default which means no limit.
  minArgs: 1,
  expectedArgs: '<Status>',
  
  // Make this command owner only.
  // We will set the owner ID(s) in the next code snippet.
  ownerOnly: true,
   
  // This method is invoked anytime the command is ran
  callback: ({ client, text, message }) => {
    setStatus(client, text)
        
    message.reply('Status set!')
  },
}
```
Whenever we initialize AdvancedHandler we can pass in any number of IDs for the owner's Discord accounts:

```js
const DiscordJS = require('discord.js')
const { CommandHandler } = require('advancedhandler')

const client = new DiscordJS.Client()

client.on('ready', () => {
    new CommandHandler(client, {
        // The name of the local folder for your command files
        commandsDir: 'commands'
    })
        // User your own ID
        // If you only have 1 ID then you can pass in a string instead
        .setBotOwners(['your account ID', 'another ID', 'another ID'])
})

client.login("YOUR TOKEN HERE")
```
## Test servers
You may want some commands to only be enabled in specific servers/guilds for testing. This will give you a good idea if something is working in a production environment without risking bugs for your other users.<br/><br/>
You can easily specify a command as a "test only" command like so: <br/>

add.js
```js
module.exports = {
    // Best practice for the built-in help menu
    category: 'Math',
    description: 'Adds two numbers together',
    
    // This will now only work in test servers
    // We can specify test servers in the next code snippet
    testOnly: true,
    
    // For the correct usage of the command
    expectedArgs: '<Number 1> <Number 2>',
    minArgs: 2,
    maxArgs: 2,
    
    // Invoked when the command is actually ran
    callback: ({ channel, args }) => {
        // Convert the arguments into numbers
        const number1 = parseInt(args[0])
        const number2 = parseInt(args[1])
        
        const sum = number1 + number2;
        
        // Reply with the sum
        channel.send(`The sum is ${sum}`)
    }
}
```
You can then specify any amount of server/guild IDs when initializing AdvancedHandler like so: <br/>

index.js
```js
const DiscordJS = require('discord.js')
const { CommandHandler } = require('advancedhandler')

const client = new DiscordJS.Client()

client.on('ready', () => {
    new CommandHandler(client, {
        // The name of the local folder for your command files
        commandsDir: 'commands',
        // What server/guild IDs are test servers
        // You can use a single string if you only have one as well
        testServers: ['850796991976964136', 'another ID', 'another ID']
    })
})

client.login("YOUR TOKEN HERE")
```

## Handling command errors
CommandHandler sends an error message by default, however you might want to customize this more and perhaps send an embed instead of a normal message. You can listen to command errors to achieve this. <br/><br/>
Here is a list of all command errors you can listen for:

  | Name                   | info                             |
  | ---------------------- | -------------------------------- |
  | GUILD_ONLY_COMMAND     | null                             |
  | USER_IN_BLACKLIST      | message member                   |
  | COMMAND_DISABLED       | command object                   |
  | CHANNEL_DISABLED       | channel the message was sent     |
  | TEST_ONLY              | message guild or "dm"            |
  | BOT_OWNERS_ONLY        | message author                   |
  | MISSING_ROLES          | commands all required roles list |
  | MISSING_PERMISSION     | permissions the usser needed     |
  | MISSING_BOT_PERMISSION | permissions the bot needed       |
  | COOLDOWN               | cooldown finish date             |
  | SYNTAX_ERROR           | command text                     |
  
  To listen to command errors you can pass an error function in your command object like so:
  
  ping.js 
  ```js
  const { MessageEmbed } = require('discord.js')

module.exports = {
  // Best practice for the built-in help menu
  category: 'Fun',
  description: 'A simple ping pong command.',

  // Invoked when the command is actually ran
  callback: ({ message }) => {
    message.reply('Pong!')
  },
  
  // Invoked when there is an error when running this command
  error: {
  COMMAND_DISABLED: async ({ message, guild, command, instance, info }) => {
  const embed = new MessageEmbed()
  .setTitle("COMMAND DISABLED")
  .setDescription("This command disabled for this guild.")
  .setColor("RED");

  return message.reply("", { embed });
  },

  CHANNEL_DISABLED: async ({ message, guild, command, instance, info }) => {
   return message.reply("This command is disabled for this channel. Try another :).")
  }

  }
}
  ```
 
  ## Command cooldowns
  You can use command wait times to ensure that your commands are only run at frequent intervals. This is very useful for daily or weekly commands. There are three types of cooldowns in CommandHandler: Guild cooldowns are one system per guild. It waits even if the user doesn't use that command. User wait times are per user system. The user waits even if the server is different. But cooldown is for a server and the user on that server. User and guild must be the same for wait. 

Each cooldown type requires a string for its duration and duration type (seconds, minutes, etc.).

| Character | Duration | Minimum | Maximum | Example |
| --------- | -------- | ------- | ------- | ------- |
| s         | Seconds  | 1       | 60      | 5s      |
| m         | Minutes  | 1       | 60      | 10m     |
| h         | Hours    | 1       | 24      | 5h      |
| d         | Days     | 1       | 365     | 10d     |

Example of per-user-guild cooldowns:

daily.js
```js
module.exports = {
    // Best practice for the built-in help menu
    category: 'Economy',
    description: 'Gives you daily rewards.',
    
    // Ensure this command can only be ran once every 24 hours
    cooldown: '24h',
    
    // Invoked when the command is actually ran
    callback: () => {}
}
```

Example of per-user cooldowns:

daily.js
```js
module.exports = {
    // Best practice for the built-in help menu
    category: 'Economy',
    description: 'Gives you daily rewards.',
    
    // Ensure this command can only be ran once every 24 hours
    userCooldown: '24h',
    
    // Invoked when the command is actually ran
    callback: () => {}
}
```

Example of per-guild cooldowns: 

rewards.js
```js
module.exports = {
    // Best practice for the built-in help menu
    category: 'Economy',
    description: 'Rewards every user who reacts to the message.',
    
    // Ensure this command can only be ran once every 7 days
    globalCooldown: '7d',
    
    // Invoked when the command is actually ran
    callback: async ({ message, channel }) => {
        const { member } = message
        
        const emoji = '💰'
        const text = `React with ${emoji} to get rewards! Thanks to ${member} for hosting this reward giveaway!`
        
        const newMessage = await channel.send(text)
        newMessage.react(emoji)
  }
}
```

**You must have database for use this feature**
 
## Required user and bot permissions
You can only want your commands to be run by users with certain Discord permissions. This is usually useful for auditing tools, you just want your staff to be able to use this command.
Using AdvancedHandler you can easily determine what Discord permissions your users and bot need to run the command:

kick.js
```js
module.exports = {
  // Best practice for the built-in help menu
  category: "Moderation",
  description: "Kicks a member",
  
  expectedArgs: "<Target user's @> [Reason]",
  minArgs: 1,
  // Who can use this command
  // If you provide an incorrect string then AdvancedHandler will throw an error
  // This way you don't have to worry about about typos
  requiredPermissions: ['ADMINISTRATOR'],
  requiredBotPermissions: ['KICK_MEMBERS'],
  
  // A ban command should not be used in DMs
  guildOnly: true
  
  callback: ({message, args}) => {
  const target = message.mentions.members.first();
    
    if (!target) {
      message.reply("Please tag someone to ban!");
      return;
    }

    if (!target.bannable) {
      message.reply("This bot does not have the ability to ban that user!");
      return;
    }

    // Get the reason of the ban
    // First remove the @ from the args array
    args.shift();
    const reason = args.join(" ");

    target.ban({
      reason,
      // How many days of messages to delete
      // Must be between 0-7
      days: 5,
    });

    message.reply(`Banned ${target}!`);
  }
}
```

## Command categories and help settings
For categories and other settings to display in the built-in help menu, you must specify them when starting AdvancedHandler. 

This can be done as follows:

index.js
```js
const DiscordJS = require('discord.js');
const { CommandHandler } = require('advancedhandler');

const client = new DiscordJS.Client();

client.on('ready', () => {
 new CommandHandler(client, {
 // The name of the local folder for your command files
        commandsDir: 'commands'
 })
 .setHelpSettings({
 
 embed: {
 // can be hexcolor
 color: "GREEN"
 },
 
 // Specified the permissions can see the hidden categories.
 // Default ["ADMINISTRATOR"]
 authoritativePerms: [
     "ADMINISTRATOR",
     "KICK_MEMBERS",
     "BAN_MEMBERS"
         ],

 //Specified the categories
 categories: [
  {
   // Specified the category name.
   // If you skip this you will get error.
   name: 'Admin',
   
   // Specified the category be hidden or not
   // Only people with specified permissions can see hidden categories.
   // Default false
   hidden: true,
   
   // Specified the category emoji
   // Not required.
   emoji: "🪓",
   
   // Specified the is emoji custom or not
   // Default false
   custom: false
  },
  {
  // For custom emoji 
  
  // emoji = emojiId
  emoji: "861615112750366731",
  
  // And custom must be true
  custom: true,
  
  name: 'Example',
  hidden: false
  }
 ]
 })
}
```

## Instance methods

AdvancedHandler has many functions that will make your job easier. These methods make it easier to write your code.

Here's All:

### Shortcuts
- [Message methods](#message-methods)
  - [getMessage](#getmessage)
  - [newSyntaxError](#newsyntaxerror)
- [Language Methods](#language-methods)
  - [setLanguage](#setlanguage)
  - [getLanguage](#getlanguage)
- [Prefix methods](#prefix-methods)
  - [setPrefix](#setprefix)
  - [getPrefix](#getprefix)
- [Command methods](#command-methods)
  - [isCommandHas](#iscommandhas)
  - [getCommand](#getcommand)
  - [isCommandDisabled](#iscommanddisabled)
  - [isChannelDisabled](#ischanneldisabled)
- [mongoDB methods](#mongodb-methods)
  - [isDbConnected](#isdbconnected)
  - [getDbConnectionURI](#getdbconnectionuri)


### Message methods

#### getMessage

This method is for get message from messages file. This method will translate and replace the text automatically.

messages.json snippet
```json
{
  "TEST": {
   "en": "Just a test text!",
   "tr": "Sadece bir test metini!"
  }
}
```
For get "TEST" you should use this:

test.js
```js
module.exports = {
callback: async ({ message, instance }) => {
  const { guild } = message
return message.reply(await instance.getMessage(guild, "TEST"));
 }
}
```
If you ran the `!test` in a server it will reply with "Just a test text!". If that server was configured to Turkish it will reply with "Sadece bir test metini!" instead. 

You can set dynamic placeholders in your messages like so:

messages.json snippet
```json
{
  "EXAMPLE": {
    "en": "An example message. {TEST}",
    "tr": "Bir örnek messajı. {TEST}"
  }
}
```
You can then dynamically insert values like so:

example.js
```js
module.exports = {
  callback: ({ message, instance }) => {
    const { guild } = message
    message.reply(await instance.getMessage(guild, 'EXAMPLE', {
      TEST: 'hello world'
    }))
  },
}
```
Now running `!example` will now display `An example message. hello world`

For get objects (embeds):

messages.json snippet
```json
{
  "HELP": {
        "TITLE": {
            "en": "Need help? Here are all of my commands:",
            "tr": "Yardımamı ihtiyacın var? İşte tüm komutlarım:"
        },
        "DESCRIPTION": {
            "en": "Use {PREFIX}help followed by a command name to get more additional information on a command. For example: \"{PREFIX}help prefix\".",
            "tr": "Bir komut hakkında daha fazla bilgi almak için {PREFIX}help ve ardından bir komut adını kullanın. Örneğin: \"{PREFIX}help prefix\"."
        }
    }
}
```

For get "DESCRIPTION" 

```js
await instance.getMessage(guild, "HELP.TITLE", { 
  PREFIX: prefix 
})
```

#### newSyntaxError
This method will create new syntax error.

example.js
```js
module.exports = {
 expectedArgs: "<tag user>",
 callback: async ({ message, instance}) => {
  let user = message.mentions.users.first();

  if(!user) {
    // Command is the command name (example for this command)
  return await instance.newSyntaxError(command, guild);
  } else {
    return message.reply(`You tag thi guy "${user}".`)
  }
 }
}
```
If you ran `!example` it will return you `Incorrect usage! Please use \"!example <tag user>\"`. If have no "expectedArgs" its return you `Incorrect usage! Please use \"!example\"`. So you should add "expectedArgs".

### Language Methods

#### setLanguage
This method will set new language to the mongo database.

```js
  await instance.setLanguage(guild, "tr")
```

#### getLanguage
This method will get the guilds language. If have no guild return the default language. If have no default language, default language will "en" (english)

```js
  await instance.getLanguage(guild);
```
If you ran this command it will return "This guild language is "en"."

### Prefix methods

#### setPrefix
This method will set new prefix to the mongo database.

```js
  await instance.setPrefix(guild, prefix)
```


#### getPrefix
This method will get guild prefix. If have no guild will return default prefix.If have no default prefix, default prefix is "

```js
await instance.getPrefix(guild);
```

### Command methods

#### isCommandHas
This method check the command has or not. Aliases will work too

```js
instance.isCommandHas("command name")
```

#### getCommand
This method will return the command object you write. Aliases will work too but if you write aliases command.name will not the aliases.,

```js
instance.getCommand("command name")
```

#### isCommandDisabled
This method will check the command disabled for the guild. Aliases will work

```js
//return boolean
await instance.isCommandDisabled(guild, "command name");
```

#### isChannelDisabled
This method check the channel is disabled for the command. Aliases will work

```js
await instance.isChannelDisabled(guild, channel, "command name")
```

### mongoDB methods

#### isDbConnected
This method will check the mongoDB connected or not.

```js
instance.isDbConnected()
```

#### getDbConnectionURI
This method will return the mongoDB connection uri

```js
instance.getDbConnectionURI()
```

# Features
A "feature" within AdvancedHandler is a normal feature within your bot. This could be a "reaction roles" system, or a "welcome message" system. A feature could include multiple event listeners and other logic to handle how your bot works. AdvancedHandler makes it easy to register features by adding them to a features folder. 

The folder name can be specified when initializing AdvancedHandler like so:

index.js
```js
const DiscordJS = require('discord.js');
const AdvancedHandler = require('advancedhandler');

const client = new DiscordJS.Client();

client.on('ready', () => {
  new AdvancedHandler.FeatureHandler(client, 'features');
})

client.login("YOUR TOKEN");
```

You can then create a "features" folder and all of your features can be placed in that folder. These files will be automatically imported and ran and it is assumed that these files will export a function like so:

welcome-message.js 
```js
module.exports = (client) => {
  // Listen for new members joining a guild
  client.on("guildMemberAdd", (member) => {
    // Access the guild that they joined
    const { guild } = member

    // Get the channel named "welcome"
    const channel = guild.channels.cache.find(
      (channel) => channel.name === "welcome"
    )
    
    // Ensure this channel exists
    if (!channel) {
      return
    }

    // Send the welcome message
    channel.send(`Welcome ${member} to the server!`)
  })
}
```
This feature will be automatically ran and it's exported function will be invoked. This way you can easily register listeners and handle each of your feature's.

# Default Commands

## Shortcuts
- [Seting removing and cleaning blacklist](#seting-removing-and-cleaning-blacklist)
- [Enabling and disabling commands](#enabling-and-disabling-commands)
- [Configurable required roles](#configurable-required-roles)
- [Per-guild prefixes](#per-guild-prefixes)
- [Customizable messages & per-guild languages](#customizable-messages--per-guild-languages)
- [Per-guild language configuration](#per-guild-language-configuration)
- [Storing custom messages and translations](#storing-custom-messages-and-translations)
- [Global syntax errors](#global-syntax-errors)
- [Customizable channel specific commands](#customizable-channel-specific-commands)
- [Help](#help)
- [Server Stats](#server-stats)
  

## Seting removing and cleaning blacklist 
Advancedhandler comes with the ability for bot owner(s) make some users can or not use the bot's commands. Also this command can clean the the all blacklist. They can do this easily with the following command:

(For use this command you should specified the bot owner(s). If you don't specified the bot owner(s) command can't be used.)

```!blacklist <set | delete | clean> <tag user | userId>```

## Enabling and disabling commands
AdvancedHandler comes with the ability for server owners using your bot to enable or disable commands within their server/guild. They can do this easily with the following command:

```!command <enable | disable> <command>```

## Configurable required roles
Server/guild owners can configure what roles are required to use specific commands. This is not done through IDs or role names as those will vary between each guild. Instead each server owner can run a command to specify what role is required or unrequired to use a command like so:

```!required-roles <add | remove> <command> <role id | mention role>```

If you use the "remove" option it will make the role unrequired

## Per-guild prefixes
Server/guild owners can configure what prefix your bot uses by using the following command:

```!prefix <prefix>```

Omitting the prefix will display the current prefix for that server/guild. The default prefix for AdvancedHandler is a `!` however you can specify a custom default prefix with the following:

index.js
```js
const DiscordJS = require('discord.js')
const { CommandHandler } = require('advancedhandler')

const client = new DiscordJS.Client()

client.on('ready', () => {
    new CommandHandler(client, {
        // The name of the local folder for your command files
        commandsDir: 'commands'
    })
        // Set the default prefix
        // The default is "!"
        .setDefaultPrefix('?')
})

client.login("YOUR TOKEN HERE")
```

## Customizable messages & per-guild languages
AdvancedHandler offers the ability to customize messages as well as translate messages into different languages. Server/guild owners can then specify what language should be used in their server/guild.

## Per-guild language configuration
Server owners can use the following command to set what language your bot should used:

```!language <language>```

## Storing custom messages and translations
As the developer you can create a messages.json file that contains your own text and translations. There are two types of objects within this file: direct messages and embeds. Direct messages will be a single message in different languages, while embeds will contain different types of fields. An example of each:

Direct Messages
```json
"COOLDOWN": {
        "en": "You must wait {COOLDOWN} before using that command again.",
        "tr": "Komutu kullanmadan önce {COOLDOWN} kadar süre beklemelisiniz."
    }
```

Embeds
```json
"HELP": {
        "TITLE": {
            "en": "Need help? Here are all of my commands:",
            "tr": "Yardımamı ihtiyacın var? İşte tüm komutlarım:"
        },
        "DESCRIPTION": {
            "en": "Use {PREFIX}help followed by a command name to get more additional information on a command. For example: \"{PREFIX}help prefix\".",
            "tr": "Bir komut hakkında daha fazla bilgi almak için {PREFIX}help ve ardından bir komut adını kullanın. Örneğin: \"{PREFIX}help prefix\"."
        }
    }
```
You can find the default messages.json [here](https://github.com/OzguYalcin/AdvancedHandler/blob/main/messages.json)

You will also need to define where your messages.json file lives in the AdvancedHandler constructor like so:

index.js 
```js
// Assumes messages.json is in the same directory as this code's file
new AdvancedHandler.CommandHandler(client, {
    commandsDir: 'commands',
    messagesPath: 'messages.json'
})
```

## Global syntax errors
In a lot of cases your syntax errors will be very similar. You can specify a global syntax error within your `messages.json` file like so:

messages.json snippet
```json
"SYNTAX_ERROR": {
        "en": "Incorrect usage! Please use \"{PREFIX}{COMMAND} {ARGUMENTS}\"",
        "tr": "Yanlış kullanım! Lütfen \"{PREFIX}{COMMAND} {ARGUMENTS}\" kullanın."
    }
```
 The {PREFIX}, {COMMAND} and {ARGUMENTS} must always be in upper case. These will be replaced with the correct content when an error occurs. The {ARGUMENTS} variable must be specified in the command like so:

 ping.js 
 ```js
 ping.js
module.exports = {
  minArgs: 1,
  maxArgs: -1, // -1 means no limit
  expectedArgs: "<Target user's @>",
  callback: ({ message }) => {
    message.reply('Pong!')
  }
}
 ```
 A per-command syntax error message will always overwrite a global one for that specific command.

## Customizable channel specific commands
 Server owners using your bot can set some commands or all to only be ran in specific channels within their server. They can do this with the following:
`!channel <enable | disable> <command | all> <tag channel | tag channels>`
If a user attempts to use a command in the wrong channel then they will be told what channels they are allowed to use.

## Help
Allows users to see which commands the bot has and detailed information about these commands. 

If ran `!help` it show the categories and the all commands. But if ran `!help [command]` show the commands detail information.

## Server Stats 
It allows users and server/guild owners to see server/guild statistics. There are three types of counters: "all-members", "members" and "bots". This feature can be turned off. They can do this with the following:

`!stats <on | off>`