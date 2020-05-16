import DiscordClassModules from "./discordclassmodules";
import DOMTools from "./domtools";

const getRaw = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return this[prop];
};

const getClass = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return this[prop].split(" ")[0];
};

/**
 * Proxy for all the class packages, allows us to safely attempt
 * to retrieve nested things without error. Also wraps the class in
 * {@link module:DOMTools.ClassName} which adds features but can still
 * be used in native function.
 * 
 * For a list of all available class namespaces check out {@link module:DiscordClassModules}.
 * 
 * @see module:DiscordClassModules
 * @module DiscordClasses
 * @version 0.1.0
 */
const DiscordModules = new Proxy(DiscordClassModules, {
    get: function(list, item) {
        if (item == "getRaw" || item == "getClass") return (module, prop) => DiscordModules[module][item]([prop]);
        if (list[item] === undefined) return new Proxy({}, {get: function() {return "";}});
        return new Proxy(list[item], {
            get: function(obj, prop) {
                if (prop == "getRaw") return getRaw.bind(obj);
                if (prop == "getClass") return getClass.bind(obj);
                if (!obj.hasOwnProperty(prop)) return "";
                return new DOMTools.ClassName(obj[prop]);
            }
        });
    }
});
export default DiscordModules;