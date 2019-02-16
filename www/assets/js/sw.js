const name = "young-cappuccino-cache-v1",
	urls = [
		"/index.html",
		"/assets/css/bulma.css",
		"/assets/css/style.css",
		"/assets/css/style.css.map",
		"/assets/css/style.scss",
		"/assets/css/font-awesome/css/all.css",
		"/assets/css/font-awesome/webfonts/fa-solid-900.woff2",
		"/assets/js/app.js",
		"/assets/img/logo.svg"
	];

self.addEventListener("install", ev => ev.waitUntil(caches.open(name).then(cache => cache.addAll(urls))));

self.addEventListener("fetch", ev => ev.respondWith(caches.match(ev.request).then(res => res ? res : fetch(ev.request).then(response => {
	let result;

	if (!response || response.status !== 200 || response.type !== "basic") {
		result = response;
	} else {
		const responseToCache = response.clone();

		caches.open(name).then(cache => cache.put(ev.request, responseToCache));
		result = response;
	}

	return result;
}))));