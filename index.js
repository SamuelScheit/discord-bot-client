const express = require("express");
const app = express();
const fs = require("fs");
var discordIndexHTML = fs.readFileSync(__dirname + "/index.html", { encoding: "utf8" });

app.use("*", async (req, res, next) => {
	res.setHeader("access-control-allow-origin", "*");
	next();
});

app.use("/src", express.static(__dirname + "/src"));

app.use("*", async (req, res) => {
	res.send(discordIndexHTML);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("server listening on :" + port);
}); 