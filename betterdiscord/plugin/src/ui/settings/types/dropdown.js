import SettingField from "../settingfield";
import {DiscordModules} from "modules";

/**
 * @interface
 * @name module:Settings~DropdownItem
 * @property {string} label - label to show in the dropdown
 * @property {*} value - actual value represented by label (this is passed via onChange)
 */

/** 
 * Creates a dropdown using discord's built in dropdown.
 * @memberof module:Settings
 * @version 0.0.1
 * @extends module:Settings.SettingField
 */
class Dropdown extends SettingField {
    /**
     * @param {string} name - name label of the setting 
     * @param {string} note - help/note to show underneath or above the setting
     * @param {*} defaultValue - currently selected value
     * @param {Array<module:Settings~DropdownItem>} values - array of all options available
     * @param {callable} onChange - callback to perform on setting change, callback item value
     * @param {object} [options] - object of options to give to the setting
     * @param {boolean} [options.clearable=false] - should be able to empty the field value
     * @param {boolean} [options.searchable=false] - should user be able to search the dropdown
     * @param {boolean} [options.disabled=false] - should the setting be disabled
     */
    constructor(name, note, defaultValue, values, onChange, options = {}) {
        const {clearable = false, searchable = false, disabled = false} = options;
        super(name, note, onChange, DiscordModules.Dropdown, {
            clearable: clearable,
            searchable: searchable,
            disabled: disabled,
            options: values,
            onChange: dropdown => opt => {
                dropdown.props.value = opt.value;
                dropdown.forceUpdate();
                this.onChange(opt.value);
            },
            value: defaultValue
        });
    }
}

export default Dropdown;