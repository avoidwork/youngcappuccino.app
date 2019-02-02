(async function (navigator, render) {
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

	function locale (arg = '') {
		return arg.replace(/[^a-b+]/, "");
	}

	function language () {
		return "languages" in navigator ? navigator.languages[0] : navigator.language;
	}

	if ("geolocation" in navigator) {
		const geo = await geoByIP(),
			$el = document.querySelector("#city");

		render(() => {
			$el.innerText = `for ${geo.city.names[locale(language())]}`;
		});
	} else {
		const geo = await geoByIP(),
			$el = document.querySelector("#city");

		render(() => {
			$el.innerText = `for ${geo.city.names[locale(language())]}`;
		});
	}
})(navigator, window.requestAnimationFrame);
