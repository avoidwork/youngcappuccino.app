(async function (render, fetch) {
	const api = "https://api.youngcappuccino.app/api";

	function card (name = '', address = '') {
		return `
<div class="card">
  <div class="card-content">
    <p class="title">
      “There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors.”
    </p>
    <p class="subtitle">
      Jeff Atwood
    </p>
  </div>
  <footer class="card-footer">
    <p class="card-footer-item">
      <span>
        View on <a href="https://twitter.com/codinghorror/status/506010907021828096">Twitter</a>
      </span>
    </p>
    <p class="card-footer-item">
      <span>
        Share on <a href="#">Facebook</a>
      </span>
    </p>
  </footer>
</div>
<div class="card">
  <div class="card-content">
    <div class="content">
      <h3 class="is-size-4">${name}</h3>
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
