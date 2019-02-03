(async function (render, fetch) {
	async function geoByIP () {
		const res = await fetch("//api.youngcappuccino.app/api/geo", {
			method: "GET",
			mode: "cors"
		}),
		data = await res.json();

		return data.data;
	}

	async function search (lat, long) {
		const url = new URL("https://api.youngcappuccino.app/api/search");

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
		const $el = document.querySelector("#city");

		render(() => {
			$el.innerText = `for ${geo.city.names.en}`;
		});

		const results = await search(geo.location.latitude, geo.location.longitude);

		console.log(results);
	}
}(window.requestAnimationFrame, fetch));
