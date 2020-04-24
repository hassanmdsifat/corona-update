
var map;
var markers = [];
var infoWindow = '';
var locationSelect;

$(document).ready(function(){
  getAllCountries();
  $(document).on('click', '.store-container', function(){
      setMarkerData($(this).data('slug'));
  });
});

function initMap() {
    var losAngeles = {
        lat: 34.063380, 
        lng: -118.358080
    };
    map = new google.maps.Map(document.getElementById('map'), {
        center: losAngeles,
        zoom: 11,
        mapTypeId: 'roadmap',
    });
    infoWindow = new google.maps.InfoWindow();
}

function displayStores(countries){
    allcountries = countries['Countries']
    var storesHtml = '';
    var count = 1;
    for(var country of allcountries){
        storesHtml +=  `<div class="store-container" data-slug=${country['Slug']}>
                          <div class="store-container-background">
                              <div class="store-info-container">
                                  <div class="store-address">
                                      <span>${country['Country']}</span>
                                  </div>
                              </div>
                              <div class="store-number-container">
                                  <div class="store-number">
                                      ${country['TotalConfirmed']}
                                  </div>
                              </div>
                          </div>
                      </div>`;
        count++;
        document.querySelector('.stores-list').innerHTML = storesHtml;
      }
}

function showStoresMarkers(countryData){
    if(countryData.length === 0){
      alert("No Data Found");
    }else{

          var currentData = countryData[countryData.length-1];
          var lat = currentData['Lat'];
          var long = currentData['Lon'];
          var confirmed = currentData['Confirmed'];
          var death = currentData["Deaths"];
          var recovered = currentData["Recovered"];
          var active = currentData["Active"];
          var bounds = new google.maps.LatLngBounds();
          var latLong = new google.maps.LatLng(lat, long);
          var totalSummary = getSummaryByCountry(currentData['Country']);
          createMarker(confirmed, death, recovered, active, totalSummary, latLong);
          bounds.extend(latLong);
          map.fitBounds(bounds);
          map.setZoom(0);
          map.setZoom(5);
    }
}

function createMarker(confirmed, death, recovered, active,totalSummary, latlng){
    var icon = "./images/map_marker.png";

    var html = `<div class="store-info-window">
                    <div>
                      <div class="store-info-name">
                        New Confirmed: ${totalSummary['NewConfirmed']}
                      </div>
                      <div class="store-info-status">
                        New Recovered: ${totalSummary['NewRecovered']}<br>
                        New Death: ${totalSummary['NewDeaths']}
                      </div>
                      <div class="store-info-name">
                        Total Confirmed: ${totalSummary['TotalConfirmed']}
                      </div>
                      <div class="store-info-status">
                        Total Recovered: ${totalSummary['TotalRecovered']}<br>
                        Total Death: ${totalSummary['TotalDeaths']}
                      </div>
                    </div>
                <div>`;

    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
    });

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    clearLocations();
    google.maps.event.trigger(marker, 'click');
    markers.push(marker);
}

function searchStores(){
  var currentCountry = document.getElementById('zip-code-input').value.trim();
  if(currentCountry){
    getCountrySlug(currentCountry);
  }
}

function clearLocations() {
  infoWindow.close();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers.length = 0;
}

function getAllCountries(){
  ajaxCall("https://api.covid19api.com/summary", displayStores);
}

function setMarkerData(country){
  var url =`https://api.covid19api.com/live/country/${country}/status/Total`;
  ajaxCall(url, showStoresMarkers);
}

function getCountrySlug(country){
  var curCountry = country.toLowerCase();
  var countrySlug = null;
  for(i of allcountries){
    if(curCountry == i['Country'].toLowerCase()){
      countrySlug = i["Slug"];
      break;
    }
  }
  if(countrySlug){
    setMarkerData(countrySlug);
  }else{
    alert("No Country Found! Try Again");
  }
}

function getSummaryByCountry(country){
  var totalSummary = {

  };
  for(i of allcountries){
    if(i['Country'] == country){
      totalSummary['NewConfirmed'] = i['NewConfirmed'];
      totalSummary['NewDeaths'] = i['NewDeaths'];
      totalSummary['NewRecovered'] = i['NewRecovered'];
      totalSummary['TotalDeaths'] = i['TotalDeaths'];
      totalSummary['TotalConfirmed'] = i['TotalConfirmed'];
      totalSummary['TotalRecovered'] = i['TotalRecovered'];
      return totalSummary;
    }
  }
  return totalSummary;
}

function ajaxCall(url, callBack=undefined){
  $.ajax({
      url: url,
      type: 'GET',
      data: {},
      cache: false,
      async: true,
      timeout: 15000,
      beforeSend: function(){

      },
      success: function(data) {
        callBack(data);
      },
      complete: function(){
      }
  });
}
