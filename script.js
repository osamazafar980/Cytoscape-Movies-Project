elements = []
a=[]
m=[]
r=[]
cytoscape.use( cytoscapeCoseBilkent );
cytoscape.use( cytoscapeContextMenus );
var cy = cytoscape({
  container: document.getElementById('cy'),
  elements: [],
  style: [
    {
      selector: "node",
      style: {
        backgroundColor: "#F24C4C",
        "background-opacity":"0.7",
        "border-width": "1px",
        "border-color": "#F24C4C",
        "border-style": "solid",
        width: 70,
        height: 70,
        label: "data(label)",
  
        // "width": "mapData(score, 0, 0.006769776522008331, 20, 60)",
        // "height": "mapData(score, 0, 0.006769776522008331, 20, 60)",
        "text-valign": "center",
        "text-halign": "center",
        "overlay-padding": "6px",
        //text props
        color: "black",
        fontSize: 10,
        "text-wrap":"wrap",
        "text-max-width":"60px",
        "text-overflow-wrap":"whitespace"
      }
    },
    {
      selector: "node[type='Movie']",
      style: {
        shape: "rectangle",
        backgroundColor:"#EC9B3B",
        "border-width": "1px",
        "border-color": "#EC9B3B",
        "border-style": "solid",
        color: "white",
        fontSize: 10
      }
    },
    {
      selector: "node[type='Director']",
      style: {
        shape: "diamond",
        backgroundColor:"#1AC8ED",
        "border-width": "1px",
        "border-color": "#1AC8ED",
        "border-style": "solid",
        color: "black",
        fontSize: 10
      }
    },
    {
      selector: "node[type='Writer']",
      style: {
        shape: "hexagon",
        backgroundColor:"#6A4C93",
        "border-width": "1px",
        "border-color": "#6A4C93",
        "border-style": "solid",
        color: "white",
        fontSize: 10
      }
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#293462",
        "target-arrow-color": "#293462",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier"
      }
    },
    {
      selector: "edge[type='Director']",
      style: {
        width: 3,
        "line-color": "#8ac926",
        "target-arrow-color": "#8ac926",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier"
      }
    },
    {
      selector: "edge[type='Writer']",
      style: {
        width: 3,
        "line-color": "#7e5920",
        "target-arrow-color": "#7e5920",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier"
      }
    }],
  layout: {
    name: 'cose-bilkent'
  }     
}).on('cxttap', function(event) {
  
});


