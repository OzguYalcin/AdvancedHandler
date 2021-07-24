const getAllFiles = require('./get-all-files');
const DiscordJS = require('discord.js');
const path = require('path');
const fs = require('fs')

/**
 * @constructor
 * @param {DiscordJS.Client|any} client - DiscordJS Client
 * @param {string} featuresDir - Features Directory
 * @example
 * new AdvancedHandler.FeatureHandler(client 'features');
 * @returns
 */

class FeatureHandler {
    constructor(client, featuresDir) {
        if (!client) throw new TypeError(`AdvancedHandler > No client specified`);
        if (!featuresDir) featuresDir = 'features', console.warn(`AdvancedHandler > No features directory specified. Using "features".`);
         
        this.featuresDir = featuresDir

        var files = getAllFiles(this.featuresDir);
            var amount = files.length;
            if (amount <= 0) {
                return;
            }
            console.log("AdvancedHandler > Loaded " + amount + " feature" + (amount === 1 ? "" : "s") + ".");
            for (var _c = 0, files_1 = files; _c < files_1.length; _c++) {
                var _d = files_1[_c], file = _d[0], fileName = _d[1];
                file = path.join(__dirname, _d[0])
                const C = file.split("\\")[0];
                const Path = file.split("\\")[1];
                file = `${C}\\${Path}\\${_d[0]}`

                const command = require(file);

                command(client);
            }

    }
}

module.exports = FeatureHandler