function map(){

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", move);

    var mapDiv = $("#map");

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = mapDiv.width() - margin.right - margin.left,
        height = mapDiv.height() - margin.top - margin.bottom;

    // Initialize the color scale.
    var countryColorScale10 = d3.scale.category10();
    var countryColorScale20 = d3.scale.category20();

    // The stroke width for selected countries in the map.
    var strokeWidthActive = 3.0;
    var strokeWidthUnactive = 0.5;
    
    // Initialize tooltip.
    // Taken from: http://bl.ocks.org/biovisualize/1016860
    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute");

    var projection = d3.geo.mercator()
        .center([50, 60 ])
        .scale(250);

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    var path = d3.geo.path()
        .projection(projection);

    g = svg.append("g");

    // load data and draw the map
    d3.json("data/world-topo.topojson", function(error, world) {
        
        var countries = topojson.feature(world, world.objects.countries).features;
        
        //load summary data
        //...
        d3.csv("data/OECD-better-life-index-hi.csv", function(error, data) {
            draw(countries, data);    
        });

        
    });

    function draw(countries,data)
    {
        var country = g.selectAll(".country").data(countries);

        //initialize a color country object	
        var colorCountry = {};
		
        // Get the color scale for each country.
        data.forEach(function(d) {
            colorCountry[d["Country"]] = countryColorScale20(d["Country"])
        });

        country.enter().insert("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("id", function(d) { return d.id; })
            .attr("title", function(d) { return d.properties.name; })
            //country color
            // Fill country with the corresponding country color.
            .style("fill", function(d){ 
                return colorCountry[d.properties.name]; 
            })
            //...
            .attr("stroke-width", 0.5)
            .attr("stroke", "black")
            // Tooltip.
            .on("mouseover", function(d) {
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function(d) {
                return tooltip.style("top", (d3.event.pageY-10)+"px")
                       .style("left",(d3.event.pageX+10)+"px")
                       .text(d.properties.name)
                       .style("font-weight", "bold")
                       .style("font-size", "20px");
            })
            .on("mouseout", function(d) {
                return tooltip.style("visibility", "hidden");  
            })
            // Selection.
            .on("click",  function(d) {
                
                map1.selectCountry(d["Country"]);
                selFeature(d.properties.name);
            });

    }
    
    //zoom and panning method
    function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;
        

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

    }
    
    //method for selecting features of other components
    function selFeature(value){
        sp1.selectDot(value);
        pc1.selectLine(value);
    }

    // Highlight the selected countries.
    this.selectCountry = function(selectedCountries){

        // Handle the input variable depending on if
        // it is an array or a single string.
        if(selectedCountries instanceof Array){

            g.selectAll(".country")
            .style("stroke-width", 0.5);

            g.selectAll(".country")
            // Change the stroke width if the country is selected.
            .style("stroke-width", function(d) {

                var active = false;
                
                // d.properties.name is all of the countries in the map.
                selectedCountries.forEach(function(e){
                    if(e == d.properties.name) active = true;
                });


                if(active) 
                    return strokeWidthActive;
                else                                       
                    return strokeWidthUnactive;
            });

        }else{ // If a single country is selected.

            g.selectAll(".country")
            .style("stroke-width", function(d) {
                if(selectedCountries == d.properties.name) 
                    return strokeWidthActive;
                else                                       
                    return strokeWidthUnactive;

            });
        }
    };
}

