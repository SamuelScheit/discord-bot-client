var oldWebsocket = window.WebSocket;
window.WebSocket = class test extends oldWebsocket {
	constructor(args) {
		console.log("!!! NEW WEBSOCKET");
		super(args);
	}
	on(event,fn) {
		super.on(event,(e,t)=>{
			console.log({e,t})
		})
	}
};
