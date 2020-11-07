const { app, BrowserWindow, systemPreferences } = require("electron");
const fetch = require("node-fetch");
const btoa = require("btoa");
// const fs = require("fs");

async function createWindow() {
	var html = await fetch("https://raw.githubusercontent.com/Flam3rboy/discord-bot-client/master/index.html");
	// html = fs.readFileSync(__dirname + "/../index.html");
	html = await html.text();
	// Create the browser window.
	let win = new BrowserWindow({
		width: 1920,
		height: 1080,
		icon: __dirname + "/buildResources/icon.png",
		webPreferences: {
			webSecurity: true,
			nodeIntegration: false,
			enableRemoteModule: false,
			contextIsolation: true,
		},
	});
	// win.webContents.openDevTools();
	win.webContents.on("did-navigate", () => {
		win.webContents.executeJavaScript(`document.write(atob("${btoa(html)}"))`);
	});
	if (systemPreferences && systemPreferences.askForMediaAccess) systemPreferences.askForMediaAccess("microphone");
	win.webContents.on("new-window", function (e, url) {
		e.preventDefault();
		require("electron").shell.openExternal(url);
	});
	win.loadURL("https://blank.org");
	// win.loadURL("data:text/html;charset=UTF-8," + encodeURIComponent(html), {
	// 	baseURLForDataURL: `file://${__dirname}/app`,
	// });

	const filter = {
		urls: ["<all_urls>"],
	};
	const { session } = win.webContents;

	session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
		details.requestHeaders["origin"] = "https://discord.com";
		if (
			[
				"https://discord.com/api/v6/users/@me/library",
				"https://discord.com/api/v6/users/@me/guilds/premium/subscriptions",
				"https://discord.com/api/v6/science",
			].includes(details.url) ||
			details.url.includes("https://discord.com/api/v6/users/@me/billing/trials/") ||
			details.url.includes("https://discord.com/api/v6/users/@me/applications/")
		) {
			return callback({ cancel: true });
		}
		delete details.requestHeaders["User-Agent"];

		callback({ requestHeaders: details.requestHeaders });
	});

	session.webRequest.onHeadersReceived(filter, (details, callback) => {
		details.responseHeaders["access-control-allow-origin"] = "*";

		callback({ responseHeaders: details.responseHeaders });
	});
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
