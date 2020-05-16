/**
 * BetterDiscord Message Struct
 * Copyright (c) 2018-present JsSucks
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/JsSucks/BetterDiscordApp/blob/master/LICENSE
*/

import {DiscordAPI, DiscordModules as Modules} from "modules";
import {List, InsufficientPermissions} from "structs";
import {Channel} from "./channel";
import {User} from "./user";

const reactions = new WeakMap();

export class Reaction {
    constructor(data, message_id, channel_id) {
        if (reactions.has(data)) return reactions.get(data);
        reactions.set(data, this);

        this.discordObject = data;
        this.messageId = message_id;
        this.channelId = channel_id;
    }

    get emoji() {
        const id = this.discordObject.emoji.id;
        if (!id || !this.guild) return this.discordObject.emoji;
        return this.guild.emojis.find(e => e.id === id);
    }

    get count() { return this.discordObject.count; }
    get me() { return this.discordObject.me; }

    get channel() {
        return Channel.fromId(this.channel_id);
    }

    get message() {
        if (this.channel) return this.channel.messages.find(m => m.id === this.messageId);
        return null;
    }

    get guild() {
        if (this.channel) return this.channel.guild;
        return null;
    }
}

const embeds = new WeakMap();

export class Embed {
    constructor(data, message_id, channel_id) {
        if (embeds.has(data)) return embeds.get(data);
        embeds.set(data, this);

        this.discordObject = data;
        this.messageId = message_id;
        this.channelId = channel_id;
    }

    get title() { return this.discordObject.title; }
    get type() { return this.discordObject.type; }
    get description() { return this.discordObject.description; }
    get url() { return this.discordObject.url; }
    get timestamp() { return this.discordObject.timestamp; }
    get colour() { return this.discordObject.color; }
    get footer() { return this.discordObject.footer; }
    get image() { return this.discordObject.image; }
    get thumbnail() { return this.discordObject.thumbnail; }
    get video() { return this.discordObject.video; }
    get provider() { return this.discordObject.provider; }
    get author() { return this.discordObject.author; }
    get fields() { return this.discordObject.fields; }

    get channel() {
        return Channel.fromId(this.channelId);
    }

    get message() {
        if (this.channel) return this.channel.messages.find(m => m.id === this.messageId);
        return null;
    }

    get guild() {
        if (this.channel) return this.channel.guild;
        return null;
    }
}

const messages = new WeakMap();

/**
 * @memberof module:DiscordAPI
 */
class Message {

    constructor(data) {
        if (messages.has(data)) return messages.get(data);
        messages.set(data, this);

        this.discordObject = data;
    }

    static from(data) {
        switch (data.type) {
            default: return new Message(data);
            case 0: return new DefaultMessage(data);
            case 1: return new RecipientAddMessage(data);
            case 2: return new RecipientRemoveMessage(data);
            case 3: return new CallMessage(data);
            case 4: return new GroupChannelNameChangeMessage(data);
            case 5: return new GroupChannelIconChangeMessage(data);
            case 6: return new MessagePinnedMessage(data);
            case 7: return new GuildMemberJoinMessage(data);
        }
    }

    static get DefaultMessage() { return DefaultMessage; }
    static get RecipientAddMessage() { return RecipientAddMessage; }
    static get RecipientRemoveMessage() { return RecipientRemoveMessage; }
    static get CallMessage() { return CallMessage; }
    static get GroupChannelNameChangeMessage() { return GroupChannelNameChangeMessage; }
    static get GroupChannelIconChangeMessage() { return GroupChannelIconChangeMessage; }
    static get MessagePinnedMessage() { return MessagePinnedMessage; }
    static get GuildMemberJoinMessage() { return GuildMemberJoinMessage; }

    static get Reaction() { return Reaction; }
    static get Embed() { return Embed; }

    get id() { return this.discordObject.id; }
    get channelId() { return this.discordObject.channel_id; }
    get nonce() { return this.discordObject.nonce; }
    get type() { return this.discordObject.type; }
    get timestamp() { return this.discordObject.timestamp; }
    get state() { return this.discordObject.state; }
    get nick() { return this.discordObject.nick; }
    get colourString() { return this.discordObject.colorString; }

    get author() {
        if (this.discordObject.author && !this.webhookId) return User.from(this.discordObject.author);
        return null;
    }

    get channel() {
        return Channel.fromId(this.channelId);
    }

    get guild() {
        if (this.channel) return this.channel.guild;
        return null;
    }

    /**
     * Deletes the message.
     * @return {Promise}
     */
    delete() {
        if (!this.isDeletable) throw new Error(`Message type ${this.type} is not deletable.`);
        if (this.author !== DiscordAPI.currentUser) {
            if (this.channel.assertPermissions) this.channel.assertPermissions("MANAGE_MESSAGES", Modules.DiscordPermissions.MANAGE_MESSAGES);
            else if (!this.channel.owner === DiscordAPI.currentUser) throw new InsufficientPermissions("MANAGE_MESSAGES");
        }

        return Modules.APIModule.delete(`${Modules.DiscordConstants.Endpoints.MESSAGES(this.channelId)}/${this.id}`);
    }

