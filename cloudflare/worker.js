async function handleRequests(request) {
	// Make the headers mutable by re-constructing the Request.
	request = new Request(request);
	var url = new URL(request.url);
	var response;
	var origin = Object.fromEntries(request.headers).origin || "https://discordclient.com";
	console.log(origin, Object.fromEntries(request.headers))
	try {
		var u = "https://discord.com" + url.pathname;

		var options = { ...request, headers: Object.fromEntries(request.headers) };
		options.headers.origin = "https://discord.com"

		if (u.includes("assets")) {
			options = {
				cf: {
					cacheTtl: 31536000,
					cacheKey: u,
					cacheEverything: true,
				}
			};
		}
		response = await fetch(u, options);
		console.log(u, request)
		response = new Response(response.body, {
			...response, status: 200, statusText: "OK", headers: {
				...Object.fromEntries(response.headers),
				"access-control-allow-method": "POST, GET, OPTIONS, DELETE, PUT",
				"access-control-allow-origin": origin,
				"access-control-allow-headers": "cookie,authorization,content-type,x-failed-requests,x-fingerprint,x-super-properties,if-none-match",
				"access-control-allow-credentials": "true"
			}
		});
	} catch (e) {
		response = new Response(e.toString());
	}

	console.log("response");
	return response;
}
// listen for requests
addEventListener("fetch", (event) => {
	const { request } = event;
	return event.respondWith(handleRequests(request, request.method));
});
