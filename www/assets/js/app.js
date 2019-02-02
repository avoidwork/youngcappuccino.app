(async function (render, fetch) {
	async function geoByIP () {
		const res = await fetch("//api.youngcappuccino.app/api/geo", {
			method: "GET",
			mode: "cors"
		}),
		data = await res.json();
		let result;

		if (res.ok) {
			result = data.data;
		} else {
			result = null;
		}

		return result;
	}

	const geo = await geoByIP(),
		$el = document.querySelector("#city");

	render(() => {
		$el.innerText = `for ${geo.city.names.en}`;
	});
}(window.requestAnimationFrame, fetch));
