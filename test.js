//const baseAMCUrl = 'https://api.amctheatres.com/';
//const baseGLUUrl = 'https://api-gate.movieglu.com/';
const baseSHOWUrl = 'https://api.internationalshowtimes.com/v4/'

const endTime = '24:00:00-07:00';

/*
var requestAMC = new Request(baseAMCUrl + '/v1/states', {
    method: 'GET',
    mode: 'no-cors',
    redirect: 'follow',
    headers: new Headers({
        'X-AMC-Vendor-Key': 'D3999F82-4D77-47EF-8D9A-EAFFB3A5E940'
    })
});

var requestGLU = new Request(baseGLUUrl + 'filmsNowShowing/?n=10', {
    method: 'GET',
    headers: new Headers({
        'client': 'BEZU',
        'x-api-key': 'Py9r9kCLGH9m75YLu7qffoJDKxmGndg4JW0OuI8g',
        'Authorization': 'Basic QkVaVTpIUXZUdGhpc1lhRXY=',
        'api-version': 'v102'
    })
});
*/

var theatreName, theatreId;
var movieName, movieId;
var time;
var image;
var done = false;
var movieDate;

var lat = '33.707215';
var lon = '-117.890159';

var countryCode = "US";

var startTime;

var theatres = [],
    movieTitles = [],
    movieIds = [],
    movieImgs = [],
    ids = [],
    times = [],
    chainIds = [],
    chain_names = [];

function initialize() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = mm + '/' + dd + '/' + yyyy;

    document.getElementById("datepicker").defaultValue = today;

    let offset = new Date().getTimezoneOffset();
    let minutes = offset % 60;
    offset /= 60;
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let suffix = "";
    if (offset < 0) {
        suffix = suffix + "+";
    } else {
        suffix = suffix + "-";
    }

    if (offset < 10) {
        suffix = suffix + "0";
    }

    suffix = suffix + offset + ":" + minutes;

    let tim = "";
    let dateTime = new Date();

    if (dateTime.getHours() < 0) {
        tim = tim + "0";
    }

    tim = tim + dateTime.getHours() + ":" + ((dateTime.getMinutes() < 10) ? '0' + dateTime.getMinutes() : dateTime.getMinutes()) + ":" + dateTime.getSeconds();
    startTime = tim + suffix;
    console.log(startTime);
    document.getElementById('tim').value = fixTime(tim);

    if (location.protocol != 'https:') {
        if (window.chrome) {
            console.log("On unsecure chrome");
            createLoader();
            fetch("http://ip-api.com/json")
                .then((resp) => resp.json())
                .then(function (data) {

                    let zip = "";
                    zip = data.zip;
                    countryCode = data.countryCode;
                    document.getElementById('zip').value = zip;

                    fetch("http://maps.googleapis.com/maps/api/geocode/json?address=" + zip)
                        .then((resp) => resp.json())
                        .then(function (data) {
                            lat = data.results[0].geometry.location.lat;
                            lon = data.results[0].geometry.location.lng;

                            console.log(lat + ':' + lon)
                        })
                        .catch(function (error) {
                            console.log(error);
                        })

                    let request = new Request(baseSHOWUrl + "cinemas/?location=" + lat + "," + lon + "&distance=10", {
                        method: 'GET',
                        headers: new Headers({
                            'X-API-Key': 'irgO5r5ctoiDKwlozx8sjiinAQT1qTWl'
                        })
                    })

                    fetch(request)
                        .then((resp) => resp.json())
                        .then(function (data) {
                            let cinemas = data.cinemas;
                            cinemas.map(function (cins) {
                                if (!contains.call(chainIds, cins.chain_id)) {
                                    chainIds.push(cins.chain_id);
                                }
                            })
                            let request2 = new Request(baseSHOWUrl + "chains/?countries=" + countryCode, {
                                method: 'GET',
                                headers: new Headers({
                                    'X-API-Key': 'irgO5r5ctoiDKwlozx8sjiinAQT1qTWl'
                                })
                            })

                            fetch(request2)
                                .then((resp) => resp.json())
                                .then(function (data) {
                                    for (let i = 0; i < chainIds.length; i++) {
                                        let diffChains = data.chains;
                                        diffChains.map(function (ch) {
                                            if (ch.id == chainIds[i]) {
                                                console.log("Making buttons");
                                                ((document.getElementById("sp") != null) ? deleteElement("sp") : null);
                                                createButton(ch.name);
                                                chain_names.push(ch.name);
                                            }
                                        })
                                    }
                                })
                                .catch(function (error) {
                                    console.log(error);
                                })
                        })
                        .catch(function (error) {
                            console.log(error);
                        })
                })
                .catch(function (error) {
                    console.log(error);
                    countryCode = "US";
                })
        }else{
            navigator.geolocation.getCurrentPosition(onLocationSuccess);
        }
    }else{
        navigator.geolocation.getCurrentPosition(onLocationSuccess);
    }
}

