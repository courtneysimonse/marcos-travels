import {geoNaturalEarth2} from "https://cdn.skypack.dev/d3-geo-projection@4";

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

const continentData = [
    {
        name: "Asia",
        color: "#656565",
        votable: false,
        link: "https://a.co/d/0zOc7mX",
        image: "cover-namaste-india.jpg",
        title: "Marco's Travels: Namaste, India!"
    },
    {
        name: "Africa",
        color: "#008627",
        votable: true
    },
    {
        name: "North America",
        color: "#656565",
        votable: false,
        link: "https://a.co/d/4xBBBDi",
        image: "cover-st-lucia.png",
        title: "Marco's Travels: Sa ka fèt, Saint Lucia!"
    },
    {
        name: "South America",
        color: "#656565",
        votable: false,
        link: "https://a.co/d/h69vXyV",
        image: "cover-hello-brazil.jpg",
        title: "Marco's Travels: Hello, Brazil!​"
    },
    {
        name: "Europe",
        color: "#cb111f",
        votable: true
    },
    {
        name: "Oceania",
        color: "#f9d51f",
        votable: true
    },
    {
        name: "Antarctica",
        color: "#656565",
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

    const oceansGeojson = topojson.feature(oceansJson, {
        type: "GeometryCollection",
        geometries: oceansJson.objects.ocean.geometries
    });
    
    const margin = {
        top: 10,
        right: 0,
        bottom: 0,
        left: 0
    };
    
    const width = document.getElementById('map').clientWidth - margin.left - margin.right;
    const height = document.getElementById('map').clientHeight - margin.top - margin.bottom;
    
    const projection = geoNaturalEarth2()
        .fitExtent([[10,10],[width-10,height-10]], continentsGeojson)
    
    // Prepare SVG path and color, import the
    // effect from above projection.
    const path = d3.geoPath()
    .projection(projection);

    // select the map element
    var svg = d3.select("#map")
    .append("svg")  // append a new SVG element
    .attr(
        'viewBox',
        // `0 0 100 100`
        `0 0 ${width + margin.left + margin.right} ${
            height + margin.top + margin.bottom
        }`
        )
    .attr('preserveAspectRatio', 'xMidYMin meet')
    .append('g')
    .attr(
        'transform',
        'translate(' + margin.left + ',' + margin.top + ')'
        );
        
    var oceanBoundary = svg.append("g")
        .selectAll("path")  // select all the paths (that don't exist yet)
        .data(oceansGeojson.features) // use the GeoJSON data
        .enter()  // enter the selection
        .append("path")  // append new path elements for each data feature
        .attr("d", path)  // give each path a d attribute value
        .attr("fill", "#1a88b9")
        .attr("stroke", "#373737")
        .attr("fill-opacity", .7)
    
    // // select popup element
    // var popup = d3.select("#popup");
    // var popupEl = document.getElementById("popup");

    var infoBox = d3.select("#info-box");
    var infoContent = d3.select("#info-content");
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
        if (data == undefined) {
            console.log(d);
        } else if (data["color"]) {
            return data["color"];
        } else {
            return "#999";
        }
        
    })
    .on("mouseover", function(e, d) {  // when mousing over an element
        
        let props = continentData.find(x => x["name"] == d.properties.CONTINENT);
        
        if (props != undefined) {
            this.style.cursor = 'pointer';
            d3.select(this).classed("hover", true) // select it and add a class name

            // let popupHTML = '';
            
            // // state name
            // popupHTML += `<h5>${props['State']}</h5>`;

            // popupHTML += `<p>Click here for more info</p>`;
            
            // document.getElementById('content-div').innerHTML = popupHTML;

            // popup.style("display", "block");
            
            // popup.transition().duration(200).style("opacity", .95 );   // make tooltip visible and update info
            
        } else {
            // popup.transition().duration(200).style("opacity", 0);
            // popup.style("display", "none");
        }
        
    })
    // .on("mousemove", function(e, d) { // when moving mouse, move popup with it
    //     const virtualEl = {
    //         getBoundingClientRect() {
    //             return {
    //                 width: 0,
    //                 height: 0,
    //                 x: e.clientX,
    //                 y: e.clientY,
    //                 top: e.clientY,
    //                 left: e.clientX,
    //                 right: e.clientX,
    //                 bottom: e.clientY,
    //             };
    //         },
    //     };

    //     FloatingUIDOM.computePosition(virtualEl, popupEl, {
    //         placement: 'top',
    //         middleware: [
    //             FloatingUIDOM.offset(5),
    //             FloatingUIDOM.autoPlacement(),
    //             FloatingUIDOM.shift({padding: 8}),
    //             FloatingUIDOM.arrow({element: document.getElementById("arrow")})
    //         ]
    //     }).then(({x, y, placement, middlewareData}) => {
    //         Object.assign(popupEl.style, {
    //             left: `${x}px`,
    //             top: `${y}px`,
    //         });
            
    //         const {x: arrowX, y: arrowY} = middlewareData.arrow;
            
    //         const staticSide = {
    //             top: 'bottom',
    //             right: 'left',
    //             bottom: 'top',
    //             left: 'right',
    //         }[placement.split('-')[0]];
            
    //         Object.assign(document.getElementById("arrow").style, {
    //             left: arrowX != null ? `${arrowX}px` : '',
    //             top: arrowY != null ? `${arrowY}px` : '',
    //             right: '',
    //             bottom: '',
    //             [staticSide]: '-4px',
    //         });
    //     });
    // })
    .on("mouseout", function(e, d) { // when mousing out of an element
        d3.select(this).classed("hover", false) // remove the class
        // popup.transition().duration(200).style("opacity", 0);
        // popup.style("display", "none");

    })
    .on("click", function (e, d) { // on click, fill popup information and show
        
        e.stopPropagation();
        
        let props = continentData.find(x => x["name"] == d.properties.CONTINENT);
        
        if (props != undefined) {
            if (selected != null) {
                selected.classed("selected", false) // removed class from last selected
            }
            selected = d3.select(this);
            d3.select(this).classed("selected", true).raise(); // select it and add a class name

            let infoHTML = "";
            infoHTML += `<h3>${props['name']}</h3><hr>`;

            if (!props["votable"]) {
                submitBtn.classed("hidden", true);
                infoHTML += `<img width="200px" src="./images/${props["image"]}" />`
                infoHTML += `<p>Read Marco's adventure in <a href="${props["link"]}" target="_blank">${props["title"]}</a></p>`
            } else {
                submitBtn.classed("hidden", false);
                infoHTML += `<p>Do you want to vote for Marco to travel to ${props["name"]}?</p>`;
            }

            // var infoLink = props['More Info Link'];
            // if (infoLink == '') {
            //     infoLink = '#';
            // }

            // infoHTML += `<ul>
            // <li><strong>Does State Require Home Care License:</strong> ${props['Does State Require Home Care License']}</li>
            // <li><strong>Type of License Required:</strong> ${props['Type of License Required']}</li>
            // <li><strong>Typical Processing Time from App to Approval:</strong> ${props['Typical Processing Time from App to Approval']}</li>
            // <li><strong>On-Site Survey Required:</strong> ${props['On-Site Survey Required']}</li>
            // <li><strong>Required Training for HCA Manager:</strong> ${props['Required Training for HCA Manager']}</li>
            // <li><strong>Initial Application Fee:</strong> ${props['Initial Application Fee']}</li>
            // <li><strong>Required Roles: </strong> ${props['Required Roles']}</li>
            // <li><strong>RN Required: </strong> ${props['RN Required']}</li>
            // <li><strong>Health Department: </strong> <a href="${props['Health Department Link']}" target="_blank">${props['Health Department']}</a></li>
            // <li><strong>Home Care Regulations: </strong> <a href="${props['Home Care Regulations Link']}" target="_blank">${props['Home Care Regulations']}</a></li>
            // </ul>
            // <p><a class="button button-primary" href="${infoLink}">More ${props['State']} Info</a></p>
            // <p><a class="button button-secondary" href="https://www.thebizofseniorcare.com/pages/about-me">Contact Us</a></p>`;

            infoContent.html(infoHTML);
            
            infoBox.transition().duration(200).style("opacity", 1);
            
           
            
        } else {
            // popup.transition().duration(200).style("opacity", 0);
            // popup.style("display", "none");
        }
    })


    // var dc = path.centroid(statesGeoJSON.features.find(x => x.properties.name == "District of Columbia"));

    // // find DC star, move, and raise to top of states
    // d3.select(`[data-state="District of Columbia"]`)
    //     .attr("transform", (d) => { 
    //         return "translate(" + dc[0] + "," + dc[1] + ")";
    //     })
    //     .raise();
    

    // // d3.select('body').on('click', () => {
    // //     if (selected != null) {
    // //         selected.classed("selected", false) // removed class from last selected
    // //     }
    // // })

    // // create a list of keys
    // var keys = ["Requires State Home Care License", "No State Home Care License Required"]

    // // Usually you have a color scale in your chart already
    // var color = d3.scaleOrdinal()
    // .domain(keys)
    // .range(["#99badd","#ddbc99"]);

    // //Initialize legend
    // var legendItemSize = 24;
    // var legendSpacing = 4;
    // var xOffset = 150;
    // var yOffset = 500;
    // var legend = svg
    // .append('g')
    //     .selectAll('.legendItem')
    //     .data(keys);

    // //Create legend items
    // legend
    // .enter()
    // .append('rect')
    // .attr('class', 'legendItem')
    // .attr('width', legendItemSize)
    // .attr('height', legendItemSize)
    // .style('fill', d => color(d))
    // .attr('transform',
    //         (d, i) => {
    //             var x = xOffset;
    //             var y = yOffset + (legendItemSize + legendSpacing) * i;
    //             return `translate(${x}, ${y})`;
    //         });

    // //Create legend labels
    // legend
    // .enter()
    // .append('text')
    // .attr('x', xOffset + legendItemSize + 5)
    // .attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 18)
    // .text(d => d);  
    

    // d3.select(window).on('resize', () => {
    //     svg.attr(
    //         'viewBox',
    //         `0 0 ${width + margin.left + margin.right} ${
    //             height + margin.top + margin.bottom
    //         }`
    //         );
    //     });
        
    
        
} // end drawMap
    