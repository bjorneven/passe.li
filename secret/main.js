
import {mapInit, initRoutes, addFilter, highlightRoutes, hideHighlight, getShortestRoute} from './modules/vamap.js';


mapInit('mapid');

$.getJSON('./route.json', function(r) {
    initRoutes(r);
});

$("#filterButton").click(function(e) {
    e.preventDefault();
    const depFilt = $("#inputDepartureFilter").val();
    const arrFilt = $("#inputArrivalFilter").val();

    addFilter(depFilt, arrFilt);

    return false;
});

$("#findRouteButton").click(function(e) {
    e.preventDefault();
    const depFilt = $("#inputDepartureFilter").val();
    const arrFilt = $("#inputArrivalFilter").val();

    highlightRoutes(getShortestRoute(depFilt, arrFilt));

    return false;
});
          

           
            