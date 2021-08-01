import {Graph} from './shortestpath.js';


var self = this;

 var mymap;
 var featureRouteGroup;
 var featureAirportGroup;
var featureHighlightGroup;

 var allRoutes = [];
 var airportMap = new Map();
var allRoutesGeodesics = [];

const graph = new Graph();

var circlePropZoomSmall = {
    color: 'orange',
    fillColor: 'orange',
    fillOpacity: 0.9
};
var circlePropZoomBig = {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
};
 var filterRoute = [];

function initRoutes(r) {
    allRoutes = r;
         
    allRoutes.forEach(forEveryRoute)
    allRoutesGeodesics.forEach(drawRoutes);
    initGraph();
    
    
}
function toUpper(v) {
    if (v != null && (typeof(v) === 'string' || v instanceof String)) {
        return v.trim().toUpperCase();
    } 
    return null;
}

function initGraph() {
    adjacentEdges.forEach((value,key, map) => {
        graph.addVertex(key, value);
    });
}

function getVAFlight(from, to, fn) {
    $.ajax({
        beforeSend: function(request) {
            request.setRequestHeader("X-API-Key", '/**/');
        },
        dataType: "json",
        url: 'https://va.skymatix.online/api/flights/search?dep_icao='+toUpper(from)+'&arr_icao='+toUpper(to),
        success: function(data) {
            let vaData = JSON.parse(data);
            fn(data);
        }
    });    
}

function getShortestRoute(from, to) {
 return graph.shortestPath(toUpper(from), toUpper(to)).concat([toUpper(from)]).reverse();
}


function hideHighlight() {
    featureHighlightGroup.clearLayers();
}

function highlightRoutes(routeNamesArray) {
    featureHighlightGroup.clearLayers();

    let places = [];
    console.log("Highlighting " + JSON.stringify(routeNamesArray));

    routeNamesArray.forEach((value,key,array) => {
        let airport = airportMap.get(value);        
        places.push(airport.getLatLng());
    });
    const lineOptions = {
        weight: 6,
        opacity: 1,
        stroke: true,
        color: 'black',
        wrap: false
    };
    
    const geodesicLine = new L.Geodesic(places, lineOptions);
    geodesicLine.addTo(featureHighlightGroup);
    $('#infomap').html(
        'Route info' + JSON.stringify(routeNamesArray) + '</br>'
    );
    
   /* for (let i = 0;i < routeNamesArray.length - 1;i++) {
        console.log("Fetching flight " + routeNamesArray[i] +"=>" + routeNamesArray[i+1]);
        getVAFlight(routeNamesArray[i], routeNamesArray[i+1], (vadata) => {
            console.log(vadata.data[0].id);
        })
    }*/
    
}


function clearFilter() {
    filterRoute = allRoutes;

 }

function addAirportFilterWithinFeature(feature) {
    let geometry =  feature.geometry;
    featureRouteGroup.clearLayers();
   
    filterRoute = allRoutesGeodesics.filter((el) => {
        let dptlatLng = airportMap.get(el.getProps().route.DptAirport).getLatLng();
        let depPoint = [dptlatLng.lng, dptlatLng.lat];
        let arrlatLng = airportMap.get(el.getProps().route.ArrAirport).getLatLng();
        let arrPoint = [arrlatLng.lng, arrlatLng.lat];

        return gju.pointInPolygon({
            type: 'Point',
            coordinates: depPoint
        }, geometry) || 
        gju.pointInPolygon({
            type: 'Point',
            coordinates: arrPoint
        }, geometry);
        }); 
    filterRoute.forEach(drawRoutes)
}

