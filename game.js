const markers = [];
const coins = [];
const smlMarkers = [];
const smlCoins = [];
let panorama;
let myTimer;
let map;
let firstCenter;
let origPos;
let level = 1;
let currentId = 0;
const uniqueId = function() {
    return ++currentId;
};
const apiKey = 'GOOGLE_MAPS_API_KEY_PLACEHOLDER';
const lat = 43.6532;
const lng = -79.3832;

function browserGeolocationSuccess(position) {
	//get the nearest intersection
	fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&key=' + apiKey)
		.then(function(response) { return response.json(); })
		.then(function(success) {
			console.log(success);
			initMap({coords: {latitude: success.results[1].geometry.location.lat, longitude: success.results[1].geometry.location.lng}});
		})
		.catch(function() {
			initMap({coords: {latitude: lat, longitude: lng}});
		});
}

function browserGeolocationFail() {
	//use google to geolocate user
	fetch('https://www.googleapis.com/geolocation/v1/geolocate?key=' + apiKey, {method: 'POST'})
		.then(function(response) { return response.json(); })
		.then(function(success) {
			initMap({coords: {latitude: success.location.lat, longitude: success.location.lng}});
		})
		.catch(function() {
			initMap({coords: {latitude: lat, longitude: lng}});
		});
}


function getLocation() {
	const options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			browserGeolocationSuccess,
			browserGeolocationFail,
			options
		);
	}
}

// build maps
function initMap(position) {
	const scoreEl = document.getElementById('score');
	const localScore = localStorage.getItem('score');

	if (localScore) {
		scoreEl.textContent = localScore;
		scoreEl.dataset.score = localScore;
	} else {
		scoreEl.textContent = '0';
		scoreEl.dataset.score = '0';
	}

	firstCenter = {lat: position.coords.latitude, lng: position.coords.longitude};

	map = new google.maps.Map(document.getElementById('map'), {
		center: firstCenter,
		zoom: 16,
		streetViewControl: false,
		disableDefaultUI: true,
		draggable: false,
		scrollwheel: false,
	});

	panorama = new google.maps.StreetViewPanorama(
		document.getElementById('pano'), {
			position: firstCenter,
			pov: {
				heading: 34,
				pitch: 10
			},
			addressControl: false,
			fullscreenControl: false,
			zoomControl: false,
			panControl: false,
	});

	const oneMinute = 60 * 1;
	const display = document.getElementById('time');
	startTimer(oneMinute, display);

	origPos = position;

	for (let i = 1; i < 8; i++) {
		const rand = Math.floor(Math.random() * 10) + 1;
		addWormhole(origPos, rand * 100);
	}
	for (let i = 1; i < 9; i++) {
		addBunch(origPos);
	}

	map.setStreetView(panorama);

	panorama.addListener('position_changed', function() {
		map.setCenter(panorama.getPosition());
	});

	const styles = [
		{
			stylers: [
				{ hue: "#eee" },
				{ saturation: -100 }
			]
		},{
			featureType: "all",
			elementType: "labels",
			stylers: [
				{ visibility: "off" }
			]
		}
	];

	map.setOptions({styles: styles});
}
// end of init

// THESE TWO FUNCTIONS WILL MOVE THE MAP AUTOMATICALLY FIGURE OUT HOW TO USE WITH PHONE TILT
function difference(link) {

    let diff = Math.abs(panorama.pov.heading % 360 - link.heading);
    if(diff>180)
       diff=Math.abs(360-diff);

    return diff;
}
function moveForward(pano) {
  let curr;
  const links = pano.links;
  for(let i=0; i < links.length; i++) {
    if(curr == undefined) {
      curr = links[i];
    }

    if(difference(curr) > difference(links[i])) {
      curr = links[i];
    }
  }
  pano.setPano(curr.pano);
}



// add rockets
function addWormhole(position,d) {

	const hard = d || 200;
	const r = hard/111300;
	const y0 = position.coords.latitude;
	const x0 = position.coords.longitude;
	const u = Math.random();
	const v = Math.random();
	const w = r * Math.sqrt(u);
	const t = 2 * Math.PI * v;
	const x = w * Math.cos(t);
	const y1 = w * Math.sin(t);
	const x1 = x / Math.cos(y0);

	const newY = y0 + y1;
	const newX = x0 + x1;
	const markerPos = {lat: newY, lng: newX};

	const image = {
		url: 'icons/rocket.gif',
	};

	const workMarker = new google.maps.Marker({
		position: markerPos,
		map: panorama,
		icon: image,
	});
	const workMarkersml = new google.maps.Marker({
		position: markerPos,
		map: map,
		icon: 'icons/crystalgreen.png',
	});

	//marker.setPosition(markerPos);
	google.maps.event.addListener(workMarker, 'click', function() {

		clearMarkers();
		markers.length = 0;
		smlMarkers.length = 0;

		const scoreEl = document.getElementById('score');

		if ( scoreEl.classList.contains('outta') ) {

			map.setCenter(firstCenter);
			panorama.setPosition(firstCenter);
			scoreEl.classList.remove('outta');
			document.getElementById('time').classList.remove('pauseInterval');

			const titleAlert = document.getElementById('title-alert');
			titleAlert.textContent = '';
			titleAlert.style.display = 'none';

			for (let i = 1; i < 3; i++) {
				const rand = Math.floor(Math.random() * (level * 10) ) + 1;
				addWormhole(origPos,rand * 100);
			}

		} else {

			upScore();

			const panoEl = document.getElementById('pano');
			panoEl.style.pointerEvents = 'none';

			fetch('collections_en.json')
				.then(function(response) { return response.json(); })
				.then(function(data) {
					// data['1'] is the array of location collections;
					// each entry's title is at ['1'], and lat/lng coords are at ['5']['2']['3']['1']/['2']
					const locations = data['1'];
					const rand = locations[Math.floor(Math.random() * locations.length)];
					const json = [{
						lat: rand['5']['2']['3']['1'],
						lng: rand['5']['2']['3']['2'],
						title: rand['1']
					}];

					map.setCenter({lat: json[0].lat, lng: json[0].lng});
					panorama.setPosition({lat: json[0].lat, lng: json[0].lng});
					const newPos = {coords: {latitude: json[0].lat, longitude: json[0].lng}};

					scoreEl.classList.add('outta');
					document.getElementById('time').classList.add('pauseInterval');

					const titleAlert = document.getElementById('title-alert');
					titleAlert.textContent = json[0].title;
					titleAlert.style.display = 'block';

					addWormhole(newPos,1);

				})
				.catch(function() {
					panoEl.style.pointerEvents = 'inherit';
				});

			panoEl.style.pointerEvents = 'inherit';
		}

	});

	markers.push(workMarker);
	smlMarkers.push(workMarkersml);
}

