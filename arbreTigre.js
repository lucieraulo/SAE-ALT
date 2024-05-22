async function afficherGraphique(){

  async function createHierarchy() {
      // Lire les données CSV
      let data = await d3.csv('data.csv');

      // Transformer les données en une structure de données hiérarchique
      let hierarchyData = data.map(d => {
          return {
              name: d.nom_code,
              children: [
                  {
                      name: 'Comprendre',
                      children: d.c1.split(';').map(c => ({ name: c }))
                  },
                  {
                      name: 'Concevoir',
                      children: d.c2.split(';').map(c => ({ name: c }))
                  },
                  {
                      name: 'Exprimer',
                      children: d.c3.split(';').map(c => ({ name: c }))
                  },
                  {
                      name: 'Développer',
                      children: d.c4.split(';').map(c => ({ name: c }))
                  },
                  {
                      name: 'Entreprendre',
                      children: d.c5.split(';').map(c => ({ name: c }))
                  }
              ]
          };
      });

      // Créer une hiérarchie à partir des données
      let root = d3.hierarchy({ children: hierarchyData })
          .sum(d => d.value);

      return root;
  }

  const root = await createHierarchy();

    console.log(root);

    const width = 928;

  // Compute the tree height; this approach will allow the height of the
  // SVG to scale according to the breadth (width) of the tree layout.
  const dx = 10;
  const dy = width / (root.height + 1);

  // Create a tree layout.
  const tree = d3.tree().nodeSize([dx, dy]);

  // Sort the tree and apply the layout.
  root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
  tree(root);

  // Compute the extent of the tree. Note that x and y are swapped here
  // because in the tree layout, x is the breadth, but when displayed, the
  // tree extends right rather than down.
  let x0 = Infinity;
  let x1 = -x0;
  root.each(d => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
  });

  // Compute the adjusted height of the tree.
  const height = x1 - x0 + dx * 2;

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-dy / 3, x0 - dx, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1)
    .selectAll()
      .data(root.links())
      .join("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));
  
  const node = svg.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
    .selectAll()
    .data(root.descendants())
    .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle")
      .attr("fill", d => d.children ? "bleu" : "bleu")
      .attr("r", 2.5);

  node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -6 : 6)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .attr("stroke", "white")
      .attr("paint-order", "stroke");

    const canva = document.getElementById("arbreD3JS");
  //Afficher le svg dans le canva
    canva.appendChild(svg.node());
  
  return svg.node();

}

