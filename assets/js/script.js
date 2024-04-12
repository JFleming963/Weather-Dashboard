// Vars ----------------------------------------
let cityInputEl = $('#city-input'); 
let citySelectFormEl = $('#city-select');
let savedCityInputEl = $('#saved-cities');

let lat;
let lon;

// ------------------------------------------------------------------

function saveToLocalStorage(saveOurCity) { 
    localStorage.setItem('Saved-To-Storage', JSON.stringify(saveOurCity));
 }

//  function loadFromLocalStorage() {
//     JSON.parse(localStorage.getItem("savedCities"));
//     if (!Array.isArray(loadedCity)) {
//         loadedCity = [];
//     }
//     return loadedCity
//  }

// ------------------------------------------------------------------

function getCoordingates(city, callback) {

    const requestUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},us&limit=5&appid=0a2ac5dbbeb08b5bafd134ce15a7e8c5`;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })

        .then(function (data) {
            console.log('Get coordingates .....................................');
            console.log(data);
        
            lat = data[0].lat;
            lon = data[0].lon;

            let cityAndStateName = `${data[0].name}, ${data[0].state}`
            saveToLocalStorage(cityAndStateName);
         
            $('#current-city').text(`${cityAndStateName}`);

            getCurrentWeather(lat, lon);
            getForecast(lat, lon, callback)

            saveToLocalStorage(cityAndStateName)
            updateSavedCities(cityAndStateName);
        })
};

// ---------------------------------------------------------------------------------

function getCurrentWeather(lat, lon) {
    const requestUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=0a2ac5dbbeb08b5bafd134ce15a7e8c5`;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })

        .then(function (data) {
            console.log('Get current weather .....................................');
            console.log(data);

            
         
            let imgSrc = $.parseHTML(`
            <div class = "card shadow">
            <img src = "https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt = "" data-toggle = "tooltip" title = "${data.weather[0].main}"/>
            </div>
            `)

            let currentTemp = parseInt(data.main.temp);

            
            $('#current-temp').text(`Current temp: ${currentTemp}° F`);
            $('#current-icon').empty();
            $('#current-icon').append(imgSrc);
            $('#current-wind-speed').text(`Wind: ${data.wind.speed} mph`);
            $('#current-humidity').text(`Humidity: ${data.main.humidity} %`);
        });
};

// ---------------------------------------------------------------------------------

function getForecast(lat, lon, callback) {
    const requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=0a2ac5dbbeb08b5bafd134ce15a7e8c5`;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })

        .then(function (data) {
            console.log('Get forecast .....................................');
            console.log(data);
            $('#forecast-cards-container').empty();
            for (let i = 3; i < data.list.length; i += 8) {
                let forecast = data.list[i].main
                let day = `Day ${i / 8 + 1}:`;

                renderCard($('#forecast-cards-container'), data.list[i]);
            }

            if (typeof callback == 'function') {
                callback();
            }
        });
};

// ---------------------------------------------------------------------------------

function renderCard(cardsContainer, forecastData) {

    let forecastCard = $.parseHTML(`
        <div class="card col-12 col-md-2 shadow ">
        <img class="card-img-top" src = "" alt = "Title" />
        <div class="card-body">
            <h4 class="card-title">Title</h4>
            <p class="card-text">Text</p>
        </div>
        </div>`);

    let imgSrc = `https://openweathermap.org/img/w/${forecastData.weather[0].icon}.png`;
    $(forecastCard).find(".card-img-top").attr("src", imgSrc);


    
    $(cardsContainer).append(forecastCard);
}

// ---------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------

function updateSavedCities(cityName) {
   
        let savedCities = JSON.parse(localStorage.getItem("savedCities"));

        if (!Array.isArray(savedCities)) {
            savedCities = [];
        }

        if (!savedCities.includes(cityName)) {
            savedCities.push(cityName);
          }

          savedCities.sort();
        //   console.log("Sort Saved Cities ..........................");
        //   console.log(savedCities);
        localStorage.setItem('savedCities', JSON.stringify(savedCities));
       
        addSearchHistFunc(savedCities);   
}

// ---------------------------------------------------------------------------------

function addSearchHistFunc(savedCitiesObj) {

    $('#saved-cities').empty();
  
    $('#saved-cities').append($.parseHTML(`<option value = "Search-History">Search History</option>`));

    for (i = 0; i < savedCitiesObj.length; i++) {

        let addSearchHist = $.parseHTML(`
            <option value = "${savedCitiesObj[i]}">${savedCitiesObj[i]}</option>
        `)
       
        $('#saved-cities').append(addSearchHist);
    }
}

// ---------------------------------------------------------------------------------

function loadSavedCities() {
    
    let savedCities = JSON.parse(localStorage.getItem("savedCities"));
   
    if (!Array.isArray(savedCities)) {
        savedCities = [];
    }

    addSearchHistFunc(savedCities);
}

// ---------------------------------------------------------------------------------

function apiCalls(city) {
  
    getCoordingates(city, function () {
        $('#results-container').fadeIn("slow");
        // $('#current-weather').fadeIn("fast");
    });
}

// ---------------------------------------------------------------------------------

citySelectFormEl.on('submit', function (event) {

    event.preventDefault();
    
    let selectedOption = $('.city-input').val();

    if (selectedOption !== "") {

        apiCalls(selectedOption);
        $('#city-input').val("");
    }
});

// -----------------------------------------------

savedCityInputEl.on('input', function(event) {

    let selectedOption = $('#saved-cities').val();

    console.log("dropdown selected option ...........................");
    console.log(selectedOption);
    console.log(event);
        localStorage.setItem('selectedCity', JSON.stringify(selectedOption));
        // console.log(" ...........................");
        apiCalls(selectedOption);
        $('#city-input').val("");    
})

// -----------------------------------------------

$(document).ready(function () {
    let savedCity = JSON.parse(localStorage.getItem('Saved-To-Storage'));
    let printedCity = JSON.parse(localStorage.getItem('Saved-To-Storage'));
    apiCalls(savedCity, printedCity);
    $('[data-toggle="tooltip"]').tooltip();

    loadSavedCities();
});

// --------------------------------------------------------------