function startRequests() {
    emptyVariables();
    createLoader();
    
    if (document.getElementById("err") != null) {
        deleteElement("err");
    }
    movieDate = getDate(document.getElementById('datepicker').value);

    let activeChains = "";
    for (let i = 0; i < chain_names.length; i++) {
        if (document.getElementById(chain_names[i]).classList.contains('active')) {
            activeChains += chainIds[i] + ',';
            console.log("Active " + chain_names[i] + " " + chainIds[i]);
        }
    }
    activeChains = activeChains.substring(0, activeChains.length - 1);

    let requestSHOWTheatres = new Request(baseSHOWUrl + 'cinemas/?location=' + lat + ',' + lon + '&distance=' + document.getElementById('rad').value + '&chain_ids=' + activeChains, {
        method: 'GET',
        headers: new Headers({
            'X-API-Key': 'irgO5r5ctoiDKwlozx8sjiinAQT1qTWl'
        })
    });

    fetch(requestSHOWTheatres)
        .then((resp) => resp.json())
        .then(function (data) {
            let locations = data.cinemas;

            locations.map(function (cinemas) {
                let name = cinemas.name;
                console.log(name);
                theatres.push(name);
                ids.push(cinemas.id);
            })

            let num = Math.floor(Math.random() * theatres.length);
            theatreName = theatres[num];
            theatreId = ids[num];

            nextRequest();
        })
        .catch(function (error) {
            console.log(error);
            createError("Could not find any theatres with your selection.");
            ((document.getElementById("sp") != null) ? deleteElement("sp") : null);
        })
}

function nextRequest() {
    console.log(theatreName);
    startTime = parseTime(document.getElementById('tim').value);
    var requestSHOWMovies = new Request(baseSHOWUrl + 'movies/?countries=' + countryCode + '&cinema_id=' + theatreId + '&fields=title,id,poster_image.flat&release_date_to=' + movieDate + '&time_from=' + movieDate + 'T' + startTime + '&time_to=' + movieDate + 'T' + endTime, {
        method: 'GET',
        headers: new Headers({
            'X-API-Key': 'irgO5r5ctoiDKwlozx8sjiinAQT1qTWl'
        })
    });

    fetch(requestSHOWMovies)
        .then((resp) => resp.json())
        .then(function (data) {
            let diffMovies = data.movies;
            console.log(data);
            diffMovies.map(function (movies) {
                movieTitles.push(movies.title);
                movieIds.push(movies.id);
                movieImgs.push(movies.poster_image)
            })

            let num = Math.floor(Math.random() * movieTitles.length);
            movieName = movieTitles[num];
            movieId = movieIds[num];
            image = movieImgs[num];

            thirdRequest();
        })
        .catch(function (error) {
            console.log(error);
            createError("Could not find any movies with your selection.");
            ((document.getElementById("sp") != null) ? deleteElement("sp") : null);
        })
}

function thirdRequest() {
    console.log(movieName);

    startTime = parseTime(document.getElementById('tim').value);
    var requestSHOWTimes = new Request(baseSHOWUrl + 'showtimes/?countries=US&cinema_id=' + theatreId + '&time_from=' + movieDate + 'T' + startTime + '&time_to=' + movieDate + 'T' + endTime + '&movie_id=' + movieId, {
        method: 'GET',
        headers: new Headers({
            'X-API-Key': 'irgO5r5ctoiDKwlozx8sjiinAQT1qTWl'
        })
    });

    fetch(requestSHOWTimes)
        .then((resp) => resp.json())
        .then(function (data) {
            let diffTimes = data.showtimes;
            diffTimes.map(function (diffTimes) {
                times.push(diffTimes.start_at);
            })

            let num = Math.floor(Math.random() * theatres.length);
            time = times[num];
            console.log(time);

            finish();
        })
        .catch(function (error) {
            console.log(error);
            createError("Could not find any showtimes with your selection.");
            ((document.getElementById("sp") != null) ? deleteElement("sp") : null);
        })
}

function finish() {
    makeImg(image);
    deleteElement('cont');
    createHeading("h1", movieName);
    createHeading("h2", theatreName);

    let cleanTime = clean(time);

    createHeading("h2", cleanTime);
}

function clean(time) {
    if (time != null) {
        let suffix = "A.M."
        let text = time.substring(5 + 3 + 3, 5 + 3 + 3 + 1 + 3 + 1);
        let hr = text.substring(0, 2);
        let min = text.substring(3, 5);

        if (hr > 12) {
            hr -= 12;
            suffix = "P.M.";
        } else if (hr == 12) {
            suffix = "P.M.";
        }

        return hr + ":" + min + " " + suffix;
    } else {
        return "--:--";
    }
}

function parseTime(time_) {
    let hr = time_.substring(0, 2);
    let min = time_.substring(3, 5);

    if (hr.indexOf(':') > -1) {
        hr = "0" + time_.substring(0, 1);
        min = time_.substring(2, 4);
    }

    if (time_.indexOf('P') > -1 || time_.indexOf('p') > -1) {
        hr = parseInt(hr) + 12;
    }

    let offset = new Date().getTimezoneOffset();
    let minutes = offset % 60;
    offset /= 60;
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let suffix = "";
    if (offset < 0) {
        suffix = suffix + "+";
    } else {
        suffix = suffix + "-";
    }

    if (offset < 10) {
        suffix = suffix + "0";
    }

    suffix = suffix + offset + ":" + minutes;

    return hr + ":" + min + ":00" + suffix;
}

