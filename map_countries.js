// import {geoNaturalEarth1} from "https://cdn.skypack.dev/d3-geo-projection@4";
// import * as turf from 'https://cdn.jsdelivr.net/npm/@turf/turf@7.0.0/+esm';

async function loadData() {
    // load data file
    const countriesJson = await d3.json("./data/countries_polygons.json");
    // const oceansJson = await d3.json("./data/ocean.json");
    const nileJson = await d3.json("./data/nile-river.geojson");
    const lakesJson = await d3.json("./data/africa-lakes.geojson");
    const tinyJson = await d3.json("./data/tiny-countries.geojson");

    return [countriesJson,
        nileJson,
        lakesJson,
        tinyJson
        // , oceansJson
    ]
}

// function fired if there is an error
function error(error) {
    console.log(error)
}

const greyColor = "#aaa"

const colors = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d'];

const data = await loadData();
await fetchDataAndCreateChart();
// d3.selectAll('.results').classed("hidden", false);
drawMap(data);

// accepts the data as a parameter statesData
function drawMap(data) {

    const countriesJson = data[0];
    // const oceansJson = data[1];
    const nileJson = data[1];
    const lakesJson = data[2];
    const tinyJson = data[3];
    
    const countriesGeojson = topojson.feature(countriesJson, {
        type: "GeometryCollection",
        geometries: countriesJson.objects.countries_polygons.geometries
    });

    const bounds = d3.geoBounds(countriesGeojson);
    console.log('Geo Bounds:', bounds);
    const [[minLon, minLat], [maxLon, maxLat]] = bounds;

    const geoWidth = maxLon - minLon;
    const geoHeight = maxLat - minLat;

    const aspectRatio = geoWidth / geoHeight;
    console.log('GeoJSON Aspect Ratio:', aspectRatio);


    // const oceansGeojson = topojson.feature(oceansJson, {
    //     type: "GeometryCollection",
    //     geometries: oceansJson.objects.ocean.geometries
    // });
    
    const margin = {
        top: 10,
        right: 0,
        bottom: 10,
        left: 0
    };
    
    const height = document.getElementById('map').clientHeight;
     - margin.left - margin.right;
    
    // const width = height * aspectRatio;  // Adjust height based on the aspect ratio    
    // const width = document.getElementById('map').clientWidth;
    
    const width = document.getElementById('map').clientWidth;
     - margin.left - margin.right;
    // console.log(aspectRatio);
    
    // const height = width / aspectRatio;  // Adjust height based on the aspect ratio    
    
    console.log('SVG Width:', width);
    console.log('SVG Height:', height);

    // document.getElementById('map').style.width = width+"px";

    const projection = d3.geoNaturalEarth1()
        // .scale(width)  // Adjust scale based on width
        .fitSize([width - 150, height - 90], countriesGeojson)  // Adjust fit

    // Prepare SVG path and color, import the
    // effect from above projection.
    const path = d3.geoPath()
        .projection(projection);
    
    // console.log(projection([170,0]));
    

    // select the map element
    var svg = d3.select("#map")
        .append("svg")
        .attr("id", "map-svg")
        .attr('viewBox', `0 0 ${width} ${height}`)  // Adjust height in the viewBox
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', 'translate(' + 75 + ',' + 45 + ')');


    // var oceanBoundary = svg.append("g")
    //     .selectAll("path")  // select all the paths (that don't exist yet)
    //     .data(oceansGeojson.features) // use the GeoJSON data
    //     .enter()  // enter the selection
    //     .append("path")  // append new path elements for each data feature
    //     .attr("d", path)  // give each path a d attribute value
    //     .attr("fill", "#1a88b9")
    //     .attr("stroke", "#373737")
    //     .attr("fill-opacity", .7)
    
    // select popup element
    var popup = d3.select("#popup");
    // var popupEl = document.getElementById("popup");

    var voteChoice = d3.select("#vote-choice");
    var submitBtn = d3.select(".btn-submit");
    var popupText = d3.select("#popup-text");
    var hoverPopup = d3.select("#hover");
    
    var selected;
    
    // create and append a new SVG g element to the SVG
    var countryBoundary = svg.append("g")
        .selectAll("path")  // select all the paths (that don't exist yet)
        .data(countriesGeojson.features) // use the GeoJSON data
        .enter()  // enter the selection
        .append("path")  // append new path elements for each data feature
        .attr("d", path)  // give each path a d attribute value
        .attr("data-country", (d) => {return d.properties.NAME})
        .classed("country-poly", true)
        .attr("fill", (d, i) => {
            return colors[+d.properties["MAPCOLOR7"]] || "#999";
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .on("click", click)

    svg.append("g")
        .selectAll("circle")  // select all the paths (that don't exist yet)
        .data(tinyJson.features) // use the GeoJSON data
        .enter()  // enter the selection
        .append("circle")
        .attr("cx", d => projection(d.geometry.coordinates)[0])
        .attr("cy", d => projection(d.geometry.coordinates)[1])
        .attr("r", 5)
        .attr("fill", (d, i) => {
            return colors[+d.properties["MAPCOLOR7"]] || "#999";
        })
        .classed("country-poly", true)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .on("click", click)

    svg.append("g")
        .selectAll("path")  // select all the paths (that don't exist yet)
        .data(nileJson.features) // use the GeoJSON data
        .enter()  // enter the selection
        .append("path")  // append new path elements for each data feature
        .attr("d", path)  // give each path a d attribute value
        .attr("fill", "#1a88b9")
        .attr("stroke", "#1a88b9")
        .attr("stroke-width", 3)
        .attr("fill-opacity", 0)

    svg.append("g")
        .selectAll("path")  // select all the paths (that don't exist yet)
        .data(lakesJson.features) // use the GeoJSON data
        .enter()  // enter the selection
        .append("path")  // append new path elements for each data feature
        .attr("d", path)  // give each path a d attribute value
        .attr("fill", "#1a88b9")
        .attr("stroke", "#0f516f")
        .attr("fill-opacity", .7)


    countriesGeojson.features.forEach(drawLabels)

    tinyJson.features.forEach(drawLabels)


    d3.select("form").on("submit", async (e) => {
        e.preventDefault();

        const lastSubmission = localStorage.getItem('formSubmissionDate');
        const now = new Date().getTime();

        if (lastSubmission) {
            const timeElapsed = now - lastSubmission;
            const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
      
            if (timeElapsed < oneDay) {
              alert('You have already submitted the form today. Please try again tomorrow.');
              return;
            }
        }

        // If no submission or it's been more than a day, allow submission
        localStorage.setItem('formSubmissionDate', now);

        e.target.classList.add("hidden");
        // infoContent.classed("hidden", true);
        // d3.select('h3.centered').classed("hidden", true);

        const formData = new FormData(e.target);
        formData.append("form-name", "country")
        const reqBody = new URLSearchParams(formData);
  
        await fetch("https://marcos-travels.netlify.app/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: reqBody.toString(),
        })

        console.log("form submitted");

        // // Call the function to fetch data and create the pie chart
        // await fetchDataAndCreateChart();
        
    })

    


    d3.select('body').on('click', () => {
        if (selected != null) {
            selected.classed("selected", false) // removed class from last selected
            popup.transition().duration(200).style("opacity", 0);
            popup.style("display", "none");
        }
    })

 

    // d3.select(window).on('resize', () => {
    //     svg.attr(
    //         'viewBox',
    //         `0 0 ${width + margin.left + margin.right} ${
    //             height + margin.top + margin.bottom
    //         }`
    //         );
    //     });
        
    function mouseover(e, d) {  // when mousing over an element
            
        let name = d.properties["NAME"]
        
        if (name) {
            d3.select(this).classed("hover", true) // select it and add a class name
    
            let popupHTML = '';
    
            if (d.properties["exclude"]) {
                popupHTML += `<p>Sorry, Marco isn't traveling to ${name} this time.</p>`
            } else {
                popupHTML += `<p>Click to select ${d.properties["NAME_LONG"]}</p>`;
            }
    
            hoverPopup.html(popupHTML);
            
            hoverPopup.style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY - 15) + "px");
    
            hoverPopup.style("display", "block");
            
            hoverPopup.transition().duration(200).style("opacity", .95 );   // make tooltip visible and update info
            
        } else {
            hoverPopup.transition().duration(200).style("opacity", 0);
            hoverPopup.style("display", "none");
        }
        
    }

    function mousemove(e, d) { // when moving mouse, move popup with it
        hoverPopup.style("left", (e.pageX + 10) + "px")
            .style("top", (e.pageY - 15) + "px");
    }

    function mouseout(e, d) { // when mousing out of an element

        d3.select(this).classed("hover", false) // remove the class
        hoverPopup.transition().duration(200).style("opacity", 0);
        hoverPopup.style("display", "none");

    }

    function click(e, d) { // on click, fill popup information and show
        hoverPopup.transition().duration(200).style("opacity", 0);
        hoverPopup.style("display", "none");

        e.stopPropagation();
        
        if (d.properties["NAME"]) {
            if (selected != null) {
                selected.classed("selected", false) // removed class from last selected
            }
            selected = d3.select(this);
            d3.select(this).classed("selected", true).raise(); // select it and add a class name

            let infoHTML = "";

            if (d.properties["exclude"]) {
                submitBtn.classed("hidden", true);
                infoHTML += `<p></p>`
                
            } else {
                voteChoice.property("value",d.properties["NAME"]);
                submitBtn.classed("hidden", false);
                infoHTML += `<p class="vote-question">Vote for Marco to visit ${d.properties["NAME_LONG"]}!</p>`;

                popupText.html(infoHTML);

                popup.style("left", (e.pageX + 10) + "px")
                    .style("top", (e.pageY - 15) + "px");
                popup.style("display", "block");
            
                popup.transition().duration(200).style("opacity", .95 );
            }
            
            
        } else {
            popup.transition().duration(200).style("opacity", 0);
            popup.style("display", "none");
        }
    }

    function drawLabels(x) {
        if (x.properties["callouts_originx"] || x.properties["callouts_destinationx"]) {
            console.log("need callout");
            // console.log(projection([x.properties["callouts_originx"], x.properties["callouts_originy"]]));
            // console.log(path.centroid(x));

            let originx = x.properties["callouts_originx"] ? x.properties["callouts_originx"] : x.properties["LABEL_X"];
            let originy = x.properties["callouts_originy"] ? x.properties["callouts_originy"] : x.properties["LABEL_Y"];
            let destinationx = x.properties["callouts_destinationx"] ? x.properties["callouts_destinationx"] : path.centroid(x)[0];
            let destinationy = x.properties["callouts_destinationy"] ? x.properties["callouts_destinationy"] : path.centroid(x)[1];

            svg.append("line")
                .attr("x1",
                    projection([originx, originy])[0]
                )
                .attr("y1", 
                    projection([originx, originy])[1]
                )
                .attr("x2", projection([destinationx, destinationy])[0])
                .attr("y2", projection([destinationx, destinationy])[1])
                .attr("stroke", "black")
            
        }
        
        const textArray = x.properties.NAME.split(" ");
        // Append the text to the SVG
        const text = svg.append("text")
            .classed("map-label", true)
            .attr('text-anchor', 'middle')
            .attr("transform", function() { 
                const point = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [x.properties["LABEL_X"], x.properties["LABEL_Y"]]
                    }
                };
            
                return "translate(" + path.centroid(point)[0] + "," + path.centroid(point)[1] + ")";
            })
            .attr("font-family", "franklin-gothic-condensed")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            // .attr("stroke", "black")
            // .attr("stroke-width", 0.5)
            // .attr("stroke-opacity", 0.4)
            .attr("font-size", 14);

        // Append each word in a separate <tspan> with a new line
        textArray.forEach((word, i) => {
            text.append("tspan")
            .attr("x", 10)  // Keep the same x position
            .attr("dy", i === 0 ? 0 : 14)  // Offset the vertical position for each word
            .text(word);
        });

        
    }
        
} // end drawMap