// add diamonds
function addBunch(position) {

	const rand = Math.floor(Math.random() * (level * 10) ) + 1;
	const hard = rand * 100;
	const r = hard/111300;
	const y0 = position.coords.latitude;
	const x0 = position.coords.longitude;
	const u = Math.random();
	const v = Math.random();
	const w = r * Math.sqrt(u);
	const t = 2 * Math.PI * v;
	const x = w * Math.cos(t);
	const y1 = w * Math.sin(t);
	const x1 = x / Math.cos(y0);

	const newY = y0 + y1;
	const newX = x0 + x1;
	const markerPos = {lat: newY, lng: newX};
	const markerPos2 = {coords :{ latitude: newY, longitude: newX}};

	const image = {
		url: 'icons/diamond.gif',
	};

	const id = uniqueId(); // get new id

	const coinMarker = new google.maps.Marker({
		position: markerPos,
		map: panorama,
		icon: image,
	});
	const coinMarkersml = new google.maps.Marker({
		position: markerPos,
		map: map,
		icon: 'icons/crystalblue.png',
	});

	coins[id] = coinMarker;
	smlCoins[id] = coinMarkersml;

	google.maps.event.addListener(coinMarker, 'click', function() {

		const id = coins.indexOf(coinMarker);
		clearCoin(id);

		upScore();

		for (let i = 1; i < 4; i++) {
			addBunch(markerPos2);
		}
	});

}

// the score updater
function upScore() {

	const plusOneEl = document.getElementById('plusOne');
	plusOneEl.style.display = 'inline';
	setTimeout(function() { plusOneEl.style.display = 'none'; }, 500);

	const scoreEl = document.getElementById('score');
	const score = parseInt(scoreEl.dataset.score);
	const newScore = score + 1;
	scoreEl.textContent = newScore;
	scoreEl.dataset.score = newScore;

	const highscoreEl = document.getElementById('highscore');
	const highScore = parseInt(highscoreEl.textContent);

	if ( newScore > highScore ) {
		highscoreEl.textContent = newScore;
	}

	if ( newScore % 10 === 0 ) {

		const plusLiveEl = document.getElementById('plusLive');
		plusLiveEl.style.display = 'inline';
		setTimeout(function() { plusLiveEl.style.display = 'none'; }, 500);

		const livesEl = document.getElementById('lives');
		const lives = parseInt(livesEl.textContent) + 1;
		livesEl.textContent = lives;

		document.body.classList.remove('level' + level);

		level++;

		for (let i = 1; i < 9; i++) {
			const rand = Math.floor(Math.random() * (level * 10) ) + 1;
			addWormhole(origPos, rand * 100);
		}

		document.body.classList.add('level' + level);
		//console.log(level);
	}

	localStorage.setItem('score', newScore);

}

// the timer function
function startTimer(duration, display) {
/*
    	let timer = duration, minutes, seconds;
    	myTimer = setInterval(function () {

 	if(!document.getElementById('time').classList.contains('pauseInterval')) { //only run if it hasn't got this class 'pauseInterval'

        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
		const lives = parseInt(document.getElementById('lives').textContent);
		if ( lives == 0 ) {
	    		clearInterval(myTimer);
			document.getElementById('gameover').style.display = 'block';
		} else {
            		timer = duration;
                	if ( document.getElementById('score').classList.contains('outta') ) {
				map.setCenter(firstCenter);
              			panorama.setPosition(firstCenter);
                        	addWormhole(origPos, 500);
				document.getElementById('score').classList.remove('outta');
			} else {
				const livesEl = document.getElementById('lives');
				livesEl.textContent = lives - 1;
			}
		}
        }
	} //end pause check
	
    }, 1000);
*/
}

// The delete marker functions
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    smlMarkers[i].setMap(map);
  }
}

function clearMarkers() {
  setMapOnAll(null);
}

function clearCoin(id) {
    coins[id].setMap(null);
    smlCoins[id].setMap(null);
}

function tilt(x) {
	// need to create a threshold for the move forward event so it doesn't happen so fast
	if ( x > 0 )
	moveForward(panorama);
}

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (eventData) {
        tilt(eventData.beta);
    }, true);
} else if (window.DeviceMotionEvent) {
    window.addEventListener('deviceorientation', function (eventData) {
        tilt(eventData.beta);
    }, true);
}