function addFilter(dep, arr) {
    filterRoute = [];

    if (dep.trim() === "" && arr.trim() === "") {
        filterRoute = allRoutesGeodesics;
    } else {
        filterRoute = allRoutes.filter( el => {
            return toUpper(el.DptAirport) === toUpper(dep) || dep.trim() === "";
        }).filter( el => {
            return toUpper(el.ArrAirport) === toUpper(arr) || arr.trim() === "";
        });
    }
    allRoutesGeodesics = [];    
    featureRouteGroup.clearLayers();
    filterRoute.forEach(forEveryRoute); 
    allRoutesGeodesics.forEach(drawRoutes);
    filterRoute.forEach(drawRoutes);
}

/* expects geodesic value */
function drawRoutes(routeGeodesic, index, array) {
    let dptAirport = routeGeodesic.getProps().route.DptAirport;
    let arrAirport = routeGeodesic.getProps().route.ArrAirport;
    if (mymap.getBounds().contains(airportMap.get(dptAirport).getLatLng()) || mymap.getBounds().contains(airportMap.get(arrAirport).getLatLng())) {
        routeGeodesic.addTo(featureRouteGroup);

    }

    

  //  if ()

}

function hideRoutes() {
    featureRouteGroup.removeFrom(mymap);
}


function showAirports() {
    featureAirportGroup.addTo(mymap);
}
 function showRoutes() {
    featureRouteGroup.addTo(mymap);
}
function randColor() {
    return Math.floor(Math.random()*16777215).toString(16);
}
var adjacentEdges = new Map();

function forEveryRoute(value, index, array) {
               

    // TODO string equals
 //   if (value.DptAirport.toUpperCase() == filterRoute.toUpperCase()) {
   //     console.log("ENBR found")
   // }
   let first = value.Fixes[0]

   let last = value.Fixes[value.Fixes.length - 1];
   let hasDeparture = airportMap.has(value.DptAirport);
   let hasArrival = airportMap.has(value.ArrAirport);

   while (!hasArrival || !hasDeparture) {

    let airportData = !hasDeparture ? first : last;
    let airportName = !hasDeparture ? value.DptAirport : value.ArrAirport;
    let airportMarker = L.circleMarker([airportData.Lat, airportData.Lon], circlePropZoomSmall);

    airportMarker.setRadius(3);
    airportMarker.getProps().name = airportName;
    airportMarker.getProps().color = randColor();
    airportMarker.addTo(featureAirportGroup);

    airportMap.set(airportName, airportMarker);

    hasDeparture = airportMap.has(value.DptAirport);
    hasArrival = airportMap.has(value.ArrAirport);

    airportMarker.on('mouseover',(e) => {
        let source = e.sourceTarget;
        let name = source.getProps().name;
        $('#inputDepartureFilter').val(name);
        airportMap.get(name).setRadius(calcCircleRadius() * 2);
    });

    airportMarker.on('mouseout',(e) => {
        let source = e.sourceTarget;
        let name = source.getProps().name;
        airportMap.get(name).setRadius(calcCircleRadius());
    });
   }
    

    let from = new L.LatLng(first.Lat, first.Lon); 
    let to = new L.LatLng(last.Lat, last.Lon); 

    let i;
    const places = []
    for (i = 0; i < value.Fixes.length; i++) {
        let v =  value.Fixes[i]
        let from = new L.LatLng(v.Lat, v.Lon); 
        places.push(from)

    }

    const lineOptions = {
        weight: 4,
        opacity: 0.3,
        stroke: true,
        color: '#' + airportMap.get(value.DptAirport).getProps().color,
        wrap: false
    };
    
    const geodesicLine = new L.Geodesic(places, lineOptions);

    //graph.addEdge(value.DptAirport, value.ArrAirport, geodesicLine.statistics.totalDistance);

    if (!adjacentEdges.has(value.DptAirport)) {
        adjacentEdges.set(value.DptAirport, {});
    }
           
    adjacentEdges.get(value.DptAirport)[value.ArrAirport] = geodesicLine.statistics.totalDistance;
    
   

    geodesicLine.getProps().route = {'DptAirport': value.DptAirport, 'ArrAirport': value.ArrAirport };
    geodesicLine.getProps().origColor = airportMap.get(value.DptAirport).getProps().color;
  
//    geodesicLine.addTo(featureRouteGroup);
    allRoutesGeodesics.push(geodesicLine);
    filterRoute = allRoutesGeodesics;
    geodesicLine.on('mouseout',(e) => {
        var source =   e.sourceTarget;
        source.setStyle({color : '#'+source.getProps().origColor, weight: 4});
        $('#infomap').html('Hover over a route to see info');
    });
    
    geodesicLine.on('mouseover',(e) => {
        var source =   e.sourceTarget;
        var ri = source.getProps().route;
        source.setStyle({color :'black', weight: 7}); 
        $('#infomap').html(
        'Departure:' + ri.DptAirport + '<br/>' + 
        'Arrival:' + ri.ArrAirport + '<br/>') 
    });
}


