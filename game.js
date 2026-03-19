var id;
var markers = [];    
var coins = [];    
var smlMarkers = [];    
var smlCoins = [];    
var panorama;
var myTimer;
var map;
var firstCenter;
var origPos;
var level = 1;
var currentId = 0;
var uniqueId = function() {
    return ++currentId;
}
var apiKey = 'AIzaSyA5BnwOyRRQPu5ZkXibCqqFIibHlzBOunM';
var lat = 43.6532;
var lng = -79.3832;

function browserGeolocationSuccess(position) {
	//get the nearest intersection
	jQuery.post( "https://maps.googleapis.com/maps/api/geocode/json?latlng="+position.coords.latitude+","+position.coords.longitude+"&key="+apiKey, function(success) {
		console.log(success);
		initMap({coords: {latitude: success.results[1].geometry.location.lat, longitude: success.results[1].geometry.location.lng}});
  		
	})
  	.fail(function(err) {
		initMap({coords: {latitude: lat, longitude: lng}});
    		// alert("API Geolocation error! \n\n"+err);
  	});
}

function browserGeolocationFail() {	
	//use google to geolocate user
	jQuery.post( "https://www.googleapis.com/geolocation/v1/geolocate?key="+apiKey, function(success) {
		initMap({coords: {latitude: success.location.lat, longitude: success.location.lng}});
  	})
  	.fail(function(err) {
		initMap({coords: {latitude: lat, longitude: lng}});
    		// alert("API Geolocation error! \n\n"+err);
  	});

}