var contextMenu = cy.contextMenus({
  menuItems: [
    {
      id: 'expand',
      content: 'expand the subgraph of that node',
      tooltipText: 'expand subgraph',
      selector: 'node',
      onClickFunction: function (event) {
        var target = event.target || event.cyTarget;
        const driver = neo4j.driver('bolt://18.234.247.237:7687',
                    neo4j.auth.basic('neo4j', 'polices-moisture-tabulation'), 
                    {/* encrypted: 'ENCRYPTION_OFF' */});  
        const session = driver.session({database:"neo4j"});  

        if(target._private.data.type == 'Actor'){
          const params = {"pName": target._private.data.label};
          session.run("Match(actor:Person {name:$pName}) -[relation:ACTED_IN]-> (movies:Movie) return movies,relation", params)
          .then((result) => {
            arr = result.records
            result.records.forEach((row,idx,arr) => {
            const relation = row.get('relation')
            const movies = row.get('movies')
              var node="m"+movies.identity.toNumber().toString()
              if(!(m.includes(node))){
                cy.add({data:{id:node, label: movies.properties.title,properties:movies.properties,type:"Movie"}})
                m.push(node)
              }

              if(!(r.includes("r"+ relation.identity.toNumber().toString()))){
                cy.add({ data: { id: "r"+ relation.identity.toNumber().toString() ,  source: "a"+relation.start.toString(), target: "m"+relation.end.toString() } })
                r.push("r"+ relation.identity.toNumber().toString())
              }
              if(idx+1==arr.length){
                cy.layout({
                  name: 'cose-bilkent'
              }).run();
              }
            })
          })
          
        }else{
          const params = {"pName": target._private.data.label};
          session.run("Match(actor:Person) -[relation:ACTED_IN]-> (movies:Movie{title:$pName}) return actor,relation", params)
          .then((result) => {
            arr = result.records
            result.records.forEach((row,idx,arr) => {
            const relation = row.get('relation')
            const actor = row.get('actor')
              var node="a"+actor.identity.toNumber().toString()
              if(!(a.includes(node))){
                cy.add({data:{id:node, label: actor.properties.name,properties:actor.properties,type:"Actor"}})
                m.push(node)
              }

              if(!(r.includes("r"+ relation.identity.toNumber().toString()))){
                cy.add({ data: { id: "r"+ relation.identity.toNumber().toString() ,  source: "a"+relation.start.toString(), target: "m"+relation.end.toString() } })
                r.push("r"+ relation.identity.toNumber().toString())
              }
              if(idx+1==arr.length){
                cy.layout({
                  name: 'cose-bilkent'
              }).run();
              }
            })
            
          })
        }
        
      },
      hasTrailingDivider: true,
    },
    {
      id: 'director',
      content: 'add directors to graph',
      tooltipText: 'add directors',
      selector: "node[type='Movie']",
      onClickFunction: function (event) {
        var target = event.target || event.cyTarget;
        const driver = neo4j.driver('bolt://18.234.247.237:7687',
                    neo4j.auth.basic('neo4j', 'polices-moisture-tabulation'), 
                    {/* encrypted: 'ENCRYPTION_OFF' */});  
        const session = driver.session({database:"neo4j"});  

        if(target._private.data.type == 'Movie'){
          const params = {"pName": target._private.data.label};
          session.run("match(person:Person) -[relation:DIRECTED]-> (movies:Movie{title:$pName}) return person,relation", params)
          .then((result) => {
            arr = result.records
            if(arr.length==0){
              alert("Oops!! No Director Information Available")
            }else{
            result.records.forEach((row,idx,arr) => {
            const relation = row.get('relation')
            const actor = row.get('person')
              var node="d"+actor.identity.toNumber().toString()
              if(!(a.includes(node))){
                cy.add({data:{id:node, label: actor.properties.name,properties:actor.properties,type:"Director"}})
                a.push(node)
              }

              if(!(r.includes("r"+ relation.identity.toNumber().toString()))){
                cy.add({ data: { id: "r"+ relation.identity.toNumber().toString() ,  source: "d"+relation.start.toString(), target: "m"+relation.end.toString(), type:"Director" } })
                r.push("r"+ relation.identity.toNumber().toString())
              }
              
              if(idx+1==arr.length){
                cy.layout({
                  name: 'cose-bilkent'
              }).run();
              }
            })
          }
          })
        }
        
      },
      hasTrailingDivider: true,
      
    },
    {
      id: 'writer',
      content: 'add writers to graph',
      tooltipText: 'add writers',
      selector: "node[type='Movie']",
      onClickFunction: function (event) {
        var target = event.target || event.cyTarget;
        const driver = neo4j.driver('bolt://18.234.247.237:7687',
                    neo4j.auth.basic('neo4j', 'polices-moisture-tabulation'), 
                    {/* encrypted: 'ENCRYPTION_OFF' */});  
        const session = driver.session({database:"neo4j"});  

        if(target._private.data.type == 'Movie'){
          const params = {"pName": target._private.data.label};
          session.run("match(person:Person) -[relation:WROTE]-> (movies:Movie{title:$pName}) return person,relation", params)
          .then((result) => {
            arr = result.records
            if(arr.length==0){
              alert("Oops!! No Writer Information Available")
            }else{
            result.records.forEach((row,idx,arr) => {
            const relation = row.get('relation')
            const actor = row.get('person')
              var node="w"+actor.identity.toNumber().toString()
              if(!(a.includes(node))){
                cy.add({data:{id:node, label: actor.properties.name,properties:actor.properties,type:"Writer"}})
                a.push(node)
              }

              if(!(r.includes("r"+ relation.identity.toNumber().toString()))){
                cy.add({ data: { id: "r"+ relation.identity.toNumber().toString() ,  source: "w"+relation.start.toString(), target: "m"+relation.end.toString(), type:"Director" } })
                r.push("r"+ relation.identity.toNumber().toString())
              }
              
              if(idx+1==arr.length){
                cy.layout({
                  name: 'cose-bilkent'
              }).run();
              }
            })
          }
          })
        }
        
      },
      hasTrailingDivider: true,
      
    }
  ]
});

