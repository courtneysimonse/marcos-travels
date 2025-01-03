// import {geoNaturalEarth1} from "https://cdn.skypack.dev/d3-geo-projection@4";
// import * as turf from 'https://cdn.jsdelivr.net/npm/@turf/turf@7.0.0/+esm';

async function loadData() {
    // load data file
    // const countriesJson = await d3.json("./data/countries_polygons.json");
    // const oceansJson = await d3.json("./data/ocean.json");
    const nileJson = await d3.json("./data/nile-river.geojson");
    const lakesJson = await d3.json("./data/africa-lakes.geojson");
    // const tinyJson = await d3.json("./data/tiny-countries.geojson");
    // const countriesSVG = await d3.svg("./images/africa.svg")

    return [
        // countriesJson,
        nileJson,
        lakesJson,
        // tinyJson,
        // countriesSVG
        // , oceansJson
    ]
}

// function fired if there is an error
function error(error) {
    console.log(error)
}

const greyColor = "#aaa"

const colors = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d'];

const excluded = [];

const data = await loadData();
await fetchDataAndCreateChart();
// d3.selectAll('.results').classed("hidden", false);
drawMap(data);

// accepts the data as a parameter statesData
function drawMap(data) {

    // const countriesJson = data[0];
    // const oceansJson = data[1];
    const nileJson = data[0];
    const lakesJson = data[1];
    // const tinyJson = data[3];
    // const countriesSVG = data[4];
      
    // select popup element
    var popup = d3.select("#popup");
    // var popupEl = document.getElementById("popup");

    var voteChoice = d3.select("#vote-choice");
    var submitBtn = d3.select(".btn-submit");
    var popupText = d3.select("#popup-text");
    var hoverPopup = d3.select("#hover");

    const svg = d3.select("#map-svg")
    
    // Select the <g> group by id
    const polygons = d3.select("#map-svg").select("#polygons");

    // Select all <path> elements within the group
    polygons.selectChildren()
        .each(function () {
            const path = d3.select(this);
            const titleElement = path.select("title");
            
            if (!titleElement.empty()) {
                // If a title exists, store it as a data attribute
                path.attr("data-title", titleElement.text());
            } else {
                // Log to console if the title is missing
                console.warn("Polygon missing title:", this);
            }
        })
        // .classed("country-poly", true)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .on("click", click)

    
    var selected;

    // svg.append("g")
    //     .selectAll("path")  // select all the paths (that don't exist yet)
    //     .data(nileJson.features) // use the GeoJSON data
    //     .enter()  // enter the selection
    //     .append("path")  // append new path elements for each data feature
    //     .attr("d", path)  // give each path a d attribute value
    //     .attr("fill", "#1a88b9")
    //     .attr("stroke", "#1a88b9")
    //     .attr("stroke-width", 3)
    //     .attr("fill-opacity", 0)

    // svg.append("g")
    //     .selectAll("path")  // select all the paths (that don't exist yet)
    //     .data(lakesJson.features) // use the GeoJSON data
    //     .enter()  // enter the selection
    //     .append("path")  // append new path elements for each data feature
    //     .attr("d", path)  // give each path a d attribute value
    //     .attr("fill", "#1a88b9")
    //     .attr("stroke", "#0f516f")
    //     .attr("fill-opacity", .7)


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
        
    function mouseover(e) {  // when mousing over an element
            
        let name = this.dataset.title;

        d3.select(this).raise();
        
        if (name) {
            d3.select(this).classed("hover", true) // select it and add a class name
    
            let popupHTML = '';
    
            if (excluded.includes(name)) {
                popupHTML += `<p>Sorry, Marco isn't traveling to ${name} this time.</p>`
            } else {
                popupHTML += `<p>Click to select ${name}</p>`;
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

        const name = this.dataset.title;
        
        if (name) {
            if (selected != null) {
                selected.classed("selected", false) // removed class from last selected
            }
            selected = d3.select(this);
            d3.select(this).classed("selected", true).raise(); // select it and add a class name

            let infoHTML = "";

            if (excluded.includes(name)) {
                submitBtn.classed("hidden", true);
                infoHTML += `<p></p>`
                
            } else {
                voteChoice.property("value",name);
                submitBtn.classed("hidden", false);
                infoHTML += `<p class="vote-question">Vote for Marco to visit ${name}!</p>`;

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

