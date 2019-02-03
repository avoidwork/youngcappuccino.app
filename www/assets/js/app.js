(async function (document, render, fetch, navigator) {
	const api = "https://api.youngcappuccino.app/api";

	function log (arg, target = "log") {
		console[target] = arg instanceof Object ? arg : `[app] ${arg}, timestamp=${new Date().toISOString()}`;
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

	function card (name = "", address = "", price = 1, rating = 1) {
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
		url.searchParams.append("lat", lat);
		url.searchParams.append("long", long);

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
					results.length = 2;
					$list.innerHTML = results.map(i => card(i.name, i.formatted_address, Math.ceil(i.price_level), Math.ceil(i.rating))).join("\n");
				}

				$list.classList.remove("is-hidden");
			});
		}
	}

	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(position => display({location: position.coords}), async () => display(await geoByIP()));
	} else {
		display(await geoByIP());
	}
}(document, window.requestAnimationFrame, fetch, navigator));
