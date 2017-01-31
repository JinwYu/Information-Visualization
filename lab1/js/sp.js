function sp(){

    var self = this; // for internal d3 functions

    var spDiv = $("#sp");

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = spDiv.width() - margin.right - margin.left,
        height = spDiv.height() - margin.top - margin.bottom;

    // The name of the data to display.
    var xData = "Life satisfaction";
    var yData = "Personal earnings";

    // The radius for the dots in the scatter plot
    var dotRadius = 7; 

    // Dot colors when selected.
    var opacityActive = 1.0;
    var opacityUnactive = 0.2;

    // Initialize color scale.
    var countryColorScale10 = d3.scale.category10();
    var countryColorScale20 = d3.scale.category20();
    
    // Initialize tooltip.
    // Taken from: http://bl.ocks.org/biovisualize/1016860
    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute");

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#sp").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Load data
    d3.csv("data/OECD-better-life-index-hi.csv", function(error, data) {
        self.data = data;

        // Define the domain of the scatter plot axes
        // Choosing values from zero to the maximum of the data
        // for each axis. By retrieving the maximum value from 
        // the data by looping through it and finding the max value,
        // then use that value as the max on the axis (the domain).
        x.domain([0, d3.max(data, function(d) { 
        	return d["Life satisfaction"]; })]
        );

        y.domain([0, d3.max(data, function(d) { 
        	return d["Personal earnings"]; })]
        );

        draw();

    });

    function draw()
    {
        
        // Add x axis and title.
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .text(xData)					// The label.
            .attr("text-anchor", "end");	// The text stops at the end of the axis.

            
        // Add y axis and title.
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .text(yData)
            .attr("text-anchor", "end");
            
        // Add the scatter dots.
        svg.selectAll(".dot")
            .data(self.data)
            .enter().append("circle")
            .attr("class", "dot")
            // Define the x and y coordinate data values for the dots
            .attr("cx", function(d) {
		        return x(d["Life satisfaction"]);
		    })
		    .attr("cy", function(d) {
		        return y(d["Personal earnings"]);
		    })
		    .attr("r", dotRadius)
            .style("stroke", "none")
            // Color the dots, colormapping.
            .style("fill", function(d,i) { return countryColorScale20(i); })
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
            })
            .on("click",  function(d) {

                // Highlight the selected dot.
                // The variable "sp1" is created in the file "main.js".
                sp1.selectDot(d["Country"]); 

                // Calls the function to highlight a line in the parallel coordinates figure.   
                selFeature(d["Country"]);      

            });
    }
    var counter = 0;

    // Method for selecting the dot from other components
    // Input: value = a string/array with all of the selected countries.
    this.selectDot = function(selectedCountries){

        // Handles the input variable depending on if
        // it is an array or if it is a single string.
        if(selectedCountries instanceof Array){

            svg.selectAll(".dot")
            //.transition() // Lags too much.
            .style("opacity", function(d){

                var active = false;

                // Check if the selected countries exist in the
                // array of countries d["Country"], if not it returns "-1".
                selectedCountries.forEach(function(e){
                    if(d["Country"].indexOf(e) != -1) active = true;            
                });

                // Returns the opacity values for the dots
                // when the input value matches the corresponding country.
                if(active)  return opacityActive;
                else        return opacityUnactive;
                    
            })
            // Change the stroke's width and color for active items.
            .style("stroke", "black")
            .style("stroke-width", function(d){

                var active = false;

                // Same as above.
                selectedCountries.forEach(function(e){
                    if(d["Country"].indexOf(e) != -1) active = true;                    
                });

                if(active)  
                    return 2.0;
                else        
                    return "none";
            });

        }else{ // If it is a single string.

            svg.selectAll(".dot")
            .style("opacity", function(d){

                // Returns the opacity values for the dots
                // when the input value matches the corresponding country.
                if(selectedCountries == d["Country"])  
                    return opacityActive;
                else                                   
                    return opacityUnactive;
                    
            })
            .style("stroke", "black")
            .style("stroke-width", function(d){

                if(selectedCountries == d["Country"])  
                    return 2.0;
                else                                   
                    return "none";
            });
        }
        
    };
    
    // Method for selecting features of other components.
    function selFeature(value){
        // Call the method in the file "pc.js" and "map.js"
        // to select the corresponding item to the selected dot. 
        pc1.selectLine(value);
        map1.selectCountry(value);
    }


}




