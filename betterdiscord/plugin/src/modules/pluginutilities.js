import Logger from "./logger";
import Utilities from "./utilities";
import DOMTools from "./domtools";

import DCM from "../ui/discordcontextmenu";

/**
 * A series of useful functions for BetterDiscord plugins.
 * @module PluginUtilities
 * @version 0.2.5
 */


 export default class PluginUtilities {

    /**
     * Loads data through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {string} key - which key the data is saved under
     * @param {object} defaultData - default data to populate the object with
     * @returns {object} the combined saved and default data
    */
    static loadData(name, key, defaultData) {
        const defaults = Utilities.deepclone(defaultData);
        try { return Utilities.extend(defaults ? defaults : {}, BdApi.getData(name, key)); }
        catch (err) { Logger.err(name, "Unable to load data: ", err); }
        return defaults;
    }

    /**
     * Saves data through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {string} key - which key the data should be saved under
     * @param {object} data - data to save
    */
    static saveData(name, key, data) {
        try { BdApi.setData(name, key, data); }
        catch (err) { Logger.err(name, "Unable to save data: ", err); }
    }

    /**
     * Loads settings through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {object} defaultData - default data to populate the object with
     * @returns {object} the combined saved and default settings
    */
    static loadSettings(name, defaultSettings) {
        return this.loadData(name, "settings", defaultSettings);
    }

    /**
     * Saves settings through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {object} data - settings to save
    */
    static saveSettings(name, data) {
        this.saveData(name, "settings", data);
    }

    /**
     * Get the full path to the BetterDiscord folder.
     * @returns {string} full path to the BetterDiscord folder
     */
    static getBDFolder(subtarget = "") {
        const process = require("process");
        const path = require("path");
        if (process.env.injDir) return path.resolve(process.env.injDir, subtarget);
        switch (process.platform) {
            case "win32":
                return path.resolve(process.env.appdata, "BetterDiscord/", subtarget);
            case "darwin":
                return path.resolve(process.env.HOME, "Library/Preferences/", "BetterDiscord/", subtarget);
            default:
                return path.resolve(process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : process.env.HOME + "/.config", "BetterDiscord/", subtarget);
        }
    }

    /**
     * Get the full path to the plugins folder.
     * @returns {string} full path to the plugins folder
     */
    static getPluginsFolder() {
        return this.getBDFolder("plugins/");
    }

    /**
     * Get the full path to the themes folder.
     * @returns {string} full path to the themes folder
     */
    static getThemesFolder() {
        return this.getBDFolder("themes/");
    }

    /**
     * Adds a callback to a set of listeners for onSwitch.
     * @param {callable} callback - basic callback to happen on channel switch
     */
    static addOnSwitchListener(callback) {
        require("electron").remote.getCurrentWebContents().on("did-navigate-in-page", callback);
    }

    /**
     * Removes the listener added by {@link InternalUtilities.addOnSwitchListener}.
     * @param {callable} callback - callback to remove from the listener list
     */
    static removeOnSwitchListener(callback) {
        require("electron").remote.getCurrentWebContents().removeListener("did-navigate-in-page", callback);
    }

    /**
     * Adds a style to the document.
     * @param {string} id - identifier to use as the element id
     * @param {string} css - css to add to the document
     */
    static addStyle(id, css) {
        document.head.append(DOMTools.createElement(`<style id="${id}">${css}</style>`));
    }

    /**
     * Removes a style from the document.
     * @param {string} id - original identifier used
     */
    static removeStyle(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    /**
     * Adds/requires a remote script to be loaded
     * @param {string} id - identifier to use for this script
     * @param {string} url - url from which to load the script
     * @returns {Promise} promise that resolves when the script is loaded
     */
    static addScript(id, url) {
        return new Promise(resolve => {
            const script = document.createElement("script");
            script.id = id;
            script.src = url;
            script.type = "text/javascript";
            script.onload = resolve;
            document.head.append(script);
        });
    }

    /**
     * Removes a remote script from the document.
     * @param {string} id - original identifier used
     */
    static removeScript(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    static async getContextMenu(type) {
        return DCM.getDiscordMenu(type);
    }

    static forceUpdateContextMenus() {
        return DCM.forceUpdateMenus();
    }
}


