// import {geoNaturalEarth1} from "https://cdn.skypack.dev/d3-geo-projection@4";
import * as turf from 'https://cdn.jsdelivr.net/npm/@turf/turf@7.0.0/+esm';

async function loadData() {
    // load data file
    const continentsJson = await d3.json("./data/continents.json");
    const oceansJson = await d3.json("./data/ocean.json");

    return [continentsJson, oceansJson]
}

// function fired if there is an error
function error(error) {
    console.log(error)
}

const greyColor = "#aaa"

const continentData = [
    {
        name: "Asia",
        color: greyColor,
        votable: false,
        link: "https://a.co/d/0zOc7mX",
        image: "cover-namaste-india.jpg",
        title: "Marco's Travels: Namaste, India!",
        country: "india"
    },
    {
        name: "Africa",
        color: "#008627",
        votable: true
    },
    {
        name: "North America",
        color: greyColor,
        votable: false,
        link: "https://a.co/d/4xBBBDi",
        image: "cover-st-lucia.jpg",
        title: "Marco's Travels: Sa ka fèt, Saint Lucia!",
        country: "St. Lucia"
    },
    {
        name: "South America",
        color: greyColor,
        votable: false,
        link: "https://a.co/d/h69vXyV",
        image: "cover-hello-brazil.jpg",
        title: "Marco's Travels: Hello, Brazil!",
        country: "Brazil"
    },
    {
        name: "Europe",
        color: "#cb111f",
        votable: true
    },
    {
        name: "Australia/Oceania",
        color: "#f9d51f",
        votable: true
    },
    {
        name: "Antarctica",
        color: greyColor,
        votable: false
    }
]

const data = await loadData();
drawMap(data);

