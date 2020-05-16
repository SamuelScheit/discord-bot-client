/**
 * BetterDiscord User Struct
 * Copyright (c) 2018-present JsSucks
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/JsSucks/BetterDiscordApp/blob/master/LICENSE
*/

import {DiscordAPI, DiscordModules as Modules, Utilities} from "modules";
import {List, InsufficientPermissions} from "structs";
import {Guild} from "./guild";
import {Channel} from "./channel";

const users = new WeakMap();

/**
 * @memberof module:DiscordAPI
 */
class User {

    constructor(data) {
        if (users.has(data)) return users.get(data);
        users.set(data, this);

        this.discordObject = data;
    }

    static from(data) {
        return new User(data);
    }

    static fromId(id) {
        const user = Modules.UserStore.getUser(id);
        if (user) return User.from(user);
    }

    get id() { return this.discordObject.id; }
    get username() { return this.discordObject.username; }
    get usernameLowerCase() { return this.discordObject.usernameLowerCase; }
    get discriminator() { return this.discordObject.discriminator; }
    get avatar() { return this.discordObject.avatar; }
    get email() { return undefined; }
    get phone() { return undefined; }
    get flags() { return this.discordObject.flags; }
    get isBot() { return this.discordObject.bot; }
    get premium() { return this.discordObject.premium; }
    get verified() { return this.discordObject.verified; }
    get mfaEnabled() { return this.discordObject.mfaEnabled; }
    get mobile() { return this.discordObject.mobile; }

    get tag() { return this.discordObject.tag; }
    get avatarUrl() { return this.discordObject.avatarURL; }
    get createdAt() { return this.discordObject.createdAt; }

    get isClamied() { return this.discordObject.isClaimed(); }
    get isLocalBot() { return this.discordObject.isLocalBot(); }
    get isPhoneVerified() { return this.discordObject.isPhoneVerified(); }

    get guilds() {
        return DiscordAPI.guilds.filter(g => g.members.find(m => m.user === this));
    }

    get status() {
        return Modules.UserStatusStore.getStatus(this.id);
    }

    get activity() {
        // type can be either 0 (normal/rich presence game), 1 (streaming) or 2 (listening to Spotify)
        // (3 appears as watching but is undocumented)
        return Modules.UserStatusStore.getActivity(this.id);
    }

    get note() {
        const note = Modules.UserNoteStore.getNote(this.id);
        if (note) return note;
        return null;
    }

    /**
     * Updates the note for this user.
     * @param {String} note The new note
     * @return {Promise}
     */
    updateNote(note) {
        return Modules.APIModule.put({
            url: `${Modules.DiscordConstants.Endpoints.NOTES}/${this.id}`,
            body: {note}
        });
    }

    get privateChannel() {
        return DiscordAPI.channels.find(c => c.type === "DM" && c.recipientId === this.id);
    }

    async ensurePrivateChannel() {
        if (DiscordAPI.currentUser === this) throw new Error("Cannot create a direct message channel to the current user.");
        return Channel.fromId(await Modules.PrivateChannelActions.ensurePrivateChannel(DiscordAPI.currentUser.id, this.id));
    }

    async sendMessage(content, parse = true) {
        const channel = await this.ensurePrivateChannel();
        return channel.sendMessage(content, parse);
    }

    get isFriend() {
        return Modules.RelationshipStore.isFriend(this.id);
    }

    get isBlocked() {
        return Modules.RelationshipStore.isBlocked(this.id);
    }

    addFriend() {
        Modules.RelationshipManager.addRelationship(this.id, {location: "Context Menu"});
    }

    removeFriend() {
        Modules.RelationshipManager.removeRelationship(this.id, {location: "Context Menu"});
    }

    block() {
        Modules.RelationshipManager.addRelationship(this.id, {location: "Context Menu"}, Modules.DiscordConstants.RelationshipTypes.BLOCKED);
    }

    unblock() {
        Modules.RelationshipManager.removeRelationship(this.id, {location: "Context Menu"});
    }

    /**
     * Opens the profile modal for this user.
     * @param {String} section The section to open (see DiscordConstants.UserProfileSections)
     */
    openUserProfileModal(section = "USER_INFO") {
        Modules.UserProfileModal.open(this.id);
        Modules.UserProfileModal.setSection(section);
    }
}

export {User};

const guild_members = new WeakMap();

export class GuildMember {
    constructor(data, guild_id) {
        if (guild_members.has(data)) return guild_members.get(data);
        guild_members.set(data, this);

        this.discordObject = data;
        this.guildId = guild_id;
    }

    get userId() { return this.discordObject.userId; }
    get nickname() { return this.discordObject.nick; }
    get colourString() { return this.discordObject.colorString; }
    get hoistRoleId() { return this.discordObject.hoistRoleId; }
    get roleIds() { return this.discordObject.roles; }

    get user() {
        return User.fromId(this.userId);
    }

    get name() {
        return this.nickname || this.user.username;
    }

    get guild() {
        return Guild.fromId(this.guildId);
    }

    get roles() {
        return List.from(this.roleIds, id => this.guild.roles.find(r => r.id === id))
            .sort((r1, r2) => r1.position === r2.position ? 0 : r1.position > r2.position ? 1 : -1);
    }

