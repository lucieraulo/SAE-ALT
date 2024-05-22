async function afficherGraphique() {
  async function createHierarchy() {
      // Lire les données CSV
      let data = await d3.csv("data.csv");

      // Transformer les données en une structure de données hiérarchique
      let hierarchyData = data.map((d) => {
          return {
              name: d.nom_code,
              colname: "Level2",
              children: [
                  {
                      name: "Comprendre",
                      children: d.c1.split(";").map((c) => ({ name: c })),
                      value: d.c1.split(";").length,
                      colname: "Level3",
                  },
                  {
                      name: "Concevoir",
                      children: d.c2.split(";").map((c) => ({ name: c })),
                      value: d.c2.split(";").length,
                      colname: "Level3",
                  },
                  {
                      name: "Exprimer",
                      children: d.c3.split(";").map((c) => ({ name: c })),
                      value: d.c3.split(";").length,
                      colname: "Level3",
                  },
                  {
                      name: "Développer",
                      children: d.c4.split(";").map((c) => ({ name: c })),
                      value: d.c4.split(";").length,
                      colname: "Level3",
                  },
                  {
                      name: "Entreprendre",
                      children: d.c5.split(";").map((c) => ({ name: c })),
                      value: d.c5.split(";").length,
                      colname: "Level3",
                  },
              ],
          };
      });

      // Créer une hiérarchie à partir des données
      let root = d3.hierarchy({ children: hierarchyData }).sum((d) => d.value);

      return root;
  }

  const root = await createHierarchy();
  console.log(root);

  let firstThree = root.children
      .slice(0, 3)
      .map((node) => ({ name: node.data.name, value: node.value }));
  console.log(firstThree);

  let select = document.getElementById("sae-input-id");
  firstThree.forEach((item) => {
      let option = document.createElement("option");
      option.value = item.name;
      option.text = item.name;
      select.appendChild(option);
  });

  select.addEventListener("change", function () {
      let selectedName = this.options[this.selectedIndex].value;
      updateTreemap(selectedName);
  });

  // Définir les dimensions et les marges du graphique
  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
      width = 445 - margin.left - margin.right,
      height = 445 - margin.top - margin.bottom;

  // Ajouter l'objet svg au corps de la page
  var svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Fonction pour mettre à jour le treemap
  function updateTreemap(selectedName) {
      let selectedNode = root.children.find(d => d.data.name === selectedName);

      if (!selectedNode) {
          return;
      }

      // Effacer l'ancien graphique
      svg.selectAll("*").remove();

      // Créer le treemap pour le nœud sélectionné
      d3.treemap()
          .size([width, height])
          .padding(2)
          (selectedNode);

      // Utiliser ces informations pour ajouter des rectangles
      svg.selectAll("rect")
          .data(selectedNode.leaves())
          .enter()
          .append("rect")
          .attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr('width', function (d) { return d.x1 - d.x0; })
          .attr('height', function (d) { return d.y1 - d.y0; })
          .style("stroke", "black")
          .style("fill", "slateblue");

      // Ajouter les étiquettes de texte
      svg.selectAll("text")
          .data(selectedNode.leaves())
          .enter()
          .append("text")
          .attr("x", function (d) { return d.x0 + 5; })
          .attr("y", function (d) { return d.y0 + 20; })
          .text(function (d) { return d.data.name; })
          .attr("font-size", "15px")
          .attr("fill", "black");
  }

  // Initialiser le treemap avec la première option
  updateTreemap(firstThree[0].name);
}