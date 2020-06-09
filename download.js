const fs = require("fs");
const fetch = require("node-fetch");

(async () => {
	var res = await fetch("https://discord.com/app");
	var text = await res.text();
	const loader = fs.readFileSync(__dirname + "/src/loader.js", { encoding: "utf8" });

	const scripts = text.match(/\/assets\/\w+\.js/g);
	const fixedAssets = text.replace(/(?<!https:\/\/(\w|\.)+)\/assets\//g, "https://discord.com/assets/");
	const fixedNonce = fixedAssets.replace(/(nonce|integrity)="(\w|\d|=|-|\/|\s|\+)*"/g, "");
	const excludedScripts = fixedNonce.replace(/<script src=.*<\/script>/g, "");
	const insertedScript = excludedScripts.insertSearch(
		"</body>",
		`
		<style>html,body{background-color:#303136;}</style>
	<script>
	window.assets = ${JSON.stringify(scripts)}
	</script>
	<script>
		${loader}
	</script>
	`
	);

	fs.writeFileSync(__dirname + "/index.html", insertedScript, { encoding: "utf8" });
})();

String.prototype.insertSearch = function (searchText, text) {
	var position = this.indexOf(searchText);
	return this.substring(0, position) + text + this.substring(position);
};
