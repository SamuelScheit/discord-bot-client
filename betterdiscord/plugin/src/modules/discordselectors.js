import DiscordClassModules from "./discordclassmodules";
import DOMTools from "./domtools";

const getSelectorAll = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return `.${this[prop].split(" ").join(".")}`;
};

const getSelector = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return `.${this[prop].split(" ")[0]}`;
};

/**
 * Gives us a way to retrieve the internal classes as selectors without
 * needing to concatenate strings or use string templates. Wraps the
 * selector in {@link module:DOMTools.Selector} which adds features but can 
 * still be used in native function.
 * 
 * For a list of all available class namespaces check out {@link module:DiscordClassModules}.
 * 
 * @see module:DiscordClassModules
 * @module DiscordSelectors
 * @version 0.1.0
 */
const DiscordSelectors = new Proxy(DiscordClassModules, {
    get: function(list, item) {
        if (item == "getSelectorAll" || item == "getSelector") return (module, prop) => DiscordSelectors[module][item]([prop]);
        if (list[item] === undefined) return new Proxy({}, {get: function() {return "";}});
        return new Proxy(list[item], {
            get: function(obj, prop) {
                if (prop == "getSelectorAll") return getSelectorAll.bind(obj);
                if (prop == "getSelector") return getSelector.bind(obj);
                if (!obj.hasOwnProperty(prop)) return "";
                return new DOMTools.Selector(obj[prop]);
            }
        });
    }
});

export default DiscordSelectors;