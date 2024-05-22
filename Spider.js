async function csv_extractor(){
    const data_csv = await d3.csv("data.csv",d=>{
        return {nom_code:d.nom_code,c1:d.c1,c2:d.c2,c3:d.c3,c4:d.c4,c5:d.c5,nom_complet:d.nom_complet,bg:d.bg,border:d.border};
    });
    console.log(data_csv);
    const datasets = {}
    data_csv.forEach(element => {
        document.getElementById("datasetSelector").innerHTML += "<option value='"+element.nom+"'>"+element.nom+"</option>";
        datasets[element.nom]= {
            label: element.nom,
            data: element.data.split(";").map(e=>parseInt(e)),
            fill: true,
            backgroundColor: element.bg,
            borderColor: element.border,
            pointBackgroundColor: element.border,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: element.bg
        }
    });

    const myData = [
        { x: "Nom_code", y: 1, color: "yellow" },
        { x: "c1", y: 2, color: "blue" },
        { x: "c2", y: 3, color: "cyan" },
        { x: "c3", y: 4, color: "pink" },
        { x: "c4", y: 5, color: "cyan" },
        { x: "c5", y: 5, color: "red" },
        { x: "nom_complet", y: 5, color: "green" },
    ];

    // dimensions totale avec marge graphique

    const widthsvg = 1000;
    heightsvg = 500;
    const margin = { 'top': 20, 'bottom': 20, 'left': 28, 'right': 20 };
    const width = widthsvg - margin.left - margin.right;
    const height = heightsvg - margin.top - margin.bottom

    //axes et échelles 

    const xscale = d3.scaleBand(myData.map(row => row.x), [0, width])
        .padding(0.5);
    const yscale = d3.scaleLinear()
        .domain([0, 4])
        .range([height, 0]);
    const xaxis = d3.axisBottom(xScale);
    const yaxis = d3.axisBottom(yScale);

    // BALISE svg 
    const mySvg = d3.select("#D3JS")
        .append("svg")
        .attr("viewBox", [0, 0, widthsvg, heightsvg]);

    const myChart = MySvg.append("g")

        .selectAll("rect")
        .data(myData)
        .join("rect")
        .attr("x", d => xScale(d, x))
        .attr("y", d => yScale(d, y))
        .attr("width", d => xScale.bandwith)
        .attr("height", d => height - yScale(d, y))
        .attr("fill", d => d.color)
        .attr("stroke", black)
        .attr("stroke-width", 4)

    const ctx = document.getElementById('graphChartJS');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Comprendre', 'Concevoir', 'Exprimer', 'Developer', 'Entreprendre'],
            datasets: [{
                data: [1, 2, 3, 4, 5, 6],
                BarPercentage: 0.5,
                backgroundColor: ['yellow', 'blue', 'cyan', 'pink', 'green', 'purple'],
                borderWidth: 3
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const mydata = [
        { x: "Comprendre", y: 1, color: "yellow" },
        { x: "Concevoir", y: 2, color: "blue" },
        { x: "Exprimer", y: 3, color: "cyan" },
        { x: "Developer", y: 4, color: "pink" },
        { x: "Entreprendre", y: 5, color: "black" },
    ]

    const widthSvg = 1000;
    heightsvg = 500;
    const Margin = { 'top': 20, 'bottom': 20, 'left': 28, 'right': 20 };
    const Width = widthsvg - margin.left - margin.right;
    const Height = heightsvg - margin.top - margin.bottom

    const xScale = d3.scaleBand(myData.map(row => row.x), [0, width]).padding(0.5);
    const xAxis = d3.axisBottom(xScale);

    const yScale = d3.scaleLinear([0, 4], [0, height]);
    const yAxis = d3.axisBottom(yScale);


    const MySvg = d3.select("#D3JS")
        .append("svg")
        .attr("viewBox", [0, 0, widthSvg, heightSvg]);



    const MyChart = MySvg.append("g");
}
