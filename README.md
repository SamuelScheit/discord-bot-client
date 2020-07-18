# Discord Bot Client
Allows you to use your bot, just like any other user account, except Friends, Groups

## [Demo](https://botclient.tk/)
Direct host of the Github Repository without modifications
WIP

## [Tutorial](https://www.youtube.com/watch?v=_q3Hr2bsYr8)
[![Youtube Tutorial Login as bot](https://img.youtube.com/vi/_q3Hr2bsYr8/0.jpg)](https://www.youtube.com/watch?v=_q3Hr2bsYr8)

## Functions
- View Guilds (Lazy load them) 
- Manage Guilds (Name, Image, Audit log, Emoji, Webhooks, Invites, Bans, Widget, Moderation, Roles)
- Manage Channels (Add, Delete, Name, Permissions, Invites, Webhooks, Slowmode, NSFW, Topic)
- Messages (Send, View History, Embeds, View Reactions, Add/Remove Reactions, Delete, Edit, Pin)
- Create a Guild (if the bot has fewer than 10 Servers)
- Even supports mobile smartphones
- Voice Support
- See Guild members in the side bar (you can see them in the server dropdown menu under members)
- React with other emojis (Nitro)
- GIF Search
- Send Files

## DM
If you load the page, DM's will show up, if a new user writes the bot then you can answer him

## Planned Features
- Better Discord support
- Direct Messages (DM) history list
- Change Status

## Not supported by discord api
- Message search
- Video
- Friends
- DM Groups
- Join server with invite link


## Docker
To run the discord bot client in a docker container, you can just run:
```
docker run -p 8080:3000 -d flam3rboy/discord-bot-client
```
This will start the server on: http://localhost:8080 

Alternative you can install it locally on your system:

## Install
- Install [Nodejs](https://nodejs.org/en/download/)
- Install Dependencies:
```
npm i
```

## Start
```
npm start
```
Now navigate to http://localhost:3000/


