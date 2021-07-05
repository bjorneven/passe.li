
import {mapInit, initRoutes, addFilter} from './modules/vamap.js';

mapInit('mapid');

$.getJSON('./route.json', function(r) {
    initRoutes(r);
});

$("#icaoFilterForm").submit(function() {
    const depFilt = $("#inputDepartureFilter").val();
    const arrFilt = $("#inputArrivalFilter").val();

    addFilter(depFilt, arrFilt);

    return false;
});

          

           
            