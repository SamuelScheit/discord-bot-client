const fetch = require("node-fetch");
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
var beautify = require("js-beautify");

loadFiles = (type, arr) => {
	arr.forEach(async (c) => {
		var res = await fetch(`https://discord.com/assets/${c}.${type}`);
		var text = await res.text();
		switch (type) {
			case "js":
				text = beautify.js(text);
				break;
			case "css":
				text = beautify.css(text);
				break;
		}
		fs.writeFileSync(`assets/${c}.${type}`, text);
		console.log("downloaded: " + c + "." + type);
	});
};

loadFiles("css", ["0.b036adad6795509a26dc"]);

// loadFiles("js", [
// 	"52a74fcfaa3a43250da1",
// 	"21ada726f826628eb247",
// 	"36dd7568a3dd260fb343",
// 	"1d880e63bd069edc9bfe",
// 	"3ddc0c17176104811dcf",
// 	"43927e3a7d2fccd4a7e4",
// 	"7f43d815441faa92e720",
// 	"d957722319139c2c6f69.worker",
// ]);

loadFiles("svg", [
	"4f004ac9be168ac6ee18fc442a52ab53",
	"5ca9943d29a6dc5cd0808b011327a81c",
	"766c86e6244395ea36c530a7a4f27242",
	"f0d5ce11fa72f4a97747256faa345e7b",
	"07778297eb1e1e3d9bd3cd302920d5fb",
	"db7900a7a191ecf1949f15dd20dce2b2",
	"83d501f2b7dd2987302ce29b321f4494",
	"326d79eb53886c88437e99a3754b1cd0",
	"3c3e548508cc8055a9abe104d6fb4902",
	"b8029fe196b8f1382e90bbe81dab50dc",
	"dad59c6b5d0282bdb6476eb7b437785c",
	"bfd68f26a38f7184b5bcdd40153c4196",
	"f6f5399e57ef77e62130ed0b16104a4f",
	"cce448a3308b974d14c3a58bc86cabdc",
	"d6e013cec3f76e3fe8b0aecea25dfd16",
	"d6e013cec3f76e3fe8b0aecea25dfd16",
	"5ca9943d29a6dc5cd0808b011327a81c",
	"f3fdb69431ef187e87cb909b0206cc93",
	"11d800c7b4c405d96e8e412163727a89",
	"503a6a1d6710b6ea50a29507115549de",
	"0477c6a43026315dd623bc6367e18acb",
	"a85469a7ea891a12e2513f4281d51f78",
	"7654aba0da598aad6cee02d8c69c0330",
	"766c86e6244395ea36c530a7a4f27242",
	"eed642a423f5147c48ad395310a3d797",
]);
loadFiles("jpg", ["14c037b7102f18b2d2ccf065a52bb595"]);
loadFiles("png", ["c8f0b54f79a9fd1ef60ad74c73a1ee1a", "36d4b341723daffd4a372e1b19591da1"]);
loadFiles("webm", ["4f004ac9be168ac6ee18fc442a52ab53"]);
loadFiles("mp3", ["ae7d16bb2eea76b9b9977db0fad66658"]);
