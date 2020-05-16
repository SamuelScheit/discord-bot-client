import SettingField from "../settingfield";
import {DiscordModules} from "modules";

//TODO: Documentation

/** 
 * Creates a switch using discord's built in switch.
 * @memberof module:Settings
 * @version 0.1.0
 * @extends module:Settings.SettingField
 */
class Switch extends SettingField {
    /**
     * @param {string} name - name label of the setting 
     * @param {string} note - help/note to show underneath or above the setting
     * @param {boolean} isChecked - should switch be checked
     * @param {callable} onChange - callback to perform on setting change, callback receives boolean
     * @param {object} [options] - object of options to give to the setting
     * @param {boolean} [options.disabled=false] - should the setting be disabled
     */
    constructor(name, note, isChecked, onChange, options = {}) {
        super(name, note, onChange);
        this.disabled = options.disabled ? true : false;
        this.value = isChecked ? true : false;
    }

    onAdded() {
        const reactElement = DiscordModules.ReactDOM.render(DiscordModules.React.createElement(DiscordModules.SwitchRow, {
            children: this.name,
            note: this.note,
            disabled: this.disabled,
            hideBorder: false,
            value: this.value,
            onChange: (e) => {
                const checked = e.currentTarget.checked;
                reactElement.props.value = checked;
                reactElement.forceUpdate();
                this.onChange(checked);
            }
        }), this.getElement());
    }
}

export default Switch;