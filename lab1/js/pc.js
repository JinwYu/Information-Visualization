function pc(){

    var self = this; // for internal d3 functions

    var pcDiv = $("#pc");

    var margin = [30, 10, 10, 10],
        width = pcDiv.width() - margin[1] - margin[3],
        height = pcDiv.height() - margin[0] - margin[2];

    
    // Initialize color scale.
    var countryColorScale10 = d3.scale.category10();
    var countryColorScale20 = d3.scale.category20();

    // Background line opacity.
    var opacityActive = 1.0;
    var opacityUnactive = 0.1;

    // The brushed items.
    var brushedItems = [];
    
    // Initialize tooltip.
    // Taken from: http://bl.ocks.org/biovisualize/1016860
    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute");


    var x = d3.scale.ordinal().rangePoints([0, width], 1),
        y = {};
        

    var line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"),
        background,
        foreground;

    var svg = d3.select("#pc").append("svg:svg")
        .attr("width", width + margin[1] + margin[3])
        .attr("height", height + margin[0] + margin[2])
        .append("svg:g")
        .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

    // Load data.
    d3.csv("data/OECD-better-life-index-hi.csv", function(data) {

        self.data = data;

        // Extract the list of dimensions and create a scale for each.
        x.domain(dimensions = d3.keys(data[0,1,2,3,4]).filter(function(d) 
        {

            // Return the min and max value from the array with the data.
            // The "+" is to convert it into a numeric value.
            var minMax = d3.extent( data, function(c) {
                return +c[d];
            } )

            return d != "Country" && 
                ( y[d] = d3.scale.linear()  // This scale is used later in the code when scaling axes.
                  .domain(minMax)
                  .range([height, 0]) );
        }));

        // Draw the data.
        draw();
    });

    function draw(){
        // Add grey background lines for context.
        background = svg.append("svg:g")
            .attr("class", "background")
            .selectAll("path")
            // Add the data and append the path. 
            .data(self.data)
            .enter().append("path")
            .attr("d", path)
            // We don't want to display the name of the ones in the 
            // background so a tooltip is not implemented here.
            .on("mousemove", function(d){})
            .on("mouseout", function(){});

        // Add blue foreground lines for focus.
        foreground = svg.append("svg:g")
            .attr("class", "foreground")
            .selectAll("path")
            // Add the data and append the path.
            .data(self.data)
            .enter().append("path")
            .attr("d", path)
            // Colors the lines according to the values for each country.
            .style("stroke", function(d,i) { return countryColorScale20(i); }) 
            // Handles on-click events.
            .on("click", function(d){

                pc1.selectLine(d["Country"]);
                // Call the function to highlight the
                // corresponding dot in the scatter plot.
                selFeature(d["Country"]);

            })
            // Tooltip.
            .on("mouseover", function(d) {
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function(d) {
                return tooltip.style("top", (d3.event.pageY-10)+"px")
                       .style("left",(d3.event.pageX+10)+"px")
                       .text(d["Country"])
                       .style("font-weight", "bold")
                       .style("font-size", "20px");
            })
            .on("mouseout", function(d) {
                return tooltip.style("visibility", "hidden");  
            });

        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("svg:g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; });
            
        // Add an axis and title.
        g.append("svg:g")
            .attr("class", "axis")
            //add scale
            .each(function(d) { 
                // Scale the axis, see Lab0.
                // We select "this" svg element and then "call"
                // which calls the function which "scales the axis".
                // http://alignedleft.com/tutorials/d3/axes
                d3.select(this).call(axis.scale(y[d])); 
            })
            .append("svg:text")
            .attr("text-anchor", "middle")
            .attr("y", -9)
            .text(String);

        // Add and store a brush for each axis.
        g.append("svg:g")
            .attr("class", "brush")
            .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }


    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        // Since the brush will handle multiple items, we need an array to keep track of them.
        var brushedCountries = [];

            // Actives = axes.
        var actives = dimensions.filter(function(p) { 
                return !y[p].brush.empty(); 
            }),

            // Extents = values.
            extents = actives.map(function(p) { 
                return y[p].brush.extent(); 
            }); 


            foreground.style("display", function(d) {

                // Check which lines/countries are within the brushes, display these.
                if(actives.every(function(p, i) {return extents[i][0] <= d[p] && d[p] <= extents[i][1]})) {
                    
                    // Add the lines/countries to the array
                    brushedCountries.push(d["Country"]);

                    return null;
                } 
                else { 
                    return "none";
                }
            });

            // Send the brushed countries to all of the components.
            selFeature(brushedCountries);           
    }

    // Method for selecting the pololyne from other components.
    // Input: value = a string/array with all of the selected countries.
    this.selectLine = function(selectedCountries){

            d3.select(".foreground")
            .selectAll("path")
            .style("opacity", function(d){

                // Returns the opacity values for the lines for the corresponding country.
                if(selectedCountries == d["Country"]) 
                    return opacityActive;
                else                                  
                    return opacityUnactive;
            });
    };
    
    // Method for selecting features of other components.
    function selFeature(value){

        // Call the methods in the file "sp.js" and "map.js"
        // to select the corresponding item to the selected line. 
        sp1.selectDot(value);
        map1.selectCountry(value);                    
    };

}
