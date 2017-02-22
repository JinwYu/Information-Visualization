function map(data) {

    var zoom = d3.behavior.zoom()
            .scaleExtent([0.5, 8])
            .on("zoom", move);

    var mapDiv = $("#map");

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = mapDiv.width() - margin.right - margin.left,
            height = mapDiv.height() - margin.top - margin.bottom;

    var curr_mag = 4;

    var format = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ");

    var timeExt = d3.extent(data.map(function (d) {
        return format.parse(d.time);
    }));

    var filterdData = data;

    //Sets the colormap
    var colors = colorbrewer.Set3[10];

    //Assings the svg canvas to the map div
    var svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoom);

    var g = svg.append("g");

    //Sets the map projection
    var projection = d3.geo.mercator()
            .center([8.25, 56.8])
            .scale(700);

    //Creates a new geographic path generator and assing the projection        
    var path = d3.geo.path().projection(projection);

    //Formats the data in a feature collection trough geoFormat()
    var geoData = {type: "FeatureCollection", features: geoFormat(data)};

    //Loads geo data
    d3.json("data/world-topo.json", function (error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;
        draw(countries);
    });

    //Calls the filtering function 
    d3.select("#slider").on("input", function () {
        filterMag(this.value, data);
    });

    // Formats the data in a feature collection
    // Called when initializing the variable "geoData".
    // Using GeoJSON format, a feature collection's 
    // form can be seen here: http://geojson.org/geojson-spec.html
    function geoFormat(array) {
        var data = [];
        array.map(function (d, i) {
            data.push({
                type: "Feature",
                geometry: {
                    type: 'Point',
                    coordinates: [d.lon, d.lat]
                },
                "properties" : {
                "id" : d.id,
                "time" : d.time,
                "magnitude" : d.mag,
                "place" : d.place,
                "depth" : d.depth
                }
            });
        });
        return data;
    }

    //Draws the map and the points
    function draw(countries)
    {
        //draw map
        var country = g.selectAll(".country").data(countries);
        country.enter().insert("path")
                .attr("class", "country")
                .attr("d", path)
                .style('stroke-width', 1)
                .style("fill", "lightgray")
                .style("stroke", "white");

        //draw point        
        var point = g.selectAll("circle")
                    .data(geoData.features)
                    .enter().append("circle")
                    // Using the class "dot" in the file "area.css".
                    .attr("class", "dot")
                    .attr("r", 3)
                    .attr("cx", function(d) {
                        // Getting the "d.lon" and "d.lat" coordinates
                        // from the GeoJSON formatted file.
                        return projection(d.geometry.coordinates)[0];
                    })
                    .attr("cy", function(d) {
                        return projection(d.geometry.coordinates)[1];
                    })                    
    };

    //Filters data points according to the specified magnitude
    function filterMag(value) {

            
    }
    
    //Filters data points according to the specified time window
    this.filterTime = function (value) {

        // Get the start and end time.
        var startTime = value[0].getTime();
        var endTime = value[1].getTime();

        d3.selectAll(".dot")
            // Change opacity to display the filtering.
            .style("opacity", function(d) {

            // Create a Date object with the date.
            var time = new Date(d.properties.time);

            // If the date is within the time period.
            if( (time.getTime() >= startTime) && (time.getTime() <= endTime) ){
                return 1.0;
            }else{
                return 0.0;
            }

        });

        
    };

    //Calls k-means function and changes the color of the points  
    this.cluster = function () {

        // Get the nr of desired clusters, the k-value.
        var k = document.getElementById("k").value;

        var coordinatesArray = [];

        // The coordinates for the dots needs to be saved
        // to an array so it's in the correct format for the
        // kmeans function.
        g.selectAll(".dot").each(function(d) {
            coordinatesArray.push(d.geometry.coordinates);    
        });

        // Call the kmeans algorithm.
        var clusterIndexes = kmeans(coordinatesArray, k);

        // Color all the circles/dot elements according
        // to which cluster they belong to.
        g.selectAll(".dot").each(function(d, i) {

            var theClusterIndex = clusterIndexes[i];
            var point = d3.select(this)
                        .style("fill", function (e) {
                            return colors[theClusterIndex];
                        });
        });   
    };

    //Zoom and panning method
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
    }

    //Prints features attributes
    function printInfo(value) {
        var elem = document.getElementById('info');
        elem.innerHTML = "Place: " + value["place"] + " / Depth: " + value["depth"] + " / Magnitude: " + value["mag"] + "&nbsp;";
    }

}
