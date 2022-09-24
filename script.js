document.querySelector("#btnSearch").addEventListener('click', () => {
    let text = document.querySelector("#txtSearch").value;
    document.querySelector("#loading").style.display = "block";
    getCountry(text);
});

document.querySelector("#btnLocation").addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
        document.querySelector("#loading").style.display = "block";
    }
});

// geolocation
async function onSuccess(position) {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;

    // opencagedata API
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=2a50d2d95b3145989151240f18b6ea6d&language=en&pretty=1`);
    const data = await response.json(); 
    const country = data.results[0].components.country;
    
    document.querySelector("#txtSearch").value = country;
    getCountry(country);
}

function onError(err) {
    renderError(err);
}


async function getCountry(country) {
    try {
        // main country
        const response = await fetch('https://restcountries.com/v3.1/name/' + country);
        if (!response.ok) {
            document.querySelector("#country-details").innerHTML = "";
            document.querySelector("#neighbors").innerHTML = "";
            throw new Error("Country is not found");
        }

        const data = await response.json();
        renderCountry(data[0]);

        // neighboring countries
        const countries = data[0].borders;
        if (!countries) {
            throw new Error(`There is no neighboring country of ${country}`);
        }
        const response2 = await fetch('https://restcountries.com/v3.1/alpha?codes=' + countries.toString());
        const neighbors = await response2.json();
        renderNeighbors(neighbors);
    } catch (err) {
        renderError(err);
    }
}

// main country
function renderCountry(data) {

    document.querySelector("#loading").style.display = "none";
    document.querySelector("#neighbors").innerHTML = "";

    let html = `
        <div class="card-header">
            Search Result
        </div>

        <div class="card-body">
            <div class="row">
                <div class="col-4">
                    <img src="${data.flags.png}" alt="" class="img-fluid">
                </div>

                <div class="col-8">
                    <h3 class="card-title">${data.name.common}</h3>
                    <hr>

                    <div class="row">
                        <div class="col-4">Population: </div>
                        <div class="col-8">${(data.population / 1000000).toFixed(1)} million</div>
                    </div>

                    <div class="row">
                        <div class="col-4">Official language: </div>
                        <div class="col-8">${Object.values(data.languages)}</div>
                    </div>

                    <div class="row">
                        <div class="col-4">Capital: </div>
                        <div class="col-8">${data.capital[0]}</div>
                    </div>

                    <div class="row">
                        <div class="col-4">Currency unit: </div>
                        <div class="col-8">${Object.values(data.currencies)[0].name} (${Object.values(data.currencies)[0].symbol})</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.querySelector("#country-details").innerHTML = html;
    document.querySelector("#errors").innerHTML = "";
}

// neighboring countries
function renderNeighbors(data) {
    let html = "";
    for (let country of data) {
        html += `
            <div class="col-3 mt-2">
                <div class="card neighbor">
                    <img src="${country.flags.png}" class="card-img-top">
                     <div class="card-body">
                        <h6 class="card-title neighborTitle">${country.name.common}</h6> 
                     </div> 
                </div>
            </div>
        `;

        document.querySelector("#neighbors").innerHTML = html;
    }

    // selecting neighbor country
    document.querySelectorAll(".neighbor").forEach(item => {
        item.addEventListener('click', () => {
            let neighborTitle = item.querySelector(".neighborTitle").textContent;

            document.querySelector("#txtSearch").value = neighborTitle;
            getCountry(neighborTitle);
        });
    });
}

// error mesage on UI
function renderError(err) {
    const html = `
        <div class="alert alert-danger">
            ${err.message}
        </div>
    `;

    setTimeout(function () {
        document.querySelector("#errors").innerHTML = "";
    }, 3000)

    document.querySelector("#errors").innerHTML = html;
    document.querySelector("#loading").style.display = "none";
}