    get isDeletable() {
        return this.type === "DEFAULT" || this.type === "CHANNEL_PINNED_MESSAGE" || this.type === "GUILD_MEMBER_JOIN";
    }

    /**
     * Jumps to the message.
     */
    jumpTo(flash = true) {
        Modules.MessageActions.jumpToMessage(this.channelId, this.id, flash);
    }

}

export {Message};

export class DefaultMessage extends Message {
    get webhookId() { return this.discordObject.webhookId; }
    get type() { return "DEFAULT"; }
    get content() { return this.discordObject.content; }
    get contentParsed() { return this.discordObject.contentParsed; }
    get inviteCodes() { return this.discordObject.invites; }
    get attachments() { return this.discordObject.attachments; }
    get mentionIds() { return this.discordObject.mentions; }
    get mentionRoleIds() { return this.discordObject.mentionRoles; }
    get mentionEveryone() { return this.discordObject.mentionEveryone; }
    get editedTimestamp() { return this.discordObject.editedTimestamp; }
    get tts() { return this.discordObject.tts; }
    get mentioned() { return this.discordObject.mentioned; }
    get bot() { return this.discordObject.bot; }
    get blocked() { return this.discordObject.blocked; }
    get pinned() { return this.discordObject.pinned; }
    get activity() { return this.discordObject.activity; }
    get application() { return this.discordObject.application; }

    get webhook() {
        if (this.webhookId) return this.discordObject.author;
        return null;
    }

    get mentions() {
        return List.from(this.mentionIds, id => User.fromId(id));
    }

    get mention_roles() {
        return List.from(this.mentionRoleIds, id => this.guild.roles.find(r => r.id === id));
    }

    get embeds() {
        return List.from(this.discordObject.embeds, r => new Embed(r, this.id, this.channelId));
    }

    get reactions() {
        return List.from(this.discordObject.reactions, r => new Reaction(r, this.id, this.channelId));
    }

    get edited() {
        return !!this.editedTimestamp;
    }

    /**
     * Programmatically update the message's content.
     * @param {String} content The message's new content
     * @param {Boolean} parse Whether to parse the message or update it as it is
     * @return {Promise}
     */
    async edit(content, parse = false) {
        if (this.author !== DiscordAPI.currentUser) throw new Error("Cannot edit messages sent by other users.");
        if (parse) content = Modules.MessageParser.parse(this.discordObject, content);
        else content = {content};

        const response = await Modules.APIModule.patch({
            url: `${Modules.DiscordConstants.Endpoints.MESSAGES(this.channelId)}/${this.id}`,
            body: content
        });

        this.discordObject = Modules.MessageStore.getMessage(this.id, response.body.id);
        messages.set(this.discordObject, this);
    }

    /**
     * Start the edit mode of the UI.
     * @param {String} content A string to show in the message text area - if empty the message's current content will be used
     */
    startEdit(content) {
        if (this.author !== DiscordAPI.currentUser) throw new Error("Cannot edit messages sent by other users.");
        Modules.MessageActions.startEditMessage(this.channelId, this.id, content || this.content);
    }

    /**
     * Exit the edit mode of the UI.
     */
    endEdit() {
        Modules.MessageActions.endEditMessage();
    }
}

export class RecipientAddMessage extends Message {
    get type() { return "RECIPIENT_ADD"; }
    get addedUserId() { return this.discordObject.mentions[0]; }

    get addedUser() {
        return User.fromId(this.addedUserId);
    }
}

export class RecipientRemoveMessage extends Message {
    get type() { return "RECIPIENT_REMOVE"; }
    get removedUserId() { return this.discordObject.mentions[0]; }

    get removedUser() {
        return User.fromId(this.removedUserId);
    }

    get userLeft() {
        return this.author === this.removedUser;
    }
}

export class CallMessage extends Message {
    get type() { return "CALL"; }
    get mentionIds() { return this.discordObject.mentions; }
    get call() { return this.discordObject.call; }

    get endedTimestamp() { return this.call.endedTimestamp; }

    get mentions() {
        return List.from(this.mentionIds, id => User.fromId(id));
    }

    get participants() {
        return List.from(this.call.participants, id => User.fromId(id));
    }
}

export class GroupChannelNameChangeMessage extends Message {
    get type() { return "CHANNEL_NAME_CHANGE"; }
    get newName() { return this.discordObject.content; }
}

export class GroupChannelIconChangeMessage extends Message {
    get type() { return "CHANNEL_ICON_CHANGE"; }
}

export class MessagePinnedMessage extends Message {
    get type() { return "CHANNEL_PINNED_MESSAGE"; }
}

export class GuildMemberJoinMessage extends Message {
    get type() { return "GUILD_MEMBER_JOIN"; }
}