// accepts the data as a parameter statesData
function drawMap(data) {

    const continentsJson = data[0];
    const oceansJson = data[1];
    
    const continentsGeojson = topojson.feature(continentsJson, {
        type: "GeometryCollection",
        geometries: continentsJson.objects.continents.geometries
    });

    const bounds = d3.geoBounds(continentsGeojson);
    const [[minLon, minLat], [maxLon, maxLat]] = bounds;

    const geoWidth = maxLon - minLon;
    const geoHeight = maxLat - minLat;

    const aspectRatio = geoWidth / geoHeight;
    // console.log('GeoJSON Aspect Ratio:', aspectRatio);


    // const oceansGeojson = topojson.feature(oceansJson, {
    //     type: "GeometryCollection",
    //     geometries: oceansJson.objects.ocean.geometries
    // });
    
    const margin = {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10
    };
    
    const width = document.getElementById('map').clientWidth - margin.left - margin.right;
    const height = width / aspectRatio;  // Adjust height based on the aspect ratio    
    
    const projection = d3.geoNaturalEarth1()
        .scale(width / 1.5)  // Adjust scale based on width
        .center([0, -45])    // Move the map center upwards
        .translate([width / 2, height / 2])  // Center on the SVG
        .fitExtent([[10, 0], [width - 10, height - 50]], continentsGeojson);  // Adjust fit

    
    // Prepare SVG path and color, import the
    // effect from above projection.
    const path = d3.geoPath()
        .projection(projection);

    // select the map element
    var svg = d3.select("#map")
        .append("svg")
        .attr("id", "map-svg")
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height - 50 + margin.top + margin.bottom}`)  // Adjust height in the viewBox
        .attr('preserveAspectRatio', 'xMidYMin meet')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


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
    var popupEl = document.getElementById("popup");

    var infoBox = d3.select("#info-box");
    var infoContent = d3.select("#info-content");
    var voteChoice = d3.select("#vote-choice");
    var submitBtn = d3.select(".btn-submit");
    
    var selected;
    
    // create and append a new SVG g element to the SVG
    var continentBoundary = svg.append("g")
        .selectAll("path")  // select all the paths (that don't exist yet)
        .data(continentsGeojson.features) // use the GeoJSON data
        .enter()  // enter the selection
        .append("path")  // append new path elements for each data feature
        .attr("d", path)  // give each path a d attribute value
        .attr("data-continent", (d) => {return d.properties.CONTINENT})
        .classed("continent-poly", true)
        .attr("fill", (d, i) => {
            let data = continentData.find(x => x["name"] == d.properties.CONTINENT);
            return data?.color || "#999";
        })
        .on("mouseover", function(e, d) {  // when mousing over an element
            
            let props = continentData.find(x => x["name"] == d.properties.CONTINENT);
            
            if (props != undefined && props["name"] != "Antarctica") {
                this.style.cursor = 'pointer';
                d3.select(this).classed("hover", true) // select it and add a class name

                let popupHTML = '';

                if (!props["votable"]) {

                    // popupHTML += `<img width="200px" src="./images/${props["image"]}" />`
                    popupHTML += `<p>${props["title"]}</p>`
                } else {

                    popupHTML += `<p>Click to select ${props["name"]}</p>`;
                }
                
                popup.html(popupHTML)
                .style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY - 15) + "px");

                popup.style("display", "block");
                
                popup.transition().duration(200).style("opacity", .95 );   // make tooltip visible and update info
                
            } else {
                popup.transition().duration(200).style("opacity", 0);
                popup.style("display", "none");
            }
            
        })
        .on("mousemove", function(e, d) { // when moving mouse, move popup with it
            popup.style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY - 15) + "px");
        })
        .on("mouseout", function(e, d) { // when mousing out of an element
            d3.select(this).classed("hover", false) // remove the class
            popup.transition().duration(200).style("opacity", 0);
            popup.style("display", "none");

        })
        .on("click", function (e, d) { // on click, fill popup information and show
            
            e.stopPropagation();
            
            let props = continentData.find(x => x["name"] == d.properties.CONTINENT);
            
            if (props != undefined && props.name != "Antarctica") {
                if (selected != null) {
                    selected.classed("selected", false) // removed class from last selected
                }
                selected = d3.select(this);
                d3.select(this).classed("selected", true).raise(); // select it and add a class name

                let infoHTML = "";
                infoHTML += `<h3>${props['name']}</h3><hr>`;

                if (!props["votable"]) {
                    submitBtn.classed("hidden", true);
                    infoHTML += `<p>Marco has already visited ${props["name"]} - ${props["country"]}`
                    infoHTML += `<img width="200px" src="./images/${props["image"]}" />`
                    infoHTML += `<p>Read Marco's adventure in <a href="${props["link"]}" target="_blank">${props["title"]}</a></p>`
                } else {
                    voteChoice.property("value",props["name"]);
                    submitBtn.classed("hidden", false);
                    infoHTML += `<p>Vote for Marco to visit ${props["name"]}?</p>`;
                }

                infoContent.html(infoHTML);
                
                infoBox.transition().duration(200).style("opacity", 1);
                
            
                
            } else {
                // popup.transition().duration(200).style("opacity", 0);
                // popup.style("display", "none");
            }
        })


    continentsGeojson.features.forEach(x => {
        const textArray = x.properties.CONTINENT.split(" ");
        // Append the text to the SVG
        const text = svg.append("text")
            .attr('text-anchor', 'middle')
            .attr("transform", function() { 
                const point = turf.point([x.properties.label[1], x.properties.label[0]])
            
                return "translate(" + path.centroid(point)[0] + "," + path.centroid(point)[1] + ")";
            })
            .attr("font-family", "Verdana")
            .attr("font-size", 16);

        // Append each word in a separate <tspan> with a new line
        textArray.forEach((word, i) => {
            text.append("tspan")
            .attr("x", 10)  // Keep the same x position
            .attr("dy", i === 0 ? 0 : 20)  // Offset the vertical position for each word
            .text(word);
        });
    })


    d3.select("form").on("submit", async (e) => {
        e.preventDefault();

        e.target.classList.add("hidden");
        infoContent.classed("hidden", true);
        d3.select('h3.centered').classed("hidden", true)

        const formData = new FormData(e.target);
  
        await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        })

        console.log("form submitted");

        // Call the function to fetch data and create the pie chart
        fetchDataAndCreateChart();
        
    })

    


    // d3.select('body').on('click', () => {
    //     if (selected != null) {
    //         selected.classed("selected", false) // removed class from last selected
    //     }
    // })

 

    // d3.select(window).on('resize', () => {
    //     svg.attr(
    //         'viewBox',
    //         `0 0 ${width + margin.left + margin.right} ${
    //             height + margin.top + margin.bottom
    //         }`
    //         );
    //     });
        
    
        
} // end drawMap


// Function to fetch data and create the pie chart
async function fetchDataAndCreateChart() {
    // API URL
    const apiUrl = "/.netlify/functions/api";

    try {
        // Fetch the data
        const response = await fetch(apiUrl);
        const choices = await response.json();

        // Count occurrences of each choice
        const choiceCount = choices.reduce((acc, choice) => {
            acc[choice] = (acc[choice] || 0) + 1;
            return acc;
        }, {});

        // Now create the pie chart with the fetched data
        createPieChart(choiceCount);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to create the pie chart
function createPieChart(data) {
    // Set dimensions and radius of the pie chart
    const width = 200;
    const height = 200;
    const radius = (Math.min(width, height) / 2);

    const colorMapping = {
        Africa: "#008627",   
        Europe: "#cb111f",  
        Oceania: "#f9d51f" 
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

    // Create an SVG group element for the pie chart
    const svg = d3.select("#pie-chart")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

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
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => {
            const percentage = ((d.data[1] / totalVotes) * 100).toFixed(0);
            return `${d.data[0]}: ${percentage}%`;
        })
        .style("fill", "#000");

    d3.select('h3.centered')
        .text(`Total Votes: ${totalVotes}`)
        .classed("hidden", false)
}

    