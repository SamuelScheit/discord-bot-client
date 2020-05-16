/**
 * Representation of the screen such as width and height.
 */
class Screen {
    /** Document/window width */
    static get width() { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0); }
    /** Document/window height */
    static get height() { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0); }
}

export default Screen;