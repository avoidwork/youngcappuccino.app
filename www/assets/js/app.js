(async function (navigator, render) {
	async function cityByIP () {
		const res = await fetch('//api.youngcappuccino.app/api/geo', {
			method: 'GET',
			mode: 'CORS'
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

	if ("geolocation" in navigator) {
		const city = await cityByIP(),
			$el = document.querySelector("#city");

		render(() => {
			$el.innerText = `for ${city.city}`;
		});
	} else {
		const city = await cityByIP(),
			$el = document.querySelector("#city");

		render(() => {
			$el.innerText = `for ${city.city}`;
		});
	}
})(navigator, window.requestAnimationFrame);
