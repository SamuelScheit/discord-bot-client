import * as Modules from "modules";
import {Settings, ContextMenu, Tooltip, EmulatedTooltip, Toasts, Popouts, Modals, DiscordContextMenu} from "ui";

const Library = {};
Library.DiscordContextMenu = DiscordContextMenu;
Library.DCM = DiscordContextMenu;
Library.ContextMenu = ContextMenu;
Library.Tooltip = Tooltip;
Library.EmulatedTooltip = EmulatedTooltip;
Library.Toasts = Toasts;
Library.Settings = Settings;
Library.Popouts = Popouts;
Library.Modals = Modals;
for (const mod in Modules) Library[mod] = Modules[mod];

const config = require(process.env.CONFIG_PATH);
const baseModule = require(process.env.PLUGIN_PATH);
const pluginFunction = baseModule.default ? baseModule.default : baseModule;

const getBoundLibrary = () => {
    const name = config.info.name;
    const BoundAPI = {
        Logger: {
            stacktrace: (message, error) => Library.Logger.stacktrace(name, message, error),
            log: (...message) => Library.Logger.log(name, ...message),
            error: (...message) => Library.Logger.err(name, ...message),
            err: (...message) => Library.Logger.err(name, ...message),
            warn: (...message) => Library.Logger.warn(name, ...message),
            info: (...message) => Library.Logger.info(name, ...message),
            debug: (...message) => Library.Logger.debug(name, ...message)
        },
        Patcher: {
            getPatchesByCaller: () => {return Library.Patcher.getPatchesByCaller(name);},
            unpatchAll: () => {return Library.Patcher.unpatchAll(name);},
            before: (moduleToPatch, functionName, callback, options = {}) => {return Library.Patcher.before(name, moduleToPatch, functionName, callback, options);},
            instead: (moduleToPatch, functionName, callback, options = {}) => {return Library.Patcher.instead(name, moduleToPatch, functionName, callback, options);},
            after: (moduleToPatch, functionName, callback, options = {}) => {return Library.Patcher.after(name, moduleToPatch, functionName, callback, options);}
        }
    };

    const BoundLib = Object.assign({}, Library);
    BoundLib.Logger = BoundAPI.Logger;
    BoundLib.Patcher = BoundAPI.Patcher;
    return BoundLib;
};

export default pluginFunction(Library.Structs.Plugin(config), process.env.PLUGIN_NAME != "0PluginLibrary" ? getBoundLibrary() : Library);