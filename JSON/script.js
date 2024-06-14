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
    // .paddingTop(28)
    // .paddingRight(7)
    .padding(4)
    .paddingInner(3)(
    root.sum(function (d) {
      return d.value;
    })
  );

  // Calculate total value for percentage calculation
  var totalValue = root.value;

  console.log(root);

  // prepare a color scale
  var color = d3
    .scaleOrdinal()
    .domain([
      "Comprendre",
      "Concevoir",
      "Exprimer",
      "Entreprendre",
      "Developper",
    ])
    .range(["#F2622E", "#F2E313", "#4BF286", "#B294F2", "#88A2F2"]);

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
    .style("stroke", "none")
    .style("fill", function (d) {
      return color(d.parent.data.name);
    })
    .style("opacity", function (d) {
      return opacity(100);
    })
    .on("mouseover", function (event, d) {
      d3.select(this).style(
        "fill",
        d3.color(color(d.parent.data.name)).brighter(0.7)
      );
    })
    .on("mouseout", function (event, d) {
      d3.select(this).style("fill", color(d.parent.data.name));
    });

  // Function to handle text wrapping
  function wrapText(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")) || 0,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", text.attr("x"))
          .attr("y", y)
          .attr("dy", dy + "em");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", text.attr("x"))
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }

  // Add the text labels with wrapping
  svg
    .selectAll("text.label")
    .data(treemapRoot.leaves())
    .enter()
    .append("text")
    .attr("x", function (d) {
      return (d.x0 + d.x1) / 2;
    }) // Center horizontally
    .attr("y", function (d) {
      return (d.y0 + d.y1) / 2 - 5;
    }) // Center vertically with adjustment
    .attr("text-anchor", "middle") // Center text
    .attr("font-size", "9px") // Reduced font size
    .attr("fill", "white")
    .attr("font-weight", "bold") // Make title bold
    .text(function (d) {
      return d.data.name.replace("mister_", "");
    })
    .call(wrapText, function (d) {
      return d.x1 - d.x0 - 10;
    }); // Adjust width for wrapping

  // Add percentage values under the text labels
  svg
    .selectAll("text.percentage")
    .data(treemapRoot.leaves())
    .enter()
    .append("text")
    .attr("x", function (d) {
      return (d.x0 + d.x1) / 2;
    }) // Center horizontally
    .attr("y", function (d) {
      return (d.y0 + d.y1) / 2 + 10;
    }) // Positioned below the main text, closer to the title
    .attr("text-anchor", "middle") // Center text
    .attr("font-size", "9px")
    .attr("fill", "white")
    .text(function (d) {
      return ((d.value / totalValue) * 100).toFixed(2) + "%";
    });

  // Add title for the 3 groups

  // svg
  // .selectAll("titles")
  // .data(treemapRoot.descendants().filter(function (d) { return d.depth == 1; }))
  // .enter()
  // .append("text")
  // .attr("x", function (d) { return (d.x0 + d.x1) / 2; }) // Center horizontally
  // .attr("y", function (d) { return d.y0 + 21; })
  // .attr("text-anchor", "middle") // Center text
  // .text(function (d) { return d.data.name; })
  // .attr("font-size", "19px")
  // .attr("fill", "white")
  // .attr("font-weight", "bold"); // Make group title bold

  // Add title for the 3 groups
  svg
    .append("text")
    .attr("x", 0)
    .attr("y", 14)
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
            datasets: [
              {
                ...saeData,

                backgroundColor: "rgba(255, 255, 255, 0.3)", // Change la couleur de fond
                borderColor: "white", // Change la couleur des lignes
                pointBackgroundColor: "white", // Change la couleur des points
                pointBorderColor: "white", // Change la couleur des bordures des points
                pointHoverBackgroundColor: "white", // Change la couleur des points au survol
                pointHoverBorderColor: "white", // Change la couleur des bordures des points au survol
                pointHoverRadius: 5, // Change le rayon des points au survol
                pointRadius: 2, // Change le rayon des points
                pointHitRadius: 5, // Change la distance de détection des points
                borderWidth: 3, // Change l'épaisseur des lignes
                // changer la couleur de la grille de fond
              }
            ],
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
  const g = svg.append("g")
    .attr("fill-opacity", 0.6)
    .selectAll("path")
    .data(root.descendants().filter(d => d.depth))
    .enter().append("path")
    .attr("fill", d => {
        while (d.depth > 1) d = d.parent;
        return d3.color(color(d.data.name)).toString(); // Utiliser toString() pour obtenir la couleur au format CSS
    })
    .attr("original-fill", d => {
        while (d.depth > 1) d = d.parent;
        return d3.color(color(d.data.name)).toString();
    })
    .attr("d", arc)
    .on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "#fff");
        highlightAncestors(d);
    })
    .on("mouseout", function(event, d) {
        const originalFill = d3.select(this).attr("original-fill");
        d3.select(this).attr("fill", originalFill);
        unhighlightAncestors(d);
    })
    .append("title")
    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

// Fonction pour mettre en évidence et désélectionner les ancêtres
function highlightAncestors(node) {
    node.ancestors().forEach(d => {
        d3.select(d3.selectAll("path").filter(p => p === d).node()).attr("fill-opacity", 1);
    });
}

function unhighlightAncestors(node) {
    node.ancestors().forEach(d => {
        d3.select(d3.selectAll("path").filter(p => p === d).node()).attr("fill-opacity", 0.6);
    });
}


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

  // Fonctions pour mettre en évidence et désélectionner les ancêtres
  function highlightAncestors(node) {
      node.ancestors().forEach(d => {
          d3.select(d3.selectAll("path").filter(p => p === d).node()).attr("fill-opacity", 1);
      });
  }

  function unhighlightAncestors(node) {
      node.ancestors().forEach(d => {
          d3.select(d3.selectAll("path").filter(p => p === d).node()).attr("fill-opacity", 0.6);
      });
  }

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
