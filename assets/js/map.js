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
    layerPPMV,
    lagosLGA,
    states,
    lga,
    drawnItems,
    drawControl,
    drawStyle,
    measureControl,
    layerSearch,
    mainSideBar,
    legend,
    markerCluster,
    layerHospital,
    searchControl, 
    sites
    

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

    // ######## data AJAX  Calls #########
    layerPPMV = L.geoJSON.ajax('data/PPMV.geojson', {
        'pointToLayer': dataMarker,
        onEachFeature: feat1
    })


     layerHospital = L.geoJSON.ajax('data/hospital.geojson', {
        'pointToLayer': dataMarker,
        onEachFeature: feat1
    })
    let hMarkerCluster = L.markerClusterGroup()
    layerHospital.on('data:loaded', () =>{    
        hMarkerCluster.addLayer(layerHospital)    
        
        
    })
    
    lagosLGA = L.geoJSON.ajax('data/lagos_LGA.geojson', {
        'pointToLayer': dataStyler,
        onEachFeature: popUpData
    })

    states = L.geoJSON.ajax('data/Nigeria_states.geojson', {
        'pointToLayer': dataStyler,
        onEachFeature: feat1,
        style: style
    })

    lga = L.geoJSON.ajax('data/Nigeria_LGAs.geojson', {
        'pointToLayer': dataStyler,
        style: styleOne
    })

    
    
    // When Data Has Successfully Loaded
    let ppmarkerCluster = L.markerClusterGroup()
    layerPPMV.on('data:loaded', () =>{    
        ppmarkerCluster.addLayer(layerPPMV)    
        overlaysArray.push(layerPPMV)
        
    })

    states.on('data:loaded', () =>{
        overlaysArray.push(states)
        // states.fitBounds(states.getBounds())
    })


    ////////// Autocomplete search
    


    /**STYLING FUNCTIONS**/
    function style(feature) {
        return {
            fillColor: '#2dce89', 
            fillOpacity: 0.5,  
            weight: 2,
            opacity: 1,
            color: '#ffffff',
            dashArray: '3'
        };
    }
    function style2(feature) {
        return {
            fillColor: 'orange', 
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
        // layer._leaflet_id = feature.properties.statename;

        let popupContent = "<p><b>STATE: </b>"+ feature.properties.statename +
            "</br>REGION: "+ feature.properties.statecode 
            
        layer.bindPopup(popupContent);

        layer.on("click", function (e) { 
            layer.setStyle(style2); //resets layer colors
            layer.setStyle(highlight);  //highlights selected.
        }); 
    }

    // // let stateLayer = L.geoJson(states, {onEachFeature: forEachFeature, style: style});
    // //     stateLayer.addTo(techMap)
    // $.getJSON(states, function(data) {
    //         states.addData(data);
        
    //         for (i = 0; i < data.features.length; i++) {  //loads State Name into an Array for searching
    //             arr1.push({label:data.features[i].properties.statename, value:""});
    //         }
    //     addDataToAutocomplete(arr1);  //passes array for sorting and to load search control.
    //     });

    // states.addTo(techMap);

	
	


    // ############### HEATMAP ######
    // Heat map deals with points will later create a point extractor function
        
    // Draw controller
    drawnItems = new L.FeatureGroup();
        techMap.addLayer(drawnItems);
    
        let drawned  = new L.FeatureGroup()
        let drawnedJSON = drawned.toGeoJSON()
        // console.log(drawnedJSON)
        drawned.addTo(techMap) 

    baseLayers = {
        "Open Street Map" : leyerOSM,
        "Base Topo Map" : baseTopo,
        "Carto DB" : baseCartoDB,
        " Water Color" : baseWaterColor
    }

    overlays  = {
        "Lagos PPMV": ppmarkerCluster,
        "Hospital" : hMarkerCluster,
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
     
    
    // searchControl = L.control.search({
    //     layer: layerPPMV, 
    //     initial: false,
    //     propertyName: 'name' // Specify which property is searched into.
    //   })
    //   .addTo(techMap,{position:"topright"});


    // get user location using the capital L key
    techMap.on('keypress', function(e){
        // console.log(e)
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
    let oldContainer =  measureControl.getContainer()
    let newMeasureToolCont = document.querySelector('#pills-contact');
    newMeasureToolCont.append(oldContainer);
    measureControl.addTo(techMap);

    
//     // ################## trying buffer
//     var theMarker;
//     var theCircle;
//     var geojsonLayer
//     sites = L.geoJson(null, {
			
//         pointToLayer: function(feature, latlng) {
//             return L.circleMarker(latlng, {
//             radius: 4, //expressed in pixels circle size
//             color: "red", 
//             stroke: true,
//             weight: 7,		//outline width  increased width to look like a filled circle.
//             fillOpcaity: 1
//             });
//             },
            
//         onEachFeature: function (feature, layer) {
        
//             layer.bindTooltip(feature.properties.Team);

//             layer.on('click', function (e) {
//                 lat = e.latlng.lat;
//                 lon = e.latlng.lng;
//             ProcessClick(lat,lon)	
//             });
//         }

//     });

//     $.getJSON(layerPPMV, function(data) {
//         sites.addData(data);
//     });
    
//     sites.addTo(techMap)

//     techMap.on('click',function(e){  
// 		lat = e.latlng.lat;
// 		lon = e.latlng.lng;
// 		ProcessClick(lat,lon)	
//   });

//   function ProcessClick(lat,lon){
// 	console.log("You clicked the map at LAT: "+ lat+" and LONG: "+lon );
// 		//Clear existing marker, circle, and selected points if selecting new points
// 		if (theCircle != undefined) {
// 		  techMap.removeLayer(theCircle);
// 		};
// 		if (theMarker != undefined) {
// 			  techMap.removeLayer(theMarker);
// 		};
// 		if (geojsonLayer != undefined) {
// 			  techMap.removeLayer(geojsonLayer);
// 		};
		
// 	//Add a marker to show where you clicked.
// 	 theMarker = L.marker([lat,lon]).addTo(techMap);  //Note: if lat/lon are strings then use parseFloat(lat), parseFloat(lon)
// 	SelectPoints(lat,lon)

//     }

//     var selPts = [];

// 	function SelectPoints(lat,lon){
// 		var dist = document.getElementById("miles").value;

// 		xy = [lat,lon];  //center point of circle
		
// 		var theRadius = parseInt(dist) * 1609.34  //1609.34 meters in a mile //dist is a string so it's convered to an Interger.
		
// 		selPts.length = 0;  //Reset the array if selecting new points
		
// 		sites.eachLayer(function (layer) {
// 			// Lat, long of current point as it loops through.
// 			layer_lat_long = layer.getLatLng();
			
// 			// Distance from our circle marker To current point in meters
// 			distance_from_centerPoint = layer_lat_long.distanceTo(xy);
			
// 			// See if meters is within radius, add the to array
// 			if (distance_from_centerPoint <= theRadius) {
// 				 selPts.push(layer.feature);  
// 			}
// 		});


//         theCircle = L.circle(xy, theRadius , {   /// Number is in Meters
//             color: 'orange',
//             fillOpacity: 0,
//             opacity: 1
//           }).addTo(techMap);

//           //Symbolize the Selected Points
// 			 geojsonLayer = L.geoJson(selPts, {
			 
// 				pointToLayer: function(feature, latlng) {
// 					return L.circleMarker(latlng, {
// 					radius: 4, //expressed in pixels circle size
// 					color: "green", 
// 					stroke: true,
// 					weight: 7,		//outline width  increased width to look like a filled circle.
// 					fillOpcaity: 1
// 					});
// 					}
// 			});
// 			//Add selected points back into map as green circles.
// 			techMap.addLayer(geojsonLayer);
			
// 			//Take array of features and make a GeoJSON feature collection 
// 			var GeoJS = { type: "FeatureCollection",  features: selPts   };
// 			//Show number of selected features.
// 			console.log(GeoJS.features.length +" Selected features");
// 			 // show selected GEOJSON data in console
// 			console.log(JSON.stringify(GeoJS)); 
// 	}	//end of SelectPoints function

























    
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
                                    <div class="card-text">
                                    
                                    </div>
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

    // mainSideBar = L.control({ position: "bottomright" });

    // mainSideBar.onAdd = function() {
    //   let div = L.DomUtil.create("div", "main-side-bar slide-left")
    // div.innerHTML += `<h4>Utilities</h4>`;
    // div.innerHTML += `<div class='anchor'>&lt</div>`    
    // div.innerHTML += `<div class="accordion" id="accordionExample">`
    // div.innerHTML += `<div class="card base-map ">
    //     <div class="card-header" id="headingOne">
    //     <h2 class="mb-0">
    //         <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
    //             Base Maps
    //         </button>
    //     </h2>
    //     </div>

    //     <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
    //     <div class="card-body map-thumb-wrapper">
    //             <div id="osm" class="map-thumb">
    //                 <img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/5/10/10" alt="open street map">
    //                 <div class="map-thumb-tag">OSM</div>
    //             </div>

    //             <div id="cartoDb" class="map-thumb">
    //                 <img src="https://b.basemaps.cartocdn.com/dark_nolabels/5/15/10@2x.png" alt=" carto db">
    //                 <div class="map-thumb-tag">Carto DB</div>
    //             </div>
                
    //             <div id="openTopo" class="map-thumb">
    //                 <img src="https://b.tile.opentopomap.org/5/15/10.png" alt="open topo">
    //                 <div class="map-thumb-tag">Open Topo</div>
    //             </div>

    //             <div id="waterpaint" class="map-thumb">
    //                 <img src="https://stamen-tiles-b.a.ssl.fastly.net/watercolor/5/15/10.jpg" alt="open topo">
    //                 <div class="map-thumb-tag">Open Topo</div>
    //             </div>

    //     </div>
    //     </div>
    //     </div>
        
    // </div>`  
    //     div.innerHTML += `<div class="card">
    //         <div class="card-header" id="headingTwo">
    //         <h2 class="mb-0">
    //             <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
    //                 Buffer Tool
    //             </button>
    //         </h2>
    //         </div>
    //         <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
    //         <div class="card-body">
    //             Buffer Area 
    //         </div>
    //         </div>
    //     </div>`

    //     div.innerHTML += `<div class="card">
    //         <div class="card-header" id="heading3">
    //         <h2 class="mb-0">
    //             <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapse3" aria-expanded="false" aria-controls="collapseTwo">
    //             Query Search
    //             </button>
    //         </h2>
    //         </div>
    //         <div id="collapse3" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
    //         <div class="card-body">
    //             Buffer Area 
    //         </div>
    //         </div>
    //     </div>`
    // div.innerHTML += `</div>`                         
    // div.innerHTML += `</div>`                     
                       

    //   return div;
    // };
    
    // mainSideBar.addTo(techMap)
    
    // Base Map activators
    document.getElementById('osm').addEventListener('click', () =>{
        L.tileLayer.provider('OpenStreetMap').addTo(techMap)
     })
     document.getElementById('cartoDb').addEventListener('click', () =>{
        L.tileLayer.provider('CartoDB.DarkMatter').addTo(techMap)
     })
     document.getElementById('openTopo').addEventListener('click', () =>{
        L.tileLayer.provider('OpenTopoMap').addTo(techMap)
     })
    //  document.getElementById('waterpaint').addEventListener('click', () =>{
    //     L.tileLayer.provider('Stamen.Watercolor').addTo(techMap)
    //  })
     

     

    // Control slide in n out of infoBars
    // const inforBarState = (el,togglClass) =>{
    //   let element = document.querySelector(`.${el}`)
    //   element.classList.toggle(`${togglClass}`)
    // }
    
    const anchor = document.querySelector('.anchor') //anchor button on legend bar    
    anchor.addEventListener('click', () => inforBarState('legend','trans-open'))

    // const sideBarAnchor = document.querySelector('.main-side-bar .anchor') //anchor button on utility side bar
    // sideBarAnchor.addEventListener('click', () => inforBarState('main-side-bar','slide-left'))
    
    
      
     
      techMap.on('click', function(e) {
        // let attr = json.properties
            console.log(e)
            // console.log(e.target)
            // return L.circleMarker(json.latlng).bindTooltip(`<b>LGA:${attr.lga}</b> <br> 
            // Address: ${attr.address} <br> 
            // Wardcode: <i class="text-success">${attr.wardcode}</i>`)
        });

        
       fillLayer()      
       
})

// ############# GLOBLA SCOPE -- OUTSIDE IFFE##############

// toggle Draw Controller
function toggleDraw(){
    drawControl._container.style.display = drawControl._container.style.display == 'none' ? 'flex' : 'none'
}

// TOGGLE SIDE BARS
const inforBarState = (el,togglClass) =>{
    let element = document.querySelector(`.${el}`)
    element.classList.toggle(`${togglClass}`)
  }

  const sideAnchor = document.querySelector('.sidebar-anchor') //anchor button on legend bar
    
  sideAnchor.addEventListener('click', () => inforBarState('map-sidebar', 'side-open'))



//  display data attributes and control data presentations
    function dataMarker(json, latlng){
        let attr = json.properties
        console.log(json)
        if(attr.type == 'PPMV'){
            return L.marker(latlng,{
                icon: iconPPMV,
            }).bindTooltip(`<b>Name:${attr.name}</b> <br> 
            Address: ${attr.address} <br> 
            `,{direction: 'top'}).bindPopup('about Edit me?')

        }else{
            return L.marker(latlng,{
                icon: iconHospital,
            }).bindTooltip(`<b>Name:${attr.name}</b> <br> 
            Address: ${attr.address} <br> 
            Wardcode: <i class="text-success">${attr.state}</i>`)
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
                <b>Name:${attr.name}</b> 
                    <br> 
                <i class="fas fa-home"></i> Address: ${attr.address} 
                <br> 
                Wardcode: <i class="text-primary"> ${attr.state}</i>
            </div>
        `,{direction: 'side'})
    }

    function popUpData(feature, ltlng){
        let feat = feature
        let att = feature.properties 
        let res = []
        if(att){
            res.push(att.name)
            // console.log('from popup data',res,feat)
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

    let bd = document.querySelector('.legend-content .card-body .card-text')
    // console.log('layer:',layer)
    
    layer.on('click', e =>{
        let coords = e.target.feature.geometry.coordinates
        let props = feature.properties
        document.querySelector('.legend').classList.remove('trans-open')
        // console.log(props)
        if(feature.geometry.type == "MultiPolygon"){
            let color  = document.createElement('input')
            color.type = 'color'
            console.log(layer)
                        
            bd.innerHTML = ""
            for(let key in props){
                
                let value = props[key]
                
                bd.innerHTML += `<div><b> ${key}</b>: ${value}</div>`
            }
            bd.innerHtml += `<hr>`
            bd.innerHTML += `<div><label>Fill color</label>:<input id="fillCol" type='color' value='${layer.options.fillColor}'></div>`
            bd.innerHTML += `<div><label>Fill opacicty</label>:<input id="fillOp" type='number' step='any' value='${layer.options.fillOpacity}'></div>`
            console.log(layer.options.fillColor)
            
            // addevent listeners for newly filled htmltags
            let fillColor = document.getElementById('fillCol'),
                fillOpacity = document.getElementById('fillOp'),
                strokeWidth = document.getElementById('strokeWit'),
                strokeColor = document.getElementById('strokeCol')
            fillColor.addEventListener('change', ()=> layer.options.fillColor = fillColor.value )

            fillOpacity.addEventListener('change', () =>{ 
                layer.options.fillOpacity = fillOpacity.value
                // techMap.remove(layer)
                // techMap.addLayer(layer._leaflet_id)
            })
            
        }else if(feature.geometry.type == "Point"){
            onMapClick(coords)            
            // console.log(feature.properties)
            
            bd.innerHTML = ""
            for(let key in props){
                
                let value = props[key]
                
                bd.innerHTML += `<div><b> ${key}</b>: ${value}</div>`
            }
            
        }else{
            document.querySelector('.legend-content').innerHTML = ` 
            <h2>Click a Layer to display properties</h2> 
            `
        }

    })
}






/*********HELPER FUNCs FOR INFO DIV************/

//fill container with a list of loaded layers
function fillLayer(){
    document.querySelector('#pills-profile').innerHTML = ''

    for(key of Object.keys(overlays)){
        let el = document.createElement('div')
        let checked = document.createElement('i')
        checked.classList.add('fas')
        // checked.classList.add('fa-check-square')
        el.innerText = key
        el.append(checked)
        el.classList.add('inactive')
        el.classList.add('layer')
        el.addEventListener('click', loadLayer)

        document.querySelector('#pills-profile').append(el)

    }
}
function loadLayer(e){
    // removeCheck()
   e.target.classList.contains('inactive') ? techMap.addLayer(overlays[e.target.innerText]) : techMap.removeLayer(overlays[e.target.innerText])
   e.target.classList.toggle('inactive')
   e.target.lastElementChild.classList.toggle('fa-check-square')
   e.target.lastElementChild.style.fontSize = '22px'
// console.log(e.target.lastElementChild)
}


const mapThumb = document.querySelectorAll('.map-thumb')

// TOGGLE ACTIVE CLASS FOR BASE MAPS
mapThumb.forEach( thum =>{
    
    thum.addEventListener('click', function(e){

    mapThumb.forEach(thum => thum.classList.remove('base-active'))
    thum.classList.toggle('base-active')
    
} )
    
})

// SIDE BAR crumbs BUTTONS
const sideBarBtns = document.querySelectorAll('.sidebar .nav-link')
const sideBarHeader = document.querySelector('.sidebar-header')
sideBarBtns.forEach( btn =>{
    // Set Header of Side Bar on CLick of BTNS
    btn.addEventListener('click', (e) => { sideBarHeader.innerText = btn.innerText } )
    
})