function getLocation() {
var options = {
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
	var localScore = localStorage.getItem('score');
	
	if (localScore) {
        	$('#score').html(localScore);
        	$('#score').data('score', localScore);
	} else {
        	$('#score').html('0');
        	$('#score').data('score', '0');
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

  
	var oneMinute = 60 * 1;
	var display = $('#time');
	startTimer(oneMinute, display);

	origPos = position;		
                       
	for (var i=1;i<8;i++) { 
		var rand = Math.floor(Math.random() * 10) + 1;
		addWormhole(origPos,rand * 100);
	}
	for (var i=1;i<9;i++) { 
  		addBunch(origPos);
	}

	map.setStreetView(panorama);


        panorama.addListener('position_changed', function() {
        	map.setCenter(panorama.getPosition());
	});

var styles = [
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

    var diff = Math.abs(panorama.pov.heading % 360 - link.heading);
    if(diff>180)
       diff=Math.abs(360-diff);

    return diff;
}
function moveForward(pano) {
  var curr;
  var links = pano.links;
  for(i=0; i < links.length; i++) {
    var diff = difference(links[i]);
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
	
	var hard = d || 200;
       	var r = hard/111300
       	var y0 = position.coords.latitude
       	var x0 = position.coords.longitude
       	var u = Math.random()
      	var v = Math.random()
       	var w = r * Math.sqrt(u)
       	var t = 2 * Math.PI * v
       	var x = w * Math.cos(t)
       	var y1 = w * Math.sin(t)
       	var x1 = x / Math.cos(y0)

       	var newY = y0 + y1
       	var newX = x0 + x1
       	var markerPos = {lat: newY, lng: newX};
        var markerPos2 = {coords :{ latitude: newY, longitude: newX}};
        
	var image = {
        url: 'icons/rocket.gif',
        };

        var workMarker = new google.maps.Marker({
            position: markerPos,
            map: panorama,
            icon: image,
        });
        var workMarkersml= new google.maps.Marker({
            position: markerPos,
            map: map,
	    icon: 'icons/crystalgreen.png',
        });
	
	//marker.setPosition(markerPos);
        google.maps.event.addListener(workMarker, 'click', function() {
		
		clearMarkers();    
  		markers = []; 	
  		smlMarkers = []; 	
		
                if ( $('#score').hasClass('outta') ) {

                        map.setCenter(firstCenter);
                        panorama.setPosition(firstCenter);
                        $('#score').removeClass('outta');
			$("#time").removeClass('pauseInterval');
			
			$("#title-alert").html('');
			$("#title-alert").hide();
                        
			for (var i=1;i<3;i++) { 
				var rand = Math.floor(Math.random() * (level * 10) ) + 1;
				addWormhole(origPos,rand * 100);
			}
                
		} else {
	
			upScore();
			
			$('#pano').css('pointer-events', 'none');
			
			jQuery.getJSON('collections_en.json', function(data) {
				// data['1'] is the array of location collections;
				// each entry's title is at ['1'], and lat/lng coords are at ['5']['2']['3']['1']/['2']
				var locations = data['1'];
				var rand = locations[Math.floor(Math.random() * locations.length)];
				var json = [{
					lat: rand['5']['2']['3']['1'],
					lng: rand['5']['2']['3']['2'],
					title: rand['1']
				}];

				map.setCenter({lat: json[0].lat, lng: json[0].lng});
                        	panorama.setPosition({lat: json[0].lat, lng: json[0].lng});
                        	var newPos = {coords: {latitude: json[0].lat, longitude: json[0].lng}};
                        	
				$('#score').addClass('outta');
				$("#time").addClass('pauseInterval');

				$("#title-alert").html(json[0].title);
				$("#title-alert").show();
			
                        	addWormhole(newPos,1);
			

			}).fail(function() {
				$('#pano').css('pointer-events', 'inherit');
			});
			
			$('#pano').css('pointer-events', 'inherit');
                }
	
	});

	  markers.push(workMarker);    	
	  smlMarkers.push(workMarkersml);    	
}

// add diamonds
function addBunch(position) {
	
	var rand = Math.floor(Math.random() * (level * 10) ) + 1;
        var hard = rand * 100;
        var r = hard/111300
        var y0 = position.coords.latitude
        var x0 = position.coords.longitude
        var u = Math.random()
        var v = Math.random()
        var w = r * Math.sqrt(u)
        var t = 2 * Math.PI * v
        var x = w * Math.cos(t)
        var y1 = w * Math.sin(t)
        var x1 = x / Math.cos(y0)

        var newY = y0 + y1
        var newX = x0 + x1
        var markerPos = {lat: newY, lng: newX};
        var markerPos2 = {coords :{ latitude: newY, longitude: newX}};

        var image = {
	url: 'icons/diamond.gif',
        };
    
	var id = uniqueId(); // get new id

        var coinMarker = new google.maps.Marker({
	    position: markerPos,
            map: panorama,
            icon: image,
        });
        var coinMarkersml = new google.maps.Marker({
	    position: markerPos,
            map: map,
	    icon: 'icons/crystalblue.png',
        });

    	coins[id] = coinMarker;
    	smlCoins[id] = coinMarkersml;

        google.maps.event.addListener(coinMarker, 'click', function() {

             	var id = coins.indexOf(coinMarker);   
		clearCoin(id);
		
		upScore();
  		
		for (var i=1;i<4;i++) { 
			addBunch(markerPos2);
		}
	});


}

// the score updater
function upScore() {

	$("#plusOne").show().delay(500).fadeOut();
	var score = parseInt($('#score').data('score'));
        var newScore = score + 1;
        $('#score').html(newScore);
        $('#score').data('score', newScore);
        var highScore = parseInt($('#highscore').html());
                
        if ( newScore > highScore ) {
        	$('#highscore').html(newScore);
        }

      	if ( ( highScore + 1 ) % 10 == 0 ) {
                	
		$("#plusLive").show().delay(500).fadeOut();
                var lives = parseInt($('#lives').html());
		lives++;
			
		$('#lives').html(lives);
                        
		$('body').removeClass('level'+level);
                        
		level++;
			
		for (var i=1;i<9;i++) { 
			var rand = Math.floor(Math.random() * (level * 10) ) + 1;
			addWormhole(origPos,rand * 100);
		}
			
                $('body').addClass('level'+level);
    		//console.log(level);
    	}
                
       	var oldTime = parseInt($('#time').html());
        var oneMinute = 60 * 1;
        var display = $('#time');
 //       clearInterval(myTimer);
//       	startTimer(oneMinute, display);


	localStorage.setItem('score', newScore);

}

// the timer function
function startTimer(duration, display) {
/*
    	var timer = duration, minutes, seconds;
    	myTimer = setInterval(function () {

 	if(!$('#time').hasClass('pauseInterval')) { //only run if it hasn't got this class 'pauseInterval'

        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        $(display).html(minutes + ":" + seconds);

        if (--timer < 0) {
		var lives = parseInt($('#lives').html());
		if ( lives == 0 ) {
	    		clearInterval(myTimer);
			$('#gameover').show();
		} else {
            		timer = duration;
                	if ( $('#score').hasClass('outta') ) {
				map.setCenter(firstCenter);
              			panorama.setPosition(firstCenter);
                        	addWormhole(origPos, 500);
				$('#score').removeClass('outta');
			} else {
				var lives = parseInt($('#lives').html());
				var newLives = lives - 1;
				$('#lives').html(newLives);
			}
		}
        }
	} //end pause check
	
    }, 1000);
*/
}

// The delete marker functions
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
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
