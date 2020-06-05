const modules = {
	electron: {
		remote: {
			getCurrentWindow() {
				var maximized = true;
				return {
					isMaximized() {
						return maximized;
					},
				};
			},
			getCurrentWebContents() {
				return window;
			},
			app: {
				getAppPath() {
					return "/bd/";
				},
			},
		},
	},
	events: class EventEmitter extends EventTarget {},
	module: {
		Module: {
			globalPaths: [],
			_extensions: {
				".js": (file) => {
					require(`${file}.js`);
				},
				".css": (file) => {
					require(`${file}.css`);
				},
			},
		},
	},
	path: {
		resolve() {},
	},
	fs: {
		existsSync(file) {
			getLocalStoragePropertyDescriptor();
			return !!localStorage.getItem(file);
		},
	},
};

window.require = (file) => {
	console.log("require " + file);
	return modules[file];
};

window.process = {
	platform: "darwin",
	env: {
		HOME: "/HOME/",
	},
};

EventTarget.prototype.removeAllListeners = (type) => {
	const listeners = getEventListeners(window);
	listeners[type].map((listener) => {
		window.removeEventListener(type, listener);
	});
};

function getLocalStoragePropertyDescriptor() {
	const iframe = document.createElement("iframe");
	document.head.append(iframe);
	const pd = Object.getOwnPropertyDescriptor(iframe.contentWindow, "localStorage");
	iframe.remove();
	Object.defineProperty(window, "localStorage", getLocalStoragePropertyDescriptor());
}

window.webContents = {
	removeAllListeners: EventTarget.prototype.removeAllListeners,
};
