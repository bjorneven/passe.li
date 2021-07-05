
 var self = this;

 var mymap;
 var featureRouteGroup;
 var allRoutes = [];
 
 var filterRoutes = [];

function initRoutes(r) {
    allRoutes = r;
         
    allRoutes.forEach(forEveryRoute)

}
function clearFilter() {
    filterRoute = allRoutes;

 }

function addFilter(dep, arr) {
    let filterRoute = [];

    if (dep.trim() === "" && arr.trim() === "") {
        filterRoute = allRoutes;
    } else {
        filterRoute = allRoutes.filter( el => {
            return el.DptAirport.trim().toUpperCase() == dep.trim().toUpperCase() || dep.trim() === "";
        }).filter( el => {
            return el.ArrAirport.trim().toUpperCase() == arr.trim().toUpperCase() || arr.trim() === "";
        });
    }
    
    featureRouteGroup.clearLayers();
    filterRoute.forEach(forEveryRoute); 
}

  function hideRoutes() {
    featureRouteGroup.removeFrom(mymap);
}

 function showRoutes() {
    featureRouteGroup.addTo(mymap);
}
function forEveryRoute(value, index, array) {
               
    let first = value.Fixes[0]

    // TODO string equals
 //   if (value.DptAirport.toUpperCase() == filterRoute.toUpperCase()) {
   //     console.log("ENBR found")
   // }
    
    let last = value.Fixes[value.Fixes.length - 1]
    
    L.circle([first.Lat, first.Lon], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(mymap);
    L.circle([last.Lat, last.Lon], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(mymap);

    let from = new L.LatLng(first.Lat, first.Lon); 
    let to = new L.LatLng(last.Lat, last.Lon); 
    let i;
    const places = []
    for (i = 0; i < value.Fixes.length; i++) {
        let v =  value.Fixes[i]
        let from = new L.LatLng(v.Lat, v.Lon); 
        places.push(from)

    }

    const geodesicLine = new L.Geodesic(places, lineOptions)
    geodesicLine.getProps().route = value

    geodesicLine.addTo(featureRouteGroup);
    
    geodesicLine.on('mouseout',(e) => {
        $('#infomap').html('Hover over a route to see info');
    });
    
    geodesicLine.on('mouseover',(e) => {
        var source =   e.sourceTarget;
        var ri = source.getProps().route;

        $('#infomap').html(
        'Departure:' + ri.DptAirport + '<br/>' + 
        'Arrival:' + ri.ArrAirport + '<br/>') 
    });
}

const lineOptions = {
    weight: 4,
    opacity: 0.5,
    color: 'grey',
};

 function mapInit(domSelector) {
    
    mymap = L.map(domSelector).setView([51.505, -0.09], 5);
    mymap.invalidateSize();

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

       featureRouteGroup = L.layerGroup().addTo(mymap);
}

export {mapInit, showRoutes, hideRoutes, addFilter, clearFilter, initRoutes};