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
    sites,
    poi
    

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
        'pointToLayer': points,
        onEachFeature: feat1
    })


     layerHospital = L.geoJSON.ajax('data/hospital.geojson', {
        'pointToLayer': newPoints,
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
    layerPPMV.on('data:loaded', (data) =>{    
        ppmarkerCluster.addLayer(layerPPMV)       
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


        let popupContent = "<p><b>STATE: </b>"+ feature.properties.statename +
            "</br>REGION: "+ feature.properties.statecode 
            
        layer.bindPopup(popupContent);

        layer.on("click", function (e) { 
            layer.setStyle(style2); //resets layer colors
            layer.setStyle(highlight);  //highlights selected.
        }); 
    }



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
        "Lagos PPMV": layerPPMV,
        "Hospital" : layerHospital,
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
     

    /**** SEARCH LAYERS ***/
    poi = L.layerGroup([overlays["Hospital"],overlays["Lagos PPMV"]])

    searchControl = L.control.search({
        layer: poi, 
        initial: false,
        marker: false,
        propertyName: 'name' ,
        hideMarkerOnCollapse: true,
        marker: {
			icon: new L.Icon({iconUrl:'./assets/carrental.png', iconSize: [20,20]}),
			circle: {
				radius: 20,
				color: '#f41642',
				opacity: 1
			}
		},
        moveToLocation: function(latlng, title, techMap) {
            // techMap.fitBounds( latlng.layer.getBounds() );
            // console.log(latlng, title, techMap)
			// var zoom = techMap.getBoundsZoom(latlng.layer.getBounds());
            techMap.flyTo(latlng, 11); // access the zoom
            
		}
      })
      
      searchControl.on('search:locationfound', function(e) {
		
        console.log(e)
        let marker = new L.Marker(new L.latLng(e.latlng))
        
        // states.eachLayer(function(layer) {	
		// 	// states.resetStyle(layer);
        // });
        
        // poi.addLayer(marker)
        
        // e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
		if(e.layer._popup)
			e.layer.openPopup();

	}).on('search:collapsed', function(e) {

		states.eachLayer(function(layer) {	//restore feature color
            states.resetStyle(layer);    
        });	
        
	});



      techMap.addControl(searchControl)


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

    options = {
        icon: 'clinic-medical',
        iconShape: 'marker'
    };
   const freshMark =  L.marker([48.13710, 11.57539], {
        icon: L.BeautifyIcon.icon(options),
        draggable: false
    }).addTo(techMap).bindPopup("popup").bindPopup("This is a BeautifyMarker");
    
    
    
      
     
      techMap.on('click', function(e) {
        // let attr = json.properties
            console.log(e)
            
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
    function dataMarker(json, latlng,options){
        options = {
            color: 'red'
        }
        let attr = json.properties
        // console.log(json)
        if(attr.type == 'PPMV'){
            return L.marker(latlng,{
                icon:myIcon ,
            }).bindTooltip(`<b>Name:${attr.name}</b> <br> 
            Address: ${attr.address} <br> 
            `,{direction: 'top'}).bindPopup(attr.name)

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
            html: "<div style='color:#fff' class='marker-pin-two'></div><i class='fas fa-capsules awesome fa-3x'>",
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        })

        let iconHospital = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#4838cc' class='marker-pin-one'></div><i style='color:#fff' class='fas fa-hospital awesome fa-3x'>",
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
    feature.layer = layer

    let bd = document.querySelector('.legend-content .card-body .card-text')
    // console.log('layer:',layer)
    
    layer.on('click', e =>{
        let coords = e.target.feature.geometry.coordinates
        let props = feature.properties
        document.querySelector('.legend').classList.remove('trans-open')
        // console.log(props)
        if(feature.geometry.type == "MultiPolygon"){
            color.type = 'color'
            console.log(layer)
                        
            bd.innerHTML = ""
            for(let key in props){
                
                let value = props[key]
                
                bd.innerHTML += `<div><b> ${key}</b>: ${value}</div>`
            }
            bd.innerHtml += `<hr>`
            bd.innerHTML += `<div><label>Fill color</label>:<input id="fillCol" type='color' value='${layer.options.fillColor}'></div>`
            bd.innerHTML += `<div><label>Fill opacicty</label>:<input id="fillOp" type='number' step='0.1' value='${layer.options.fillOpacity}'></div>`
            console.log(layer.options.fillColor)
            
            // addevent listeners for newly filled htmltags
            let fillColor = document.getElementById('fillCol'),
                fillOpacity = document.getElementById('fillOp'),
                strokeWidth = document.getElementById('strokeWit'),
                strokeColor = document.getElementById('strokeCol')
            fillColor.addEventListener('change', ()=> {
                
                layer.setStyle({
                    fillColor: fillColor.value
                })
            } )

            fillOpacity.addEventListener('change', () =>{
                let inc = fillOpacity.value
                // let dec  = inc/10
                // fillOpacity.value = dec
                // console.log(dec,inc) 
                layer.setStyle({
                    fillOpacity: fillOpacity.value
                }) 
                
            })
            
        }else if(feature.geometry.type == "Point"){
            onMapClick(coords)            
            // console.log(feature.properties)
            
            bd.innerHTML = ""
            for(let key in props){
                
                let value = props[key]
                
                bd.innerHTML += `<div><b> ${key}</b>: ${value}</div>`
            }
            bd.innerHTML += `
                <div class="custom-control custom-checkbox mr-sm-2">
                    <label for="marker"> Change marker</label>
                    <input id="marker" type="text" list="marker-list" value>
                    <datalist id="marker-list">
                        <!-- popluate list of icons -->
                        <option value="1">
                        <option value="2">
                    </datalist>        
                </div>
            `
            
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
        let edit = document.createElement('i')
        edit.classList.add('fas')
        edit.classList.add('fa-edit')
        edit.classList.add('edit')
        edit.style.fontSize = '18px'
        checked.classList.add('fas')
        checked.style.marginLeft = 'auto'
        // checked.classList.add('fa-check-square')
        el.innerText = key
        el.prepend(edit)
        edit.addEventListener('click', callModal)
        el.append(checked)
        el.classList.add('inactive')
        el.classList.add('layer')
        el.addEventListener('click', loadLayer)

        document.querySelector('#pills-profile').append(el)

    }
}
function loadLayer(e){
    // if a layer is not active, add the class active and also add to Map else do d opp
    // if(e.target !== 'div'){ return}
    // console.log(e)
   e.target.classList.contains('inactive') ? techMap.addLayer(overlays[e.target.innerText]) : techMap.removeLayer(overlays[e.target.innerText])
   e.target.classList.toggle('inactive')
   e.target.lastElementChild.classList.toggle('fa-check-square')
   e.target.lastElementChild.style.fontSize = '22px'
// console.log(e.target.lastElementChild)
}


function callModal(e){
    let call = document.querySelector("a[data-target] ")
    let modalTitle = document.querySelector('#customize .modal-title')
    let layerName = e.target.parentElement.innerText
    // modalTitle = `${modalTitle.innerText} ${e.target.parentElement.innerText}` 
    document.querySelector(" .map-sidebar").classList.add('side-open')

    // console.log(e.target.parentElement.innerText)
    call.click()  
    modalTitle.innerText = ''  
    modalTitle.innerText = `Edit layer - ${layerName}`
    // console.log(modalTitle)
    return layerName
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

// Layer Edit functions

const modalFormValues = ()=>{
    // let iconList = editLayerModalForm.iconList.value
    let fillColor = editLayerModalForm.fillColor.value
    let fillOpacity =  editLayerModalForm.fillOpacity.value
    console.log(fillColor, fillOpacity)
    return{
        fillColor: fillColor,
        fillOpacity: fillOpacity
    }

    // changePoints("Hospital", points )
} 


const editLayerModalForm = document.getElementById('editLayer')
// console.log(editLayerModalForm)

const saveCustomize = document.getElementById('saveCustomize')
saveCustomize.addEventListener('click', changePoints)



var myIcon = L.icon({
    iconUrl: './assets/carrental.png',
    iconSize: [30, 40],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    
});

var myIcon2 = L.icon({
    iconUrl: './assets/firstaid.png',
    iconSize: [30, 40],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    
});


function newPoints(json, latlng){
    let attr = json.properties
    options = {
        icon: 'leaf',
        iconShape: 'marker'
    };
   return L.marker(latlng, {
        icon: L.BeautifyIcon.icon(options),
        draggable: true
    }).bindTooltip(`<b>Name:${attr.name}</b> <br> 
    Address: ${attr.address} <br> 
    `,{direction: 'top'}).bindPopup(attr.name)
}

function points(json, latlng,options){
    // options = modalFormValues()
    let attr = json.properties
    // console.log(json)
   
    var options = {
        icon: 'clinic-medical',
        iconShape: 'circle',
        borderColor: '#b3334f',
        textColor: '#b3334f',
        //  iconSize: [40,40],
        // innerIconStyle: 'font-size:20px; margin:10px auto'
      };
      return L.marker(latlng, {
        icon: L.BeautifyIcon.icon(options),
        draggable: true
      })
      .bindTooltip(`<b>Name:${attr.name}</b> <br> 
        Address: ${attr.address} <br> 
        `,{direction: 'top'}).bindPopup(attr.name)

    
}
console.log(myIcon)
/* LINK THE SEARCH INPUT WITH LEAFLET SEARCH PLUGIN */
$('#autocomplete').on('keyup', function(e) {

    searchControl.searchText( e.target.value );

})

function changePoints(layer, pointFunc){
    techMap.removeLayer(overlays[`${layer}`])
    overlays[`${layer}`].options.pointToLayer = null
    overlays[`${layer}`].options.pointToLayer = pointFunc
    
    overlays[`${layer}`].refresh()


    techMap.addLayer(overlays[`${layer}`])
    
    console.log(overlays[`${layer}`])
}


