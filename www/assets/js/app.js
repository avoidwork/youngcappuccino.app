(async function (document, render, fetch, navigator) {
	const api = "https://api.youngcappuccino.app/api";

	function card (name = '', address = '') {
		return `
<p>
	<h3 class="title is-size-5">${name}</h3>
	<h4 class="subtitle is-size-6">${address}</h4>
</p>
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
			const $city = document.querySelector("#city"),
				$list = document.querySelector("#list");

			if (arg.city !== void 0) {
				render(() => {
					$city.innerText = arg.city.names.en;
					$city.parentElement.classList.remove("is-hidden");
				});
			}

			const results = await search(arg.location.latitude, arg.location.longitude);

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
		navigator.geolocation.getCurrentPosition(position => {
			display({
				location: position.coords
			});
		}, async () => display(await geoByIP()));
	} else {
		display(await geoByIP());
	}
}(document, window.requestAnimationFrame, fetch, navigator));
