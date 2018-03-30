function createLookup(popData) {
    popLookup = d3.map();
    popData.forEach(function(d) { popLookup.set(d.County, d.Population); });
    return popLookup;
}

function processMap(mapData, popLookup) {
    divId = "#map";
    var w = 400,
	h = 400;

    var svg = d3.select(divId).append("svg")
	.attr("width", w)
	.attr("height", h);
    
    var projection = d3.geo.transverseMercator()
	.rotate([90, -45])
	.scale(4000)
	.translate([200,200])
    
    var path = d3.geo.path()
	.projection(projection)

    popExtent = d3.extent(popLookup.values());
    
    console.log(popExtent);
    
    var color = d3.scale.log()
     	.domain(popExtent)
	.range(["white", "black"]);
    
    svg.selectAll(".county")
	.data(mapData.features)
	.enter().append("path")
	.attr("d", path)
	.attr("class", "county")
    // use .attr instead of .style so that CSS rules will override
	.attr("stroke", "black")
	.attr("fill", function(d) {
	    return color(popLookup.get(d.properties.county_nam));
	});
}

function processBar(popData) {
    var w = 1000,
	h = 300,
	barWidth = 12,
	labelHeight = 200;
    
    var svg = d3.select("#bar").append("svg")
	.attr("width", w)
	.attr("height", h);
    
    var y = d3.scale.linear()
	.domain([0, d3.max(popData, function(d) { return d.Population; })])
	.range([0, labelHeight]);
    
    var bar = svg.selectAll("g.bar")
	.data(popData)
	.enter().append("g")
	.attr("transform", function(d,i) {
	    return "translate(" + (i*(barWidth+1)) + "," + labelHeight + ")";
	})
	.classed("bar", true)

    bar.append("rect")
	.attr("width", barWidth)
	.attr("height", function(d) { return y(d.Population); })
	.attr("y", function(d) { return -y(d.Population); })
	.attr("fill", "gray")

    bar.append("text")
    	.attr("dy", "0.35em")
	.attr("transform", "translate(" + barWidth/2 + ",0) rotate(-90)")
	.style("text-anchor", "end")
	.style("text-align", "center")
	.text(function(d) { return d.County; });
    
}


function processData(addToVisualizationCallback) {
    
    function processData(errors, mapData, popData) {
	// make popData and popLookup globally accessible
	window.popData = popData.map(function(d) { return {"County": d.County, "Population": +d.Population.replace(/,/g, "")}; });
	window.popLookup = createLookup(window.popData);
	
	processMap(mapData, window.popLookup);
	processBar(window.popData);
	addToVisualizationCallback();
    }

    return processData;
}
    

function getData(addToVisualizationCallback) {
    queue()
	.defer(d3.json, "http://www.cis.umassd.edu/~dkoop/dsc530-2016sp/a4/wi-county.geojson")
	.defer(d3.tsv, "http://www.cis.umassd.edu/~dkoop/dsc530-2016sp/a4/wi-county-pop.tsv")
	.await(processData(addToVisualizationCallback));
}
