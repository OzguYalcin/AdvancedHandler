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
const Discord = require('discord.js');

const client = new Discord.Client();

const config = require('./config.json');

const Handler = require('advancedhandler');

const CommandHandler = new Handler.CommandHandler(client, {
    commandsDir: 'commands', //Must be string, this is specified our commands directory.
    defaultPrefix: '!', //Must be string, this is specified our default prefix. If have no prefix using "!".
    ignoreBots: false, //Must be boolean, this is specified the bot ignore another bots or not.
    showWarns: true, //Must be boolean, this is specified the bot show warns or not.
    disableDefaultCommands: [
        'prefix',
        'requiredroles'
    ], //Must be array, this is disable the handlers command.
    botOwners: ['123456789', '12345678', '583239996803121152'], //It can be string if have 1 owner, it specified the bot owners.
    testServers: ['123456789', '12345678', '850796991976964136'], //It can be string if have 1 test servers, it specified the bot test servers.
    /*messagesPath: 'messages.json', /* It should be string, It specified the messages path. If you leave this blank,
    it will automatically set its own messagesPath. And if you set your own messagesPath you should write the handler own messagesPath to your
    own messagesPath*/
    mongoURI: config.MONGO_URI, //Must be string, this is specified your mongoDB connection uri
    dbOptions: {
        keepAlive: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
    }, //Must be an object, this is specified the mongoDB connection options. If you don't set this handler do automatically set own options.
}).run();

const FeatureHandler = new Handler.FeatureHandler(client, 'features');

client.login(config.TOKEN);
```

### Main File Functions

```js
.setDefaultPrefix("prefix")
.setCommandsDir("commands directory")
.setMongoURI(config.MONGO_URI)
.setDisableDefaultCommands([
        'prefix',
        'requiredroles'
])
.setShowWarns('true or false')
.setIgnoreBots('true or false')
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
.getPrefix(guild) // returns prefix.

.getMessage(messageName) // returns message from messages path.

.newSyntaxError(commandName, args) //create new syntax error.

.isCommandHas(commandName) // check the command has.

.getCommand(commandName) //return command from commands collection.

.getDBConnectURI() // returns mongoDB connection URI.

.isDBConnected() // check the mongoDB connected.
```

## Feature File

```js
module.exports = client => {
    client.on('ready', () => {
        console.log('I am ready!' + ' ' + client.user.tag)
    })
}
```
