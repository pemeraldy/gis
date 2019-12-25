//*********GLOBAL VARAIBLES********* */
let techMap,
    leyerOSM,
    zoomInBtn,
    zoomOutBtn,    
    measure,
    baseWaterColor,
    baseTopo,
    baseCartoDB,
    baseMapContoller,
    baseLayers,
    overlays,
    overlaysArray,
    featureGRP,
    drawController,
    layerData,
    drawnItems,
    drawControl,
    drawStyle,
    measureControl,
    layerSearch,
    mainSideBar,
    legend,
    layerMarkerCluster

   $(document).ready(function(){
    //init setting
    techMap = L.map('mapid', {
        zoomControl:false
    }).setView([6.465422, 3.406448], 5);
    
    // Scale display at bottom left
    L.control.scale().addTo(techMap)
    // drawStyle = L.control.styleEditor().addTo(techMap)
    //*********** BASE MAP OPTIONS ***********/
    leyerOSM = L.tileLayer.provider('OpenStreetMap')
    techMap.addLayer(leyerOSM)

    baseWaterColor = L.tileLayer.provider('Stamen.Watercolor')
    baseTopo = L.tileLayer.provider('OpenTopoMap')
    baseCartoDB = L.tileLayer.provider('CartoDB.DarkMatter')

    overlaysArray = []
    // ######## AJAX data Calls #########
    layerData = L.geoJSON.ajax('data/PPMV.geojson', {
        'pointToLayer': dataMarker,
        onEachFeature: feat1
    })

    // techMap.on('click', (e) => console.log(e.target))

    let layerData2 = L.geoJSON.ajax('data/hospital.geojson', {
        'pointToLayer': dataMarker,
        onEachFeature: popUpData
    })
    
    let lagosLGA = L.geoJSON.ajax('data/lagos_LGA.geojson', {
        'pointToLayer': dataStyler,
        onEachFeature: popUpData
    })

    let states = L.geoJSON.ajax('data/Nigeria_states.geojson', {
        'pointToLayer': dataStyler,
        onEachFeature: feat1,
        style: style
    })

    let lga = L.geoJSON.ajax('data/Nigeria_LGAs.geojson', {
        'pointToLayer': dataStyler,
        style: styleOne
    })

    
    
    // When Data Has Successfully Loaded
    layerData.on('data:loaded', () =>{        
        overlaysArray.push(layerData)
        
    })
    states.on('data:loaded', () =>{
        overlaysArray.push(states)
        states.fitBounds(states.getBounds())
    })


    ////////// Autocomplete search
    let url = states,
    arr =[],arr1 = []
    $('#autocomplete').autocomplete()

    function style(feature) {
        return {
            fillColor: 'green', 
            fillOpacity: 0.5,  
            weight: 2,
            opacity: 1,
            color: '#ffffff',
            dashArray: '3'
        };
    }

    let highlight = {
        'fillColor': 'yellow',
        'weight': 2,
        'opacity': 1
    };


    function forEachFeature(feature, layer) {
        // Tagging each state poly with their name for the search control.
        layer._leaflet_id = feature.properties.statename;

        let popupContent = "<p><b>STATE: </b>"+ feature.properties.statename +
            "</br>REGION: "+ feature.properties.statecode 
            
        layer.bindPopup(popupContent);

        layer.on("click", function (e) { 
            stateLayer.setStyle(style); //resets layer colors
            layer.setStyle(highlight);  //highlights selected.
        }); 
    }

    let stateLayer = L.geoJson(null, {onEachFeature: forEachFeature, style: style});

    $.getJSON(null, function(data) {
            stateLayer.addData(data);
        
            for (i = 0; i < data.features.length; i++) {  //loads State Name into an Array for searching
                arr1.push({label:data.features[i].properties.statename, value:""});
            }
        addDataToAutocomplete(arr1);  //passes array for sorting and to load search control.
        });

    stateLayer.addTo(techMap);

	
	


    // ############### HEATMAP ######
    // Heat map deals with points will later create a point extractor function
        
    // Draw controller
    drawnItems = new L.FeatureGroup();
        techMap.addLayer(drawnItems);
    
        let drawned  = new L.FeatureGroup()
        let drawnedJSON = drawned.toGeoJSON()
        console.log(drawnedJSON)
        drawned.addTo(techMap) 

    baseLayers = {
        "Open Street Map" : leyerOSM,
        "Base Topo Map" : baseTopo,
        "Carto DB" : baseCartoDB,
        " Water Color" : baseWaterColor
    }

    overlays  = {
        "Lagos Data": layerData,
        "Lagos Data2" : layerData2,
        "live drawn": drawnItems,
        // "heat map": heat,
        "Lagos LGA": lagosLGA,
        "States": states,
        "Local Govt.": lga
    }

    baseMapContoller = L.control.layers(baseLayers, overlays,{
        collapse: false,
        expand: true
    })
     
        

    // get user location using the capital L key
    techMap.on('keypress', function(e){
        console.log(e)
        if(e.originalEvent.key === 'L'){
            techMap.locate()
        }
    })

    techMap.on('locationfound', function(e){
        L.circleMarker(e.latlng).addTo(techMap)
        techMap.setView(e.latlng, 14)
    })

    techMap.on('locationerror', function(){
        console.log('location not found')
    })
 
    
    // zoomIN and Zoom Out btn functions
    zoomInBtn = document.getElementById('zoom-in')
    zoomInOut = document.getElementById('zoom-out')
    
    zoomInBtn.addEventListener('click', () =>{
        techMap.zoomIn()
    })

    zoomInOut.addEventListener('click', () =>{
        techMap.zoomOut()
    })

    // create draw control
    drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                shapeOptions: {
                    color: 'purple'
                },
                showArea: true,
                metric: false,
                allowIntersection: false,
                repeatMode: true,
                draggable: true
            },
        },
        edit: {
            featureGroup: drawnItems
        },

    }); 

    //Add draw control to map
    techMap.addControl(drawControl);

    techMap.on('draw:created', function (e) {
        let type = e.layerType,
            layer = e.layer
        
            if (type === 'circle') {
                layer.bindTooltip('<b>Radius: </b>'+ (layer._mRadius/1000).toFixed(3)+' km');
                console.log(e, layer.toGeoJSON())                
            }
            if (type === 'rectangle') {
                layer.bindTooltip('width: '+e.sourceTarget._size.x +'km <br/> Height '+e.sourceTarget._size.y+'km');
                console.log( e, layer, e.sourceTarget._size)                
            }
            if (type === 'polygon') {
                layer.bindTooltip('');
                console.log( layer)                
            }
        drawnItems.addLayer(layer);
        let newGeo = layer.toGeoJSON()
        // console.log(newGeo)
        
        // sendDraw()
    });


    // drawStyle = L.control.styleEditor().addTo(techMap)

    // Measure area and line
    measureControl = new L.Control.Measure({position: 'topleft', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters'});
    measureControl.addTo(techMap);
    // Measure control button
    measure = L.control.polylineMeasure().addTo(techMap);

    
    // ######### Feature INfo Bar ###########

    /*Legend specific*/
  legend = L.control({ position: "bottomleft" });

    legend.onAdd = function(featPoint) {
      let div = L.DomUtil.create("div", "legend trans-open");
     if(featPoint == undefined){
        return false
    }else {
      div.innerHTML += `<h2>Feature Info</h2>`;
      div.innerHTML += `<div class='anchor'><i class="fas fa-chevron-right"></i></div>`;
      div.innerHTML += `<div class="legend-content">
                            <div class="card" style="width: 18rem;">
                                
                                <div class="card-body">
                                    <h2 class="card-title" id="feat-name">Click a layer/point to view properties</h2>                                                                   
                                </div>
                            </div>
                           
                        </div>`

      return div;
        }
    };
    
    legend.addTo(techMap);


    // ******DYNAMICALLY ADD LAYER *************
    // $('#collapseOne').click(function addNewLayer() {
    //     //create new layer
    //     let imageOverlayNew = new L.imageOverlay(imageOverlayUrlNew, bounds);
    //     //add it to a control
    //     layerControl.addOverlay(imageOverlayNew, newLayerName);
    // });

    // ********UTILITY SIDEBAR******

    mainSideBar = L.control({ position: "bottomright" });

    mainSideBar.onAdd = function() {
      let div = L.DomUtil.create("div", "main-side-bar slide-left");
    div.innerHTML += `<h4>Utilities</h4>`;
    div.innerHTML += `<div class='anchor'>&lt</div>`;
    // div.innerHTML += `<div class="query-continer">
    //                         <a id="do" class="btn btn-primary" href="#"> Remove layer</a>
    //                     </div>`;
    // div.innerHTML += `<div class="query-continer">
    //         <a id="remove" class="btn btn-primary" href="#"> add Layer</a>
    //     </div>`;

    div.innerHTML += `<div class="accordion" id="accordionExample">`
    div.innerHTML += `<div class="card base-map ">
        <div class="card-header" id="headingOne">
        <h2 class="mb-0">
            <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                Base Maps
            </button>
        </h2>
        </div>

        <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
        <div class="card-body map-thumb-wrapper">
                <div id="osm" class="map-thumb">
                    <img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/5/10/10" alt="open street map">
                    <div class="map-thumb-tag">OSM</div>
                </div>

                <div id="cartoDb" class="map-thumb">
                    <img src="https://b.basemaps.cartocdn.com/dark_nolabels/5/15/10@2x.png" alt=" carto db">
                    <div class="map-thumb-tag">Carto DB</div>
                </div>
                
                <div id="openTopo" class="map-thumb">
                    <img src="https://b.tile.opentopomap.org/5/15/10.png" alt="open topo">
                    <div class="map-thumb-tag">Open Topo</div>
                </div>

                <div id="waterpaint" class="map-thumb">
                    <img src="https://stamen-tiles-b.a.ssl.fastly.net/watercolor/5/15/10.jpg" alt="open topo">
                    <div class="map-thumb-tag">Open Topo</div>
                </div>

        </div>
        </div>
        </div>
        
    </div>`  
        div.innerHTML += `<div class="card">
            <div class="card-header" id="headingTwo">
            <h2 class="mb-0">
                <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                    Buffer Tool
                </button>
            </h2>
            </div>
            <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
            <div class="card-body">
                Buffer Area 
            </div>
            </div>
        </div>`

        div.innerHTML += `<div class="card">
            <div class="card-header" id="heading3">
            <h2 class="mb-0">
                <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapse3" aria-expanded="false" aria-controls="collapseTwo">
                Query Search
                </button>
            </h2>
            </div>
            <div id="collapse3" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
            <div class="card-body">
                Buffer Area 
            </div>
            </div>
        </div>`
    div.innerHTML += `</div>`                         
    div.innerHTML += `</div>`         //end div for query side bar                
                       

      return div;
    };
    
    mainSideBar.addTo(techMap); //Add created side bar to map
    
    document.getElementById('osm').addEventListener('click', () =>{
        L.tileLayer.provider('OpenStreetMap').addTo(techMap)
     })
     document.getElementById('cartoDb').addEventListener('click', () =>{
        L.tileLayer.provider('CartoDB.DarkMatter').addTo(techMap)
     })
     document.getElementById('openTopo').addEventListener('click', () =>{
        L.tileLayer.provider('OpenTopoMap').addTo(techMap)
     })
     document.getElementById('waterpaint').addEventListener('click', () =>{
        L.tileLayer.provider('Stamen.Watercolor').addTo(techMap)
     })
     

     

    // Control slide in n out of infoBars
    const inforBarState = (el,togglClass) =>{
      let element = document.querySelector(`.${el}`)
      element.classList.toggle(`${togglClass}`)
    }
    
    const anchor = document.querySelector('.anchor') //anchor button on legend bar    
    anchor.addEventListener('click', () => inforBarState('legend','trans-open'))

    const sideBarAnchor = document.querySelector('.main-side-bar .anchor') //anchor button on utility side bar bar
    sideBarAnchor.addEventListener('click', () => {
        inforBarState('main-side-bar','slide-left')
        console.log('heu')
    })
    
      
     
      techMap.on('click', function(e) {
        // let attr = json.properties
            console.log(e)
            // console.log(e.target)
            // return L.circleMarker(json.latlng).bindTooltip(`<b>LGA:${attr.lga}</b> <br> 
            // Address: ${attr.address} <br> 
            // Wardcode: <i class="text-success">${attr.wardcode}</i>`)
        });

        
             
       
})

