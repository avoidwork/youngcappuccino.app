(async function (render, fetch) {
	async function geoByIP () {
		const res = await fetch("//api.youngcappuccino.app/api/geo", {
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
	}
}(window.requestAnimationFrame, fetch));
