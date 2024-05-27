// read json data
d3.json("datatreemap.json", function (data) {
  // Récupérer les noms des SAEs du premier niveau
  const saeName = data.children.map((child) => child.name);

  console.log(saeName); // ["SAE202", "SAE203"]

  // Sélectionner l'élément <select> par son id
  const saeSelect = document.getElementById("saeSelect");

  // Ajouter chaque nom de SAE en tant qu'option dans le <select>
  saeName.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    saeSelect.appendChild(option);
  });

  addEventListener("change", function () {
    d3.select("#my_dataviz svg").remove();

    // Récupérer la valeur sélectionnée
    const selectedValue = saeSelect.value;
    console.log(selectedValue);

    // Trouver les données correspondantes dans le JSON original
    const selectedData = data.children.find(
      (child) => child.name === selectedValue
    );

    // Créer un nouveau JSON avec les données sélectionnées
    const selectJson = JSON.stringify(selectedData, null, 2);
    console.log(selectJson);

    createTreeMap(selectedData);
  });
});

// Créer une hiérarchie à partir des données -------------------------------------

function createTreeMap(jsonData) {
  // set the dimensions and margins of the graph
  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 445 - margin.left - margin.right,
    height = 445 - margin.top - margin.bottom;

  // append the svg object to the body of the page
var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Give the data to this cluster layout:
  var root = d3.hierarchy(jsonData);

  var treemapRoot = d3
    .treemap()
    .size([width, height])
    .paddingTop(28)
    .paddingRight(7)
    .paddingInner(3)(
    // Padding between each rectangle
    //.paddingOuter(6)
    root.sum(function (d) {
      return d.value;
    })
  );

  console.log(root);

  // Then d3.treemap computes the position of each element of the hierarchy
  d3.treemap()
    .size([width, height])
    .paddingTop(28)
    .paddingRight(7)
    .paddingInner(3); // Padding between each rectangle
  //(root)

  // prepare a color scale
  var color = d3
    .scaleOrdinal()
    .domain(["boss1", "boss2", "boss3"])
    .range(["#402D54", "#D18975", "#8FD175"]);

  // And an opacity scale
  var opacity = d3.scaleLinear().domain([10, 30]).range([0.5, 1]);

  // use this information to add rectangles:
  svg
    .selectAll("rect")
    .data(treemapRoot.leaves())
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0;
    })
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .style("stroke", "black")
    .style("fill", function (d) {
      return color(d.parent.data.name);
    })
    .style("opacity", function (d) {
      return opacity(d.data.value);
    });

  // and to add the text labels
  svg
    .selectAll("text")
    .data(treemapRoot.leaves())
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0 + 5;
    }) // +10 to adjust position (more right)
    .attr("y", function (d) {
      return d.y0 + 20;
    }) // +20 to adjust position (lower)
    .text(function (d) {
      return d.data.name.replace("mister_", "");
    })
    .attr("font-size", "19px")
    .attr("fill", "white");

  // and to add the text labels
  svg
    .selectAll("vals")
    .data(treemapRoot.leaves())
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0 + 5;
    }) // +10 to adjust position (more right)
    .attr("y", function (d) {
      return d.y0 + 35;
    }) // +20 to adjust position (lower)
    .text(function (d) {
      return d.data.value;
    })
    .attr("font-size", "11px")
    .attr("fill", "white");

  // Add title for the 3 groups
  svg
    .selectAll("titles")
    .data(
      treemapRoot.descendants().filter(function (d) {
        return d.depth == 1;
      })
    )
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0 + 21;
    })
    .text(function (d) {
      return d.data.name;
    })
    .attr("font-size", "19px")
    .attr("fill", function (d) {
      return color(d.data.name);
    });

  // Add title for the 3 groups
  svg
    .append("text")
    .attr("x", 0)
    .attr("y", 14) // +20 to adjust position (lower)
    .attr("font-size", "19px")
    .attr("fill", "grey");
}

// CHARTS.JS - Séance 2 - Radar des compétences -------------------------------------

// Charger les données JSON
fetch("dataradar.json")
  .then((response) => response.json())
  .then((data) => {
    // Écouter les changements sur l'élément select
    document.querySelector("select").addEventListener("change", function () {
      // Obtenir le nom de la SAE sélectionnée
      const selectedSAE = this.value;

      // Trouver la SAE correspondante dans les données
      const saeData = data.datasets.find(
        (dataset) => dataset.label === selectedSAE
      );

      // Vérifier si une SAE correspondante a été trouvée
      if (saeData) {
        // Utiliser saeData pour créer le graphique
        // ...
      } else {
        console.error("SAE non trouvée :", selectedSAE);
      }
    });
  });

  let chartId; 

