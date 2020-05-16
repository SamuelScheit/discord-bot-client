class PermissionsError extends Error {
    constructor(message) {
        super(message);
        this.name = "PermissionsError";
    }
}

/**
 * @memberof module:DiscordAPI
 */
class InsufficientPermissions extends PermissionsError {
    constructor(message) {
        super(`Missing Permission — ${message}`);
        this.name = "InsufficientPermissions";
    }
}

export default PermissionsError;
export {InsufficientPermissions};