// ############# GLOBLA SCOPE -- OUTSIDE IFFE##############

// toggle Draw Controller
function toggleDraw(){
    drawControl._container.style.display =  
    drawControl._container.style.display == 'none' ? 'flex' : 'none'
}

//  display data attributes and control data presentations
    function dataMarker(json, latlng){
        let attr = json.properties
        // console.log(attr)
        if(attr.type == 'PPMV'){
            return L.marker(latlng,{
                icon: iconPPMV,
            }).bindTooltip(`<b>LGA:${attr.lga}</b> <br> 
            Address: ${attr.address} <br> 
            Wardcode: <i class="text-success">${attr.wardcode}</i>`,{direction: 'top'})
        }else{
            return L.marker(latlng,{
                icon: iconHospital,
            }).bindTooltip(`<b>LGA:${attr.lga}</b> <br> 
            Address: ${attr.address} <br> 
            Wardcode: <i class="text-success">${attr.wardcode}</i>`)
        }
        
    }

    function highlightFeature(e) {
        let layer = e.target;
    
        layer.setStyle({
            weight: 2,
            color: 'yellow',
            dashArray: '',
            fillOpacity: 0.4
        });
    
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }


    function stateAttribute(feat, layer){
        layer.on({
            // mouseover: highlightFeature,
            // mouseout: resetHighlight,
            // click: zoomToFeature
        }).bindTooltip(`<div class="card"> ${feat.properties.statename}</div>`)
    }

    function dataStyler(json, latlng){
        let attr = json.properties
        // console.log(attr)
        return L.marker(latlng).bindTooltip(`
            <div class="t-tooltip">
                <b>LGA:${attr.lga}</b> 
                    <br> 
                <i class="fas fa-home"></i> Address: ${attr.address} 
                <br> 
                Wardcode: <i class="text-primary"> ${attr.wardcode}</i>
            </div>
        `,{direction: 'top'})
    }

    function popUpData(feature, ltlng){
        let feat = feature
        let att = feature.properties 
        let res = []
        if(att){
            res.push(att.name)
            console.log('from popup data',res,feat)
        }
    }
    let styleOne = {
        "color": "purple",
        "weight": 1,
        "opacity": 0.65
    }

    // ************ASIGN CUSTOM MARKERS*************
   let iconPPMV = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='color:#fff;' class='marker-pin-two'></div><i class='fas fa-capsules awesome fa-3x'>",
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        })

        let iconHospital = L.divIcon({
            className: 'custom-div-icon',
            html: "<div background-color:#4838cc;' class='marker-pin-one'></div><i class='fas fa-hospital awesome fa-3x'>",
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });

        let iconLaboratory = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='color:#fff;' class='marker-pin-one'></div><i class='fas fa-flask awesome fa-3x'>",
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });



        /*********CUSTOM FUNCTONS**********/

        // click marker
  let clickmark;

  // When you click on a circle, it calls the onMapClick function and passes the layers coordinates.
  // I grab the coords which are X,Y, and I need to flip them to latLng for a marker,  
  function onMapClick(coords) {
		console.log(coords);
		let thecoords = coords.toString().split(',');
		let lat = thecoords[1];
        let lng = thecoords[0];
        console.log('click mark',clickmark)
		//if prior marker exists, remove it.
		if (clickmark != undefined) {
		  techMap.removeLayer(clickmark);
		};
  
		 clickmark = L.circleMarker([lat,lng],{
			radius: 8,
			//opacity: 1,
			color: "yellow",
			fillColor:  "yellow",
			fillOpacity: 0.8}
		 ).addTo(techMap);
	}
