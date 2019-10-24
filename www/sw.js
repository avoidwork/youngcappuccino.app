const name = "young-cappuccino-cache-v2",
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

self.addEventListener('activate', ev => ev.waitUntil(caches.keys().then(args => {
	const x = args.filter(i => i !== name);

	return x.length === 0 ? Promise.resolve() : Promise.all(x.map(i => caches.delete(i)));
})));

self.addEventListener('install', ev => {
	self.skipWaiting();

	return ev.waitUntil(caches.open(name).then(cache => cache.addAll(urls)).catch(() => void 0));
});

self.addEventListener('fetch', ev => ev.respondWith(new Promise(async resolve => {
	const cache = await caches.open(name),
		cached = await cache.match(ev.request);
	let res;

	try {
		if (ev.request.method === 'GET') {
			const now = new Date().getTime();

			if (cached !== void 0 && new Date(cached.headers.get('date')).getTime() + Number((cached.headers.get('cache-control') || '').replace(/[^\d]/g, '') || timeout) * 1e3 > now) {
				res = cached.clone();
			} else {
				res = await fetch(ev.request);

				if (res.status === 200 && res.type === 'basic' && cacheable(res.headers.get('cache-control'))) {
					await cache.put(ev.request, res.clone());
				}
			}
		} else {
			res = await fetch(ev.request);

			if (ev.request.method !== 'HEAD' && ev.request.method !== 'OPTIONS' && res.status < 400 && res.type === 'basic') {
				await cache.delete(ev.request);
			}
		}
	} catch (err) {
		void 0;
	}

	resolve(res);
})));