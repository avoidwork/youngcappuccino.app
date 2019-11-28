const name = "young-cappuccino-cache-v4",
	timeout = 18e2, // 30 min
	urls = [
		"/",
		"/assets/css/bulma.css",
		"/assets/css/style.css",
		"/assets/css/style.css.map",
		"/assets/css/style.scss",
		"/assets/css/font-awesome/css/all.css",
		"/assets/css/font-awesome/webfonts/fa-solid-900.woff2",
		"/assets/js/app.js",
		"/assets/img/logo.svg",
		"/assets/img/fav_icon.png"
	],
	cacheable = (arg = '') => (arg.includes('no-cache') || arg.includes('no-store') || arg.includes('max-age=0')) === false;

self.addEventListener('activate', ev => ev.waitUntil(caches.keys().then(args => Promise.all(args.filter(i => i !== name).map(i => caches.delete(i)))).catch(() => void 0)));

self.addEventListener('install', ev => {
	self.skipWaiting();

	return ev.waitUntil(caches.open(name).then(cache => cache.addAll(urls)).catch(() => void 0));
});

self.addEventListener('fetch', ev => ev.respondWith(new Promise(async (resolve) => {
	let result;

	if (ev.request.method === 'GET') {
		const cache = await caches.open(name),
			cached = await cache.match(ev.request),
			now = new Date().getTime();

		if (cached !== void 0 && new Date(cached.headers.get('date')).getTime() + Number((cached.headers.get('cache-control') || '').replace(/[^\d]/g, '') || timeout) * 1e3 > now) {
			result = cached.clone();
		} else {
			result = fetch(ev.request).then(res => {
				if (res.status === 200 && res.type === 'basic' && cacheable(res.headers.get('cache-control'))) {
					cache.put(ev.request, res.clone());
				}

				return res;
			});
		}
	}

	resolve(result);
})));
