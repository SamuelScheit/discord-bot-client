async function handleRequests(request) {
	// Make the headers mutable by re-constructing the Request.
	request = new Request(request);
	var url = new URL(request.url);
	var response;
	try {
		var u = "https://discord.com" + url.pathname;
		request.headers.origin = "https://discord.com"

		var options = request;
		if (u.includes("assets")) {
			options.cf = {
				cacheTtl: 31536000,
				cacheKey: u,
				cacheEverything: true,
			};
		}
		response = await fetch(u, options);
		console.log(u, request)
		response = new Response(response.body, response);
	} catch (e) {
		response = new Response(e.toString());
	}

	response.headers.set("Access-Control-Allow-Method", "POST, GET, OPTIONS, DELETE, PUT");
	response.headers.set("Access-Control-Allow-Origin", "*");
	response.headers.set("Access-Control-Allow-Headers", "authorization,content-type,x-failed-requests,x-fingerprint,x-super-properties");
	console.log("response");
	return response;
}
// listen for requests
addEventListener("fetch", (event) => {
	const { request } = event;
	return event.respondWith(handleRequests(request, request.method));
});
