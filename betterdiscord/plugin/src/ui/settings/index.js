/**
 * An object that makes generating settings panel 10x easier.
 * @module Settings
 * @version 1.1.2
 */

export const CSS = require("../../styles/settings.css");

export * from "./settingfield";
export {default as SettingField} from "./settingfield";
export {default as SettingGroup} from "./settinggroup";
export {default as SettingPanel} from "./settingpanel";
export {default as Textbox} from "./types/textbox";
export {default as ColorPicker} from "./types/color";
export {default as FilePicker} from "./types/file";
export {default as Slider} from "./types/slider";
export {default as Switch} from "./types/switch";
export {default as Dropdown} from "./types/dropdown";
export {default as Keybind} from "./types/keybind";
export {default as RadioGroup} from "./types/radiogroup";