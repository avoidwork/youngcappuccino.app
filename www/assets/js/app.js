(async function (render, fetch) {
	const api = "https://api.youngcappuccino.app/api";

	function card (name = '', address = '') {
		return `
<div class="card">
  <div class="card-content">
    <div class="content">
      <h1>${name}</h1>
      <p>${address}</p>
    </div>
  </div>
</div>
`;
	}

	async function geoByIP () {
		const res = await fetch(`${api}/geo`, {
			method: "GET",
			mode: "cors"
		}),
		data = await res.json();

		return data.data;
	}

	async function search (lat, long) {
		const url = new URL(`${api}/search`);

		url.searchParams.append("lat", lat);
		url.searchParams.append("long", long);

		const res = await fetch(url.href, {
				method: "GET",
				mode: "cors"
			}),
			data = await res.json();

		return data.data;
	}

	const geo = await geoByIP();

	if (geo !== null) {
		const $city = document.querySelector("#city"),
			$list = document.querySelector("#list");

		render(() => {
			$city.innerText = geo.city.names.en;
			$city.parentElement.classList.remove("is-hidden");
		});

		const results = await search(geo.location.latitude, geo.location.longitude);

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
}(window.requestAnimationFrame, fetch));