cy.on('click', 'node', function(evt){
  if(evt.target._private.data.type=="Actor"){
  info = "Name: "+evt.target._private.data.properties.name+"\n"+"Date Of Birth: "+evt.target._private.data.properties.born.toNumber()
  alert(info)
  }
  else if(evt.target._private.data.type=="Director"){
    info = "Name: "+evt.target._private.data.properties.name+"\n"+"Date Of Birth: "+evt.target._private.data.properties.born.toNumber()
    alert(info)
  }
  else if(evt.target._private.data.type=="Writer"){
    info = "Name: "+evt.target._private.data.properties.name+"\n"+"Date Of Birth: "+evt.target._private.data.properties.born.toNumber()
    alert(info)
  }
  else{
    console.log(evt.target._private.data.properties)
    info = "Title: "+evt.target._private.data.properties.title+"\n"+"Release Date: "+evt.target._private.data.properties.released.toNumber()+"\n"+"Tag Line: "+evt.target._private.data.properties.tagline
    alert(info)
  
  }
});

function  initialized(){
  
  const driver = neo4j.driver('bolt://18.234.247.237:7687',
                    neo4j.auth.basic('neo4j', 'polices-moisture-tabulation'), 
                    {/* encrypted: 'ENCRYPTION_OFF' */});  

  var name = prompt("Name")
  var num = prompt("Hops")
  var query =
    `
    match(actor:Person{name:$pName}) -[relation:ACTED_IN *0..`+parseInt(num)+`]- (data) return DISTINCT relation,data
    `;
  const params = {"pName": name};
  
  const session = driver.session({database:"neo4j"});
  
  session.run(query, params)
    .then((result) => {
      result.records.forEach((row) => {
        const data = row.get('data')
        const relation = row.get('relation')
        if(data.labels[0]=="Movie"){
          var node="m"+data.identity.toNumber().toString()
          if(!(m.includes(node))){
            elements.push({data:{id:node, label: data.properties.title,properties:data.properties,type:"Movie"}})
            m.push(node)
          }
        }
        else{
          var node = "a"+data.identity.toNumber().toString()
          if(!(a.includes(node))){
            elements.push({data:{id:node, label: data.properties.name,properties:data.properties,type:"Actor"}})
            a.push(node)
          }
        }
        for(var i=0;i<relation.length;i++){
          if(!(r.includes("r"+ relation[i].identity.toNumber().toString()))){
            elements.push({ data: { id: "r"+ relation[i].identity.toNumber().toString() ,  source: "a"+relation[i].start.toString(), target: "m"+relation[i].end.toString() } })
            r.push("r"+ relation[i].identity.toNumber().toString())
          }
        }
        
      });
      console.log(elements)
      elements.forEach((element)=>{
        cy.add(element)
      })
      cy.layout({
        name: 'grid'
    }).run()
      session.close();
      driver.close();
    })
    .catch((error) => {
      console.error(error);
    });
    
}

function cose_bilkent(){
  cy.layout({
    name: 'cose-bilkent'
}).run();
}

function cose(){
  cy.layout({
    name: 'cose'
}).run();
}
function random(){
  cy.layout({
    name: 'random'
}).run();
}
