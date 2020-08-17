const customTitlebar = require('custom-electron-titlebar');
const { contextBridge } = require('electron');

function TitleBar(){
	new customTitlebar.Titlebar({
	backgroundColor: customTitlebar.Color.fromHex('#202225'),
	itemBackgroundColor: customTitlebar.Color.fromHex('#282B2E'),
	});
}

contextBridge.exposeInMainWorld('electron', {
	buildTitleBar: TitleBar,
});