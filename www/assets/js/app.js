(async function (document, render, fetch, navigator) {
	const api = "https://api.youngcappuccino.app/api",
		logo = `
               Y88b   d88P                                        .d8888b.                                                       d8b
   ( (          Y88b d88P                                        d88P  Y88b                                                      Y8P
    ) )          Y88o88P                                         888    888
  ........        Y888P  .d88b.  888  888 88888b.   .d88b.       888         8888b.  88888b.  88888b.  888  888  .d8888b .d8888b 888 88888b.   .d88b.
  |      |]        888  d88""88b 888  888 888 "88b d88P"88b      888            "88b 888 "88b 888 "88b 888  888 d88P"   d88P"    888 888 "88b d88""88b
  \\      /         888  888  888 888  888 888  888 888  888      888    888 .d888888 888  888 888  888 888  888 888     888      888 888  888 888  888
   \`----'          888  Y88..88P Y88b 888 888  888 Y88b 888      Y88b  d88P 888  888 888 d88P 888 d88P Y88b 888 Y88b.   Y88b.    888 888  888 Y88..88P
                   888   "Y88P"   "Y88888 888  888  "Y88888       "Y8888P"  "Y888888 88888P"  88888P"   "Y88888  "Y8888P "Y8888P 888 888  888  "Y88P"
                                                        888                          888      888
                                                   Y8b d88P                          888      888
                                                    "Y88P"                           888      888

`;

	function log (arg, target = "log", passthrough = false) {
		console[target](passthrough === true || arg instanceof Object ? arg : `[yc] ${arg}, timestamp=${new Date().toISOString()}`);
	}

	function error (arg) {
		return arg.message || arg.stack || arg;
	}

	function icons (icon, n = 1, nth = 5) {
		const result = [];
		let i = -1,
			max = nth + 1;

		while (++i < n) {
			result.push(`<i class="fas fa-${icon}"></i>`);
		}

		i = n;
		while (++i < max) {
			result.push(`<i class="fas fa-${icon} is-disabled"></i>`);
		}

		return result.join("");
	}

	function card (id = 0, name = "", address = "", price = 1, rating = 1) {
		log(`type=card, id=${id}, name="${name}"`);

		return `
<div class="column is-one-third">
	<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank" title="${name}" rel="noreferrer">
		<div class="store">
			<div class="title is-size-3 is-size-4-mobile">${name}</div>
			<div class="subtitle is-size-5 is-size-6-mobile">${address}</div>
			<div>${icons("star", rating, 5)}</div>
			<div>${icons("dollar-sign", price, 5)}</div>
		</div>
	</a>
</div>
`;
	}

	async function geoByIP () {
		const url = new URL(`${api}/geo`);
		let result;

		url.searchParams.append("format", "application/json");
		log("type=geoByIP, message=\"Trying to determine location by IP\"");

		try {
			const res = await fetch(url.href, {
					credentials: "include",
					method: "GET",
					mode: "cors",
					headers: {
						accept: "application/json"
					}
				}),
				data = await res.json();

			result = data.data;
			log("type=geoByIP, message=\"Retrieved co-ordinates by IP\"");
		} catch (err) {
			result = null;
			log(`type=error, source=geoByIP, error="${error(err)}"`);
		}

		return result;
	}

	async function search (lat, long) {
		const url = new URL(`${api}/search`);
		let result;

		url.searchParams.append("format", "application/json");
		url.searchParams.append("page_size", "6");
		url.searchParams.append("lat", lat);
		url.searchParams.append("long", long);

		log(`type=search, latitude=${lat}, longitude=${long}, action=query`);

		try {
			const res = await fetch(url.href, {
					credentials: "include",
					method: "GET",
					mode: "cors",
					headers: {
						accept: "application/json"
					}
				}),
				data = await res.json();

			result = [data.data || [], res.status];
			log(`type=search, latitude=${lat}, longitude=${long}, success=true, total=${result.length}`);
		} catch (err) {
			result = [[], 500];
			log(`type=error, source=search, success=false, message="${error(err)}"`);
		}

		return result;
	}

	function chunk (arg = [], size = 3) {
		const result = [],
			nth = Math.ceil(arg.length / size);
		let i = -1;

		while (++i < nth) {
			const start = i * size,
				end = start + size;

			result.push(arg.slice(start, end));
		}

		return result;
	}

	async function display (arg) {
		if (arg !== null) {
			const $list = document.querySelector("#list"),
				$loading = document.querySelector("#loading"),
				results = await search(arg.location.latitude, arg.location.longitude),
				valid = results[0].length > 0,
				cafes = valid ? chunk(results[0], 3).map(r => `<div class="columns">${r.map(i => card(i.id, i.name, i.address, Math.ceil(i.price), Math.ceil(i.rating))).join("\n")}</div>`).join("\n") : "";

			render(() => {
				if (valid === false) {
					$list.innerText = results[1] === 429 ? "Please wait, too many requests." : "Couldn't find a cafe.";
					log("type=error, source=display, success=false, message=\"Couldn't find a cafe.\"");
				} else {
					$list.innerHTML = cafes;
				}

				$loading.classList.add("is-hidden");
				$list.classList.remove("is-hidden");
				log(`type=display, total=${valid ? results[0].length : 0}, message="${valid ? "Showing results" : "No results"}"`);
			});
		}
	}

	log(logo, "log", true);

	if ("serviceWorker" in navigator) {
		window.addEventListener("load", async () => {
			try {
				const registration = await navigator.serviceWorker.register("/sw.js", {scope: "/"});

				log(`type=serviceWorker, message="ServiceWorker registration successful with scope: ${registration.scope}"`);
			} catch (err) {
				log(`type=error, source=serviceWorker, message="ServiceWorker registration failed: ${err.message}"`);
			}
		});
	}

	if ("geolocation" in navigator) {
		log("type=geolocation, message=\"Supported in browser\"");
		navigator.geolocation.getCurrentPosition(position => display({location: position.coords}), async () => display(await geoByIP()), {enableHighAccuracy: true});
	} else {
		log("error=unsupported, origin=geolocation, message=\"Unsupported in browser\"");
		display(await geoByIP());
	}
}(document, window.requestAnimationFrame, fetch, navigator));
