var area1;
var map1;

// Reads the data file and sends it to area.js and map.js.
d3.csv("data/data.csv", function (data) {

    area1 = new area(data);
    map1 = new map(data);
        
});

