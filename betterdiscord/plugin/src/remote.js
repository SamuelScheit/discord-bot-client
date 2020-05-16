import * as Modules from "modules";
import {Settings, ContextMenu, Tooltip, Toasts, Popouts, Modals} from "ui";

const Library = {};
Library.ContextMenu = ContextMenu;
Library.Tooltip = Tooltip;
Library.Toasts = Toasts;
Library.Settings = Settings;
Library.Popouts = Popouts;
Library.Modals = Modals;
for (const mod in Modules) Library[mod] = Modules[mod];

Library.buildPlugin = function(config) {
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
    
    return [Library.Structs.Plugin(config), Object.assign({}, Library, BoundAPI)];
};

if (document.getElementById("ZLibraryCSS")) document.getElementById("ZLibraryCSS").remove();
document.head.append(Library.DOMTools.createElement(`<style id="ZLibraryCSS">${Settings.CSS + Toasts.CSS + Library.PluginUpdater.CSS}</style>`));

export default Library;

