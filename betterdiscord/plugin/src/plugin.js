export default (BasePlugin, Library) => {
    const {PluginUpdater, Patcher, Logger, Settings, Toasts, PluginUtilities, ReactComponents} = Library;
    const PluginLibrary = class PluginLibrary extends BasePlugin {
        get Library() {return Library;}
        
        load() {
            super.load();
            const wasLibLoaded = !!document.getElementById("ZLibraryCSS");
            const isBBDLoading = document.getElementsByClassName("bd-loaderv2").length;
            PluginUtilities.removeStyle("ZLibraryCSS");
            PluginUtilities.addStyle("ZLibraryCSS", Settings.CSS + Toasts.CSS + PluginUpdater.CSS);
            ReactComponents.AutoPatcher.processAll();
            ReactComponents.AutoPatcher.autoPatch();
            
            /**
             * Checking if this is the library first being loaded during init
             * This means that subsequent loads will cause dependents to reload
             * This also means first load when installing for the first time 
             * will automatically reload the dependent plugins. This is needed
             * for those plugins that prompt to download and install the lib.
             */

            if (!wasLibLoaded && isBBDLoading) return; // If the this is the lib's first load AND this is BD's initialization

            /**
             * Now we can go ahead and reload any dependent plugins by checking
             * for any with instance._config. Both plugins using buildPlugin()
             * and plugin skeletons that prompt for download should have this
             * instance property.
             */

            const wasEnabled = BdApi.isSettingEnabled("fork-ps-2");
            if (wasEnabled) BdApi.disableSetting("fork-ps-2");
            const list = BdApi.Plugins.getAll().reduce((acc, val) => {
                if (!val._config) return acc;
                const name = val.getName();
                if (name === "ZeresPluginLibrary") return acc;
                acc.push(name);
                return acc;
            }, []);
            for (let p = 0; p < list.length; p++) BdApi.Plugins.reload(list[p]);
            if (wasEnabled) BdApi.enableSetting("fork-ps-2");
        }

        static buildPlugin(config) {
            const name = config.info.name;
            const BoundAPI = {
                Logger: {
                    stacktrace: (message, error) => Logger.stacktrace(name, message, error),
                    log: (...message) => Logger.log(name, ...message),
                    error: (...message) => Logger.err(name, ...message),
                    err: (...message) => Logger.err(name, ...message),
                    warn: (...message) => Logger.warn(name, ...message),
                    info: (...message) => Logger.info(name, ...message),
                    debug: (...message) => Logger.debug(name, ...message)
                },
                Patcher: {
                    getPatchesByCaller: () => {return Patcher.getPatchesByCaller(name);},
                    unpatchAll: () => {return Patcher.unpatchAll(name);},
                    before: (moduleToPatch, functionName, callback, options = {}) => {return Patcher.before(name, moduleToPatch, functionName, callback, options);},
                    instead: (moduleToPatch, functionName, callback, options = {}) => {return Patcher.instead(name, moduleToPatch, functionName, callback, options);},
                    after: (moduleToPatch, functionName, callback, options = {}) => {return Patcher.after(name, moduleToPatch, functionName, callback, options);}
                }
            };
            const BoundLib = Object.assign({}, Library);
            BoundLib.Logger = BoundAPI.Logger;
            BoundLib.Patcher = BoundAPI.Patcher;
            return [Library.Structs.Plugin(config), BoundLib];
        }
    };

    Object.assign(PluginLibrary, Library);
    Library.buildPlugin = PluginLibrary.buildPlugin;
    window.ZLibrary = Library;
    window.ZLibraryPromise = new Promise(r => setImmediate(r));
    window.ZeresPluginLibrary = PluginLibrary;
    return PluginLibrary;
};