// end of code for click marker.

function feat1 (feature, layer) {

    layer.on('click', e =>{
        let coords = e.target.feature.geometry.coordinates
        document.querySelector('.legend').classList.remove('trans-open')
        
        if(feature.geometry.type == "MultiPolygon"){
            console.log(feature)
            
            document.querySelector('.legend-content').innerHTML = `
            <div class="card" style="width: 18rem;">
            <img id="feat-img" class="card-img-top" src="" alt="image of state">
            <div class="card-body">
                <h2 class="card-title" id="feat-name">${feature.properties.statename}</h2>
                <div class="card-text">
                    <p class="text-info">State:<b id="feat-add">${feature.properties.statename}</b></p>
                    <button class="btn btn-info disabled btn-sm">Capital</button>:<b id="feat-num">${feature.properties.capcity}</b> <br><br>
                    <button class="btn btn-info disabled btn-sm">Geozone</button>:<b id="feat-lga">${feature.properties.geozone}</b> <br><br>
                    <span class="badge badge-info">State code:${feature.properties.statecode}</span><br>
                </div>                                    
            </div>
        </div>

            `
            
        }else if(feature.geometry.type == "Point"){
            onMapClick(coords)            
            document.querySelector('.legend-content').innerHTML = `
                <div class="card" style="width: 18rem;">
                <img class="card-img-top" src="${feature.properties.photo}" alt="feature image">
                <div class="card-body">
                    <h3 class="card-title">${feature.properties.name}</h3>
                    <p class="card-text">
                        <div class="">Address: ${feature.properties.address}</div> 
                        <div class="">Number: ${feature.properties.phone_number} </div>
                        <div class="">LGA: ${feature.properties.lga} </div>
                        <div class="">State: ${feature.properties.state}</div> 
                        <span class="badge badge-default">${feature.properties.address}</span>
                    </p>
                    <a href="#" class="btn btn-success btn-sm">More...</a>
                </div>
            </div>
            
            `
        }else{
            document.querySelector('.legend-content').innerHTML = ` <h2>Click a Layer to display properties</h2> `
        }

    })
}

