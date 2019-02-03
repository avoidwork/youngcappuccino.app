(async function (document, render, fetch, navigator) {
	const api = "https://api.youngcappuccino.app/api";

	function log (arg, target = "log") {
		console[target](arg instanceof Object ? arg : `[app] ${arg}, timestamp=${new Date().toISOString()}`);
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
		log(`type=card, id=${id}, name=${name}`);

		return `
<div class="store">
	<div class="title is-size-3">${name}</div>
	<div class="subtitle is-size-5">${address}</div>
	<div>${icons("star", rating, 5)}</div>
	<div>${icons("dollar-sign", price, 5)}</div>
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
			log(`type=error, source=geoByIP, error="${error(err)}"`, "warn");
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

		log(`type=search, latitude=${lat}, longitude=${long}`);

		try {
			const res = await fetch(url.href, {
					method: "GET",
					mode: "cors",
					headers: {
						accept: "application/json"
					}
				}),
				data = await res.json();

			result = data.data;
			log(`type=search, latitude=${lat}, longitude=${long}, success=true, total=${result.length}`);
		} catch (err) {
			result = [];
			log(`type=error, source=search, error="${error(err)}"`, "warn");
		}

		return result;
	}

	async function display (arg) {
		if (arg !== null) {
			const $list = document.querySelector("#list"),
				results = await search(arg.location.latitude, arg.location.longitude),
				valid = results instanceof Array && results.length > 0;

			render(() => {
				if (valid === false) {
					$list.innerText = "Can't find an open cappuccino shop.";
				} else {
					$list.innerHTML = results.map(i => card(i.id, i.name, i.vicinity, Math.ceil(i.price_level), Math.ceil(i.rating))).join("\n");
				}

				$list.classList.remove("is-hidden");
				log(`type=display, total=${results.length}, message="${valid ? "Showing results" : "No results"}`);
			});
		}
	}

	if ("geolocation" in navigator) {
		log("type=geolocation, message=\"Supported in browser\"");
		navigator.geolocation.getCurrentPosition(position => display({location: position.coords}), async () => display(await geoByIP()), {enableHighAccuracy: true});
	} else {
		log("error=unsupported, origin=geolocation, message=\"Unsupported in browser\"");
		display(await geoByIP());
	}
}(document, window.requestAnimationFrame, fetch, navigator));
