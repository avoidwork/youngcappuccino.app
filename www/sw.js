const name = "young-cappuccino-cache-v6",
	timeout = 18e2, // 30 min
	urls = [
		"/",
		"/manifest.json",
		"/assets/css/bulma.css",
		"/assets/css/style.css",
		"/assets/css/style.css.map",
		"/assets/css/style.scss",
		"/assets/css/font-awesome/css/all.css",
		"/assets/css/font-awesome/webfonts/fa-solid-900.woff2",
		"/assets/js/app.js",
		"/assets/img/logo.svg",
		"/assets/img/fav_icon.png",
		"/assets/img/icon_192.png",
		"/assets/img/icon_512.png"
	],
	cacheable = arg => (arg.includes('no-store') || arg.includes('max-age=0')) === false;

self.addEventListener('activate', ev => ev.waitUntil(caches.keys().then(args => Promise.all(args.filter(i => i !== name).map(i => caches.delete(i)))).catch(() => void 0)));

self.addEventListener('install', ev => {
	self.skipWaiting();

	return ev.waitUntil(caches.open(name).then(cache => cache.addAll(urls)).catch(() => void 0));
});

self.addEventListener('fetch', ev => ev.respondWith(new Promise(async (resolve) => {
	const method = ev.request.method;
	let result;

	if (method === 'GET') {
		const cache = await caches.open(name),
			cached = await cache.match(ev.request),
			now = new Date().getTime();

		if (cached !== void 0) {
			const url = new URL(cached.url);

			if (urls.includes(url.pathname) || new Date(cached.headers.get('date')).getTime() + Number((cached.headers.get('cache-control') || '').replace(/[^\d]/g, '') || timeout) * 1e3 > now) {
				result = cached.clone();
			}
		}

		if (result === void 0) {
			result = fetch(ev.request).then(res => {
				if (res.type === 'basic' && res.status === 200 && cacheable(res.headers.get('cache-control') || '')) {
					cache.put(ev.request, res.clone());
				}

				return res;
			});
		}
	} else {
		result = fetch(ev.request).then(res => {
			if (res.type === 'basic' && res.status >= 200 && res.status < 400 && method !== 'HEAD' && method !== 'OPTIONS') {
				cache.delete(ev.request);
			}

			return res;
		});
	}

	resolve(result);
})));
