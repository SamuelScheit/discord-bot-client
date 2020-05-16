import SettingField from "../settingfield";
import {DiscordClasses, DOMTools} from "modules";

/** 
 * Creates a file picker using chromium's default.
 * @memberof module:Settings
 * @version 0.0.1
 * @extends module:Settings.SettingField
 */
class FilePicker extends SettingField {
    /**
     * @param {string} name - name label of the setting 
     * @param {string} note - help/note to show underneath or above the setting
     * @param {callable} onChange - callback to perform on setting change, callback receives File object
     * @param {object} [options] - object of options to give to the setting
     * @param {boolean} [options.disabled=false] - should the setting be disabled
     * @param {Array<string>|string} [options.accept] - what file types should be accepted
     * @param {boolean} [options.multiple=false] - should multiple files be accepted
     */
    constructor(name, note, onChange, options = {}) {
        const classes = DiscordClasses.BasicInputs.inputDefault.add("file-input");
        if (options.disabled) classes.add(DiscordClasses.BasicInputs.disabled);
        const ReactFilePicker = DOMTools.parseHTML(`<input type="file" class="${classes}">`);
        if (options.disabled) ReactFilePicker.setAttribute("disabled", "");
        if (options.multiple) ReactFilePicker.setAttribute("multiple", "");
        if (options.accept) ReactFilePicker.setAttribute("accept", Array.isArray(options.accept) ? options.accept.join(",") : options.accept);
        ReactFilePicker.addEventListener("change", (event) => {
            this.onChange(event.target.files[0]);
        });
        super(name, note, onChange, ReactFilePicker);
    }
}

export default FilePicker;