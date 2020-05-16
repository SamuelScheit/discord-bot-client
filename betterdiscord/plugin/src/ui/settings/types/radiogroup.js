import SettingField from "../settingfield";
import {DiscordModules} from "modules";

/**
 * @interface
 * @name module:Settings~RadioItem
 * @property {string} name - label to show in the dropdown
 * @property {*} value - actual value represented by label (this is passed via onChange)
 * @property {string} desc - description/help text to show below name
 * @property {string} color - hex string to color the item
 */

/** 
 * Creates a radio group using discord's built in radios.
 * @memberof module:Settings
 * @version 0.0.1
 * @extends module:Settings.SettingField
 */
class RadioGroup extends SettingField {
    /**
     * @param {string} name - name label of the setting 
     * @param {string} note - help/note to show underneath or above the setting
     * @param {*} defaultValue - currently selected value
     * @param {Array<module:Settings~RadioItem>} values - array of all options available
     * @param {callable} onChange - callback to perform on setting change, callback item value
     * @param {object} [options] - object of options to give to the setting
     * @param {boolean} [options.disabled=false] - should the setting be disabled
     */
    constructor(name, note, defaultValue, values, onChange, options = {}) {
        super(name, note, onChange, DiscordModules.RadioGroup, {
            noteOnTop: true,
            disabled: options.disabled ? true : false,
            options: values,
            onChange: reactElement => option => {
                reactElement.props.value = option.value;
                reactElement.forceUpdate();
                this.onChange(option.value);
            },
            value: defaultValue
        });
    }
}

export default RadioGroup;