// Function to fetch data and create the pie chart
async function fetchDataAndCreateChart() {
    // API URL
    const apiUrl = "/.netlify/functions/api_countries";

    try {
        // Fetch the data
        const response = await fetch(apiUrl);
        const choices = await response.json();

        d3.select("#vote-count").text(choices.length)

        // // Count occurrences of each choice
        // const choiceCount = choices.reduce((acc, choice) => {
        //     acc[choice] = (acc[choice] || 0) + 1;
        //     return acc;
        // }, {});

        // Now create the pie chart with the fetched data
        // createPieChart(choiceCount);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to create the pie chart
function createPieChart(data) {
    // Set dimensions and radius of the pie chart
    const width = 90;
    const height = 110;
    const radius = (Math.min(width, height) / 2);

    const colorMapping = {
        Africa: "#008627",   
        Europe: "#cb111f",  
        "Australia/ Oceania": "#f9d51f" 
    };

    // Create the color scale
    const color = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(Object.keys(data).map(choice => colorMapping[choice] || "#ccc"));

    // Total number of votes
    const totalVotes = Object.values(data).reduce((sum, count) => sum + count, 0);

    // Create the pie function
    const pie = d3.pie()
        .value(d => d[1]); // Value comes from the data object

    // Create the arc function
    const arc = d3.arc()
        .innerRadius(0) // Full pie chart (no hole in the middle)
        .outerRadius(radius);

    d3.select("#pie-chart > *").remove()
    // Create an SVG group element for the pie chart
    const svg = d3.select("#pie-chart")
        .attr("width", width * 2.3)
        .attr("height", height * 1.2)
        .append("g")
        .attr("transform", `translate(${(width / 2) + 66}, ${height / 2 + 10})`);

    // Create arcs and append them to the pie chart
    const arcs = svg.selectAll(".arc")
        .data(pie(Object.entries(data)))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Append path for each arc and set the color
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0]))
        .attr("stroke", "#fff");

    svg.selectAll("text")
        .data(pie(Object.entries(data)))
        .enter()
        .append("text")
        .attr("transform", d => {

            const translate = [0, 0];

            if (arc.centroid(d)[0] > 0) {
                translate[0] = arc.centroid(d)[0] + 50;
            } else {
                translate[0] = arc.centroid(d)[0] - 50;
            }

            if (arc.centroid(d)[1] > 0) {
                translate[1] = arc.centroid(d)[1] + 20;
            } else {
                translate[1] = arc.centroid(d)[1] - 25;
            }
            
            return `translate(${translate[0]}, ${translate[1]})`;
        })
        .attr("text-anchor", "middle")
        .text(d => {
            const percentage = ((d.data[1] / totalVotes) * 100).toFixed(0);
            return `${d.data[0]}: ${percentage}%`;
        })
        .style("fill", "#000")
        .style("font-size", "8pt")
        .style("font-family", "franklin-gothic-condensed");

    d3.select('#total-votes')
        .text(`Total Votes: ${totalVotes}`);
}

