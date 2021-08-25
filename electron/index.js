const { app, BrowserWindow, systemPreferences } = require("electron");
const fetch = require("node-fetch");
const btoa = require("btoa");
const fs = require("fs");

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
	win.loadURL("https://discord.com");
	// win.loadURL("data:text/html;charset=UTF-8," + encodeURIComponent(html), {
	// 	baseURLForDataURL: `file://${__dirname}/app`,
	// });

	const filter = {
		urls: ["<all_urls>"],
	};
	const { session } = win.webContents;

	session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
		if (
			[
				"https://discord.com/api/v9/users/@me/library",
				"https://discord.com/api/v9/users/@me/guilds/premium/subscriptions",
				"https://discord.com/api/v9/science",
			].includes(details.url) ||
			details.url.includes("https://discord.com/api/v9/users/@me/billing/trials/") ||
			details.url.includes("https://discord.com/api/v9/users/@me/applications/")
		) {
			return callback({ cancel: true });
		}
		if (details.url.startsWith("https://discord.com/assets")) {
			details.requestHeaders["User-Agent"] =
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36";
		} else {
			delete details.requestHeaders["User-Agent"];
		}

		callback({ requestHeaders: details.requestHeaders });
	});

	session.webRequest.onHeadersReceived(filter, (details, callback) => {
		details.responseHeaders["access-control-allow-origin"] = "*";
		details.responseHeaders["content-security-policy"] = "default-src * data: 'unsafe-eval' 'unsafe-inline' blob:";

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
