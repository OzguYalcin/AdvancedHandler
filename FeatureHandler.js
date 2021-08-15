const getAllFiles = require('./get-all-files');
const DiscordJS = require('discord.js');
const path = require('path');
const fs = require('fs')

/**
 * @constructor
 * @param {DiscordJS.Client} client - DiscordJS Client
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
        let defaultFiles = getAllFiles(path.join(__dirname, "features"));
        for (var _c = 0, files_1 = defaultFiles; _c < files_1.length; _c++) {
            var _d = files_1[_c], file = _d[0], fileName = _d[1];
            const command = require(file);

            command(client);
        }
        var files = getAllFiles(path.join(require.main.path, this.featuresDir));
        var amount = files.length;
        if (amount <= 0) {
            return;
        }
        console.log("AdvancedHandler > Loaded " + amount + " feature" + (amount === 1 ? "" : "s") + ".");
        for (var _c = 0, files_1 = files; _c < files_1.length; _c++) {
            var _d = files_1[_c], file = _d[0], fileName = _d[1];
            const command = require(file);

            command(client);
        }
    }
}

module.exports = FeatureHandler