    get hoistRole() {
        return this.guild.roles.find(r => r.id === this.hoistRoleId);
    }

    checkPermissions(perms) {
        return Modules.Permissions.can(perms, DiscordAPI.currentUser.discordObject, this.guild.discordObject);
    }

    assertPermissions(name, perms) {
        if (!this.checkPermissions(perms)) throw new InsufficientPermissions(name);
    }

    /**
     * Opens the modal to change this user's nickname.
     */
    openChangeNicknameModal() {
        if (DiscordAPI.currentUser === this.user) this.assertPermissions("CHANGE_NICKNAME", Modules.DiscordPermissions.CHANGE_NICKNAME);
        else this.assertPermissions("MANAGE_NICKNAMES", Modules.DiscordPermissions.MANAGE_NICKNAMES);

        Modules.ChangeNicknameModal.open(this.guildId, this.userId);
    }

    /**
     * Changes the user's nickname on this guild.
     * @param {String} nickname The user's new nickname
     * @return {Promise}
     */
    changeNickname(nick) {
        if (DiscordAPI.currentUser === this.user) this.assertPermissions("CHANGE_NICKNAME", Modules.DiscordPermissions.CHANGE_NICKNAME);
        else this.assertPermissions("MANAGE_NICKNAMES", Modules.DiscordPermissions.MANAGE_NICKNAMES);

        return Modules.APIModule.patch({
            url: `${Modules.DiscordConstants.Endpoints.GUILD_MEMBERS(this.guild_id)}/${DiscordAPI.currentUser === this.user ? "@me/nick" : this.userId}`,
            body: {nick}
        });
    }

    /**
     * Kicks this user from the guild.
     * @param {String} reason A reason to attach to the audit log entry
     * @return {Promise}
     */
    kick(reason = "") {
        this.assertPermissions("KICK_MEMBERS", Modules.DiscordPermissions.KICK_MEMBERS);
        return Modules.GuildActions.kickUser(this.guildId, this.userId, reason);
    }

    /**
     * Bans this user from the guild.
     * @param {Number} daysToDelete The number of days of the user's recent message history to delete
     * @param {String} reason A reason to attach to the audit log entry
     * @return {Promise}
     */
    ban(daysToDelete = 1, reason = "") {
        this.assertPermissions("BAN_MEMBERS", Modules.DiscordPermissions.BAN_MEMBERS);
        return Modules.GuildActions.banUser(this.guildId, this.userId, daysToDelete, reason);
    }

    /**
     * Removes the ban for this user.
     * @return {Promise}
     */
    unban() {
        this.assertPermissions("BAN_MEMBERS", Modules.DiscordPermissions.BAN_MEMBERS);
        return Modules.GuildActions.unbanUser(this.guildId, this.userId);
    }

    /**
     * Moves this user to another voice channel.
     * @param {GuildVoiceChannel} channel The channel to move this user to
     */
    move(channel) {
        this.assertPermissions("MOVE_MEMBERS", Modules.DiscordPermissions.MOVE_MEMBERS);
        Modules.GuildActions.setChannel(this.guildId, this.userId, channel.id);
    }

    /**
     * Mutes this user for everyone in the guild.
     */
    mute(active = true) {
        this.assertPermissions("MUTE_MEMBERS", Modules.DiscordPermissions.MUTE_MEMBERS);
        Modules.GuildActions.setServerMute(this.guildId, this.userId, active);
    }

    /**
     * Unmutes this user.
     */
    unmute() {
        this.mute(false);
    }

    /**
     * Deafens this user.
     */
    deafen(active = true) {
        this.assertPermissions("DEAFEN_MEMBERS", Modules.DiscordPermissions.DEAFEN_MEMBERS);
        Modules.GuildActions.setServerDeaf(this.guildId, this.userId, active);
    }

    /**
     * Undeafens this user.
     */
    undeafen() {
        this.deafen(false);
    }

    /**
     * Gives this user a role.
     * @param {Role} role The role to add
     * @return {Promise}
     */
    addRole(...roles) {
        const newRoles = this.roleIds.concat([]);
        let changed = false;
        for (const role of roles) {
            if (newRoles.includes(role.id || role)) continue;
            newRoles.push(role.id || role);
            changed = true;
        }
        if (!changed) return;
        return this.updateRoles(newRoles);
    }

    /**
     * Removes a role from this user.
     * @param {Role} role The role to remove
     * @return {Promise}
     */
    removeRole(...roles) {
        const newRoles = this.roleIds.concat([]);
        let changed = false;
        for (const role of roles) {
            if (!newRoles.includes(role.id || role)) continue;
            Utilities.removeFromArray(newRoles, role.id || role);
            changed = true;
        }
        if (!changed) return;
        return this.updateRoles(newRoles);
    }

    /**
     * Updates this user's roles.
     * @param {Array} roles An array of Role objects or role IDs
     * @return {Promise}
     */
    updateRoles(roles) {
        roles = roles.map(r => r.id || r);
        return Modules.APIModule.patch({
            url: `${Modules.DiscordConstants.Endpoints.GUILD_MEMBERS(this.guildId)}/${this.userId}`,
            body: {roles}
        });
    }
}