function fixTime(time_) {
    let hr = time_.substring(0, 2);
    let min = time_.substring(3, 5);
    let suffix = "A.M.";
    
    if (hr.indexOf(':') > -1) {
        hr = time_.substring(0, 1);
        min = time_.substring(2, 4);
    }

    if (hr > 12) {
        hr -= 12;
        suffix = "P.M.";
    } else if (hr == 12) {
        suffix = "P.M.";
    }

    return hr + ":" + min + " " + suffix;
}

function createButton(text) {
    let element = document.createElement("label");
    element.className = "btn btn-secondary";
    element.id = text;

    let btn = document.createElement("input");
    btn.type = "checkbox";
    element.appendChild(btn);
    element.textContent = text;
    document.getElementById("btns").appendChild(element);
}

function createError(text) {
    if (document.getElementById('err') != null) {
        deleteElement('err');
    }

    let d = document.createElement('div');
    d.id = "err";
    let x = document.createElement("p");
    x.setAttribute("class", "h2 text-center");
    let node = document.createTextNode(text);
    x.appendChild(node);
    d.appendChild(x);
    document.getElementById('cont').appendChild(d);
}

function deleteElement(elementId) {
    let element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

function createHeading(size, text) {
    let x = document.createElement("p");
    x.setAttribute("class", size);
    let node = document.createTextNode(text);
    x.appendChild(node);
    document.getElementById("place").appendChild(x);
}

function makeImg(img) {
    var x = document.createElement("img");
    x.setAttribute("src", img);
    x.setAttribute("height", "485");
    x.setAttribute("width", "300");

    document.getElementById("place").appendChild(x);
}

var contains = function (needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (needle) {
            var i = -1,
                index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if ((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

function getDate(date) {
    let newDate = '';

    newDate = newDate + date.substring(3 + 3, 3 + 3 + 4) + '-' + date.substring(0, 2) + '-' + date.substring(3, 3 + 2);

    return newDate;
}

function updateTheatres() {
    chain_names.forEach(element => {
        deleteElement(element);
    });

    createLoader();

    let z = document.getElementById('zip').value;
    let r = document.getElementById('rad').value;

    fetch("http://maps.googleapis.com/maps/api/geocode/json?address=" + z)
        .then((resp) => resp.json())
        .then(function (data) {
            lat = data.results[0].geometry.location.lat;
            lon = data.results[0].geometry.location.lng;
            console.log(lat + ":" + lon)
        })
        .catch(function (error) {
            console.log(error);
        })

    let request = new Request(baseSHOWUrl + "cinemas/?location=" + lat + "," + lon + "&distance=" + r, {
        method: 'GET',
        headers: new Headers({
            'X-API-Key': 'irgO5r5ctoiDKwlozx8sjiinAQT1qTWl'
        })
    })

    fetch(request)
        .then((resp) => resp.json())
        .then(function (data) {
            let cinemas = data.cinemas;
            chainIds = [];
            cinemas.map(function (cins) {
                if (!contains.call(chainIds, cins.chain_id)) {
                    chainIds.push(cins.chain_id);
                }
            })

            let request2 = new Request(baseSHOWUrl + "chains/?countries=" + countryCode, {
                method: 'GET',
                headers: new Headers({
                    'X-API-Key': 'irgO5r5ctoiDKwlozx8sjiinAQT1qTWl'
                })
            })

            fetch(request2)
                .then((resp) => resp.json())
                .then(function (data) {
                    chain_names = [];
                    console.log(data);
                    for (let i = 0; i < chainIds.length; i++) {
                        let diffChains = data.chains;
                        diffChains.map(function (ch) {
                            if (ch.id == chainIds[i]) {
                                ((document.getElementById("sp") != null) ? deleteElement("sp") : null);
                                createButton(ch.name);
                                chain_names.push(ch.name);
                            }
                        })
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })

        })
        .catch(function (error) {
            console.log(error);
        })
}

function emptyVariables(){
    theatres = [],
    movieTitles = [],
    movieIds = [],
    movieImgs = [],
    ids = [],
    times = [];

    theatreName = "", theatreId = '';
    movieName = '', movieId = '';
    time = '';
    image = '';
    done = false;
    movieDate = '';
}

function onLocationSuccess(position){
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    fetch("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon)
    .then((resp) => resp.json())
    .then(function (data){
        console.log(data);
        document.getElementById('zip').value = data.results[0].address_components[7].long_name;
        countryCode = data.results[0].address_components[6].short_name;
        updateTheatres();
    })
    .catch(function (error){
        console.log(error);
    })
}

function createLoader(){
    var d = document.createElement('div');
    d.setAttribute("class", "spinner");
    d.setAttribute("id", "sp");
    document.getElementById('load').appendChild(d);
}