/*********HELPER FUNCs FOR INFO DIV************/
// const pointsInfo = (featPoint) =>{
    
//     let div = L.DomUtil.create("div", "points-info")
//     div.innerHTML += `
        // <div class="card" style="width: 18rem;">
        //     <img class="card-img-top" src="https://picsum.photos/seed/picsum/300/300" alt="Card image cap">
        //     <div class="card-body">
        //         <h5 class="card-title">${featPoint.properties.name}</h5>
        //         <p class="card-text">
        //             <button class="btn btn-info disabled btn-sm">Address</button>: ${featPoint.properties.address} <br>
        //             <button class="btn btn-info disabled btn-sm">Number</button>: ${featPoint.properties.phone_number} <br>
        //             <button class="btn btn-info disabled btn-sm">LGA</button>: ${featPoint.properties.lga} <br>
        //             <button class="btn btn-info disabled btn-sm">State</button>: ${featPoint.properties.state} <br>
        //             <span class="badge badge-default">${featPoint.properties.address}</span>
        //         </p>
        //         <a href="#" class="btn btn-primary">A link</a>
        //     </div>
        // </div>
//     `
//     return div
// }

// pointsInfo.addTo(techMap)
// function pointsInfoAdder(){
//     pointsInfo.addTo(techMap)
// }

// CUSTOM BASE MAP CONTROL
//  document.getElementById('osm').addEventListener('click', () =>{
//     L.tileLayer.provider('CartoDB.DarkMatter').addTo(techMap)
//  })
