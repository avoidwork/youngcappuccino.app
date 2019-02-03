(async function (document, render, fetch, navigator) {
	const api = "https://api.youngcappuccino.app/api";

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
	<div class="title is-size-5">${name}</div>
	<div class="subtitle is-size-6">${address}</div>
	<div>${icons("dollar-sign", price, 5)}</div>
	<div>${icons("star", rating, 5)}</div>
</div>
`;
	}

	async function geoByIP () {
		const url = new URL(`${api}/geo`);

		url.searchParams.append("format", "application/json");

		const res = await fetch(url.href, {
			method: "GET",
			mode: "cors",
			headers: {
				accept: "application/json"
			}
		}),
		data = await res.json();

		return data.data;
	}

	async function search (lat, long) {
		const url = new URL(`${api}/search`);

		url.searchParams.append("format", "application/json");
		url.searchParams.append("lat", lat);
		url.searchParams.append("long", long);

		const res = await fetch(url.href, {
				method: "GET",
				mode: "cors",
				headers: {
					accept: "application/json"
				}
			}),
			data = await res.json();

		return data.data;
	}

	async function display (arg) {
		if (arg !== null) {
			const $list = document.querySelector("#list"),
				results = await search(arg.location.latitude, arg.location.longitude);

			render(() => {
				if (results === null) {
					$list.innerText = "Can't find a coffee shop that's open";
				} else {
					results.length = 2;
					$list.innerHTML = results.map(i => card(i.name, i.formatted_address)).join("\n");
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
