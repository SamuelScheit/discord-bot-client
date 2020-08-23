const customTitlebar = require('custom-electron-titlebar');
const { contextBridge } = require('electron');

function TitleBar(){
	new customTitlebar.Titlebar({
	backgroundColor: customTitlebar.Color.fromHex('#202225'),
	itemBackgroundColor: customTitlebar.Color.fromHex('#282B2E'),
	});
	// add styles
	document.querySelector('.titlebar').style.height = '22px';
	document.querySelector('.window-controls-container').style.height = '100%';
	document.querySelector('.menubar').style.visibility = 'hidden';
	var buttons = document.querySelectorAll('.window-icon-bg');
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].style.width = "28px";
	}
	document.querySelector('.window-title').style.fontSize = '0px';
}

contextBridge.exposeInMainWorld('electron', {
	buildTitleBar: TitleBar,
});