function calcCircleRadius() {
    if (mymap.getZoom() > 6) {
        return 10;
    } else if (mymap.getZoom() <= 5) {
        return 3; 
    } else {
        return 4;
    }
}
 function mapInit(domSelector) {
    
    mymap = L.map(domSelector, {
        zoomDelta: 0.25,
        zoomSnap: 0

    }).setView([51.505, -0.09], 5);
    mymap.invalidateSize();

    mymap.on('zoomend', function() {
        airportMap.forEach((value, key ) => {
            if (mymap.getBounds().contains(value.getLatLng())) {
                value.setRadius(calcCircleRadius())
            }
        });
        featureRouteGroup.clearLayers();

        filterRoute.forEach(drawRoutes);
    });

    mymap.on("moveend", function () {
        airportMap.forEach((value, key ) => {
            if (mymap.getBounds().contains(value.getLatLng())) {
                if (mymap.getZoom() > 6) {
                    value.setRadius(10)
                } else if (mymap.getZoom() <= 5) {
                    value.setRadius(3)
                } else {
                    value.setRadius(4)
                }

            }
        });
        featureRouteGroup.clearLayers();

        
        filterRoute.forEach(drawRoutes);
     });

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYmpvcm5ldmVuIiwiYSI6ImNrajY2emVnNzRjankycm40Z2U0cmkwMmYifQ.8SaqWp_StHtO4_Aqa7W5nA'
    }).addTo(mymap);

    L.Layer.include({
        getProps: function () {
            var feature = this.feature = this.feature || {}; // Initialize the feature, if missing.
            feature.type = 'Feature';
            feature.properties = feature.properties || {}; // Initialize the properties, if missing.
            return feature.properties;
        }
    });

       featureRouteGroup = L.featureGroup();
       featureRouteGroup.addTo(mymap);
       featureAirportGroup = L.featureGroup();
       featureAirportGroup.addTo(mymap);

       featureHighlightGroup = L.featureGroup();
       featureHighlightGroup.addTo(mymap);

        featureRouteGroup.setZIndex(0);
       featureAirportGroup.setZIndex(-1);
       featureHighlightGroup.setZIndex(-1);
}

function initCountries(value) {
    let myLayer = L.geoJSON(value, {
        onEachFeature: function(feature, layer) {
            if (feature.properties && feature.properties.name) {
                feature.properties.bounds_calculated = layer.getBounds();
               // console.log("Feature boubds " + layer.getBounds());
                layer.bindPopup(feature.properties.name, {closeButton: false, offset: L.point(0, -20)});
              //  layer.on('mouseover', function() { layer.openPopup(); });
               // layer.on('mouseout', function() { layer.closePopup(); });
                layer.on('click', function() { console.log("Click"); addAirportFilterWithinFeature(feature); });
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        }
    });
    mymap.addLayer(myLayer);
}

export {mapInit, showRoutes, hideRoutes, addFilter, clearFilter, initRoutes, highlightRoutes, hideHighlight, getShortestRoute,initCountries};
