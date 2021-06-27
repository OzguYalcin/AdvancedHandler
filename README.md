# Advanced Handler
Advanced DiscordJS Command &amp; Feature Handler. This Command Handler is made for discord bot developers and makes botting easy.

# Installation

## NPM 

```
npm install advancedhandler
```

## How we use this Advanced Handler in main file

```js
const DiscordJS = require('discord.js');

const client = new DiscordJS.Client();

const AdvancedHandler = require('./AdvancedHandler/index.js');

new AdvancedHandler(client, {
    commandsDir: 'commands', //Must be string, this is specified our commands directory.
    featuresDir: 'features', //Must be string, this is specified our features (events) directory.
    defaultPrefix: '/', //Must be string, this is specified our default prefix.
    ignoreBots: true, //Must be boolen, this is specified the bot ignore another bots or not.
    showWarns: true, //Must be boolen, this is specified the bot show warns or not.
    disableDefaultCommands: [
        //'prefix',
        //'requiredroles'
    ], //Must be array, this is disable the handlers command.
    botOwners: ['123456789', '12345678'], //It can be string if have 1 owner, it specified the bot owners.
    testServers: ['123456789', '12345678'], //It can be string if have 1 test servers, it specified the bot test servers.
    messagesPath: 'messages.json', /* It should be string, It specified the messages path. If you leave this blank,
    it will automatically set its own messagesPath. And if you set your own messagesPath you should write the handler own messagesPath to your
    own messagesPath*/
    mongoURI: 'YOUR SECRET URI', //Must be string, this is specified your mongoDB connection uri
    dbOptions: {
        keepAlive: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
    } //Must be an object, this is specified the mongoDB connection options. If you don't set this handler do automatically set own options.
})

client.login("YOUR SECRET TOKEN");
```
Everything you need to do to use it and everything needed for the main file is written in the lines of code above

## How we use this Advanced Handler in command file
```js
module.exports = {
    name: 'hello',
    aliases: ['hi'], //Must be array
    cooldown: '5s',
    minArgs: 0,
    maxArgs: 1,
    expectedArgs: '<optional text>', 
    requiredPermissions:['ADMINISTRATOR'], //Must be array
    guildOnly: true,
    ownerOnly: true,
    testOnly: true,
    callback: async ({client, message, args, prefix, instance}) => { //callback or execute or run
    message.reply('Hi!');
    }
}
```
What kind of features are in the commands file and how to use it is written in the above line of code

### Command file callbacks and their meanings

#### client:

Your discord.js client.

#### message: 

Discord.js message.

#### args: 

Discord.js message arguments.

#### prefix:

Your bot prefix .

#### instance:

Instance allows you to use the functions of the AdvancedHandler package in your command file, and these functions are:

```js
instance.getMessage(instance, "message name here"); //Get message in messages path

instance.getPrefix(guild, instance); //Get guild prefix

instance.getDBConnectURI(instance); //Get mongoDB Connection URI

instance.getLeftTime("cooldown finish date here", "Date now"); //Find the left time to cooldown finish

instance.isCommandHas("command name here", instance); //Check the command has or not

instance.isDBConnected(); //Check the DB is connected or not

instance.newSytnaxError("prefix", "command name here", "arguments (expectedArgs)", instance); //Create new sytnax error

```
how the functions are used and what they do is written in the above line of code

## How we use this Advanced Handler in feature file

```js
module.exports = client => {
    client.on('ready', () => {
        console.log('I am ready!')
    })
}
```

How it is used is shown in the above line of code. Codes are subject to change.