// Charger les données JSON
fetch("dataradar.json")
  .then((response) => response.json())
  .then((data) => {
    // Écouter les changements sur l'élément select
    document.querySelector("select").addEventListener("change", function () {
      // supprimer le graphique précédent
      if (chartId) {
        chartId.destroy();
      }

      // Obtenir le nom de la SAE sélectionnée
      const selectedSAE = this.value;

      // Trouver la SAE correspondante dans les données
      const saeData = data.datasets.find(
        (dataset) => dataset.label === selectedSAE
      );

      // Vérifier si une SAE correspondante a été trouvée
      if (saeData) {
        // Utiliser saeData pour créer le graphique
        var chrt = document.getElementById("chartId").getContext("2d");
        chartId = new Chart(chrt, {
          type: "radar",
          data: {
            labels: saeData.labels,
            datasets: [saeData],
          },
          options: {
            responsive: false,
            elements: {
              line: {
                borderWidth: 3,
              },
            },
          },
        });
      } else {
        console.error("SAE non trouvée :", selectedSAE);
      }
    });
  });

  // D3JS - Séance 2 - Sunburst -------------------------------------
  // Code de création de sunburst
        const createSunburst = data => {
            // Spécifiez les couleurs du diagramme et le rayon approximatif.
            const color = d3.scaleOrdinal(d3.schemeCategory10);
            const radius = 928 / 2;

            // Préparez la mise en page.
            const partition = data => d3.partition()
                .size([2 * Math.PI, radius])
                (d3.hierarchy(data)
                    .sum(d => d.value)
                    .sort((a, b) => b.value - a.value));

            const arc = d3.arc()
                .startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                .padRadius(radius / 2)
                .innerRadius(d => d.y0)
                .outerRadius(d => d.y1 - 1);

            const root = partition(data);

            // Créez le conteneur SVG.
            const svg = d3.select("#chart-container").append("svg");

            // Ajoutez un arc pour chaque élément, avec un titre pour les infobulles.
            const format = d3.format(",d");
            svg.append("g")
                .attr("fill-opacity", 0.6)
                .selectAll("path")
                .data(root.descendants().filter(d => d.depth))
                .enter().append("path")
                .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
                .attr("d", arc)
                .append("title")
                .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

            // Ajoutez une étiquette pour chaque élément.
            svg.append("g")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .attr("font-size", 5)
                .attr("font-family", "sans-serif")
                .selectAll("text")
                .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
                .enter().append("text")
                .attr("transform", function(d) {
                    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                    const y = (d.y0 + d.y1) / 2;
                    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
                })
                .attr("dy", "0.35em")
                .text(d => d.data.name);

            // La fonction autoBox ajuste la viewBox du SVG aux dimensions de son contenu.
            svg.attr("viewBox", autoBox);

            return svg.node();
        }

        // Appel de la fonction pour créer le sunburst
        const chartContainer = document.getElementById('chart-container');
        // Les données pour le sunburst
        const data = {
          "name": "root",
          "children": [
            {
              "name": "Compétences sociales (inter-personnelles)",
              "children": [
                {
                  "name": "Communication",
                  "children": [
                    { "name": "Communication - Communiquer à l'oral et à l'écrit", "value": 10 }
                  ]
                },
                {
                  "name": "Travail en groupe et en équipe",
                  "children": [
                    { "name": "Travailler en groupe et en équipe", "value": 10 },
                    { "name": "Coordination de groupe", "value": 10 },
                    { "name": "Empathie", "value": 10 },
                    { "name": "Partage et réception de feedback", "value": 10 }
                  ]
                },
                {
                  "name": "Gestion des conflits",
                  "children": [
                    { "name": "Gestion des conflits - prévenir et gérer des tensions", "value": 10 }
                  ]
                },
                {
                  "name": "Négociation",
                  "children": [
                    { "name": "Influence et persuasion", "value": 10 },
                    { "name": "Persévérance", "value": 10 },
                    { "name": "Diplomatie", "value": 10 }
                  ]
                }
              ]
            },
            {
              "name": "Compétences personnelles (intra-personnelles)",
              "children": [
                {
                  "name": "Leadership positif",
                  "children": [
                    { "name": "Confiance en soi", "value": 10 },
                    { "name": "Responsabilité", "value": 10 },
                    { "name": "Autonomie", "value": 10 },
                    { "name": "Motivation et implication", "value": 10 },
                    { "name": "Mobilisation de réseau", "value": 10 }
                  ]
                },
                {
                  "name": "Auto-évaluation",
                  "children": [
                    { "name": "Introspection et réflexivité", "value": 10 },
                    { "name": "Ethique", "value": 10 },
                    { "name": "Contrôle de soi", "value": 10 },
                    { "name": "Fixation d'objectifs", "value": 10 }
                  ]
                },
                {
                  "name": "Adaptabilité",
                  "children": [
                    { "name": "Gestion de l'incertitude et du changement", "value": 10 },
                    { "name": "Gestion du stress", "value": 10 },
                    { "name": "Réactivité", "value": 10 }
                  ]
                }
              ]
            },
            {
              "name": "Compétences méthodologiques",
              "children": [
                {
                  "name": "Apprendre à apprendre",
                  "children": [
                    { "name": "Apprentissage individuel", "value": 10 },
                    { "name": "Apprentissage collectif", "value": 10 }
                  ]
                },
                {
                  "name": "Compétences analytiques",
                  "children": [
                    { "name": "Collecte et traitement de données", "value": 10 },
                    { "name": "Mener une recherche, une veille d'informations", "value": 10 },
                    { "name": "Problématisation", "value": 10 },
                    { "name": "Analyse de l'information", "value": 10 },
                    { "name": "Synthèse de l'information", "value": 10 },
                    { "name": "Esprit critique", "value": 10 }
                  ]
                },
                {
                  "name": "Créativité et Innovation",
                  "children": [
                    { "name": "Curiosité", "value": 10 },
                    { "name": "Imagination", "value": 10 },
                    { "name": "Esprit d'initiative", "value": 10 }
                  ]
                },
                {
                  "name": "Résolution de problèmes",
                  "children": [
                    { "name": "Faculté à comprendre, analyser, synthétiser un problème", "value": 10 },
                    { "name": "Faculté à modéliser un problème ou poser des hypothèses", "value": 10 },
                    { "name": "Faculté à mettre en œuvre des solutions appropriées", "value": 10 },
                    { "name": "Faculté à mettre en place et respecter un plan d'actions", "value": 10 }
                  ]
                }
              ]
            }
          ]
        };
        
        
      
      
        createSunburst(data);

        // Fonction pour ajuster la viewBox du SVG
        function autoBox() {
            const {x, y, width, height} = this.getBBox();
            return [x, y, width, height];
        }