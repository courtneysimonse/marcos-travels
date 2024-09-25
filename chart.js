
// Function to fetch data and create the pie chart
async function fetchDataAndCreateChart() {
    // API URL
    const apiUrl = "/.netlify/functions/api"; // Replace with your actual API URL

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
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;

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
    const svg = d3.select("svg")
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
        .attr("fill", d => color(d.data[0]));

    // Add text labels inside each arc
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .text(d => {
            const percentage = ((d.data[1] / totalVotes) * 100).toFixed(0);
            return `${d.data[0]}: ${percentage}%`;
        })
        .style("fill", "#000");
}

// Call the function to fetch data and create the pie chart
fetchDataAndCreateChart();