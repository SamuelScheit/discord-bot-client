import SettingField from "../settingfield";
import {/*ColorConverter, DiscordModules, */DOMTools, DiscordClasses} from "modules";


const presetColors = [1752220, 3066993, 3447003, 10181046, 15277667, 15844367, 15105570, 15158332, 9807270, 6323595, 1146986, 2067276, 2123412, 7419530, 11342935, 12745742, 11027200, 10038562, 9936031, 5533306];

/** 
 * Creates a color picker using Discord's built in color picker
 * as a base. Input and output using hex strings.
 * @memberof module:Settings
 * @version 0.1.0
 * @extends module:Settings.SettingField
 */
class ColorPicker extends SettingField {
    /**
     * @param {string} name - name label of the setting 
     * @param {string} note - help/note to show underneath or above the setting
     * @param {string} value - current hex color
     * @param {callable} onChange - callback to perform on setting change, callback receives hex string
     * @param {object} [options] - object of options to give to the setting
     * @param {boolean} [options.disabled=false] - should the setting be disabled
     * @param {Array<number>} [options.colors=presetColors] - preset list of colors
     */
    constructor(name, note, value, onChange, options = {}) {
        // super(name, note, onChange, DiscordModules.ColorPicker, {
        //  disabled: options.disabled ? true : false,
        //  onChange: reactElement => color => {
        //      reactElement.props.value = color;
        //      reactElement.forceUpdate();
        //      this.onChange(ColorConverter.int2hex(color));
        //  },
        //  colors: Array.isArray(options.colors) ? options.colors : presetColors,
        //  defaultColor: typeof(value) == "number" ? value : ColorConverter.hex2int(value),
        //  value: 0
        // });
        const classes = ["color-input"];
        if (options.disabled) classes.push(DiscordClasses.BasicInputs.disabled);
        const ReactColorPicker = DOMTools.parseHTML(`<input type="color" class="${classes.join(" ")}">`);
        if (options.disabled) ReactColorPicker.setAttribute("disabled", "");
        if (value) ReactColorPicker.setAttribute("value", value);
        ReactColorPicker.addEventListener("change", (event) => {
            this.onChange(event.target.value);
        });
        super(name, note, onChange, ReactColorPicker, {inline: true});
    }

    /** Default colors for ColorPicker */
    static get presetColors() {return presetColors;}
}



export default ColorPicker;