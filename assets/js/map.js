//*********GLOBAL VARAIBLES********* */
var techMap,
    leyerOSM,
    righNavMain,
    zoomInBtn,
    zoomOutBtn,
    baseWaterColor,
    baseTopo,
    baseCartoDB,
    baseMapContoller,
    ObjBaseLayers,
    ObjOverlays,
    featureGRP,
    drawController,
    layerData

   $(document).ready(function(){
    //init setting
    techMap = L.map('mapid', {zoomControl:false}).setView([6.6088, 3.2545], 9);

    //*********** BASE MAP OPTIONS ***********/
    leyerOSM = L.tileLayer.provider('OpenStreetMap')
    techMap.addLayer(leyerOSM)

    baseWaterColor = L.tileLayer.provider('Stamen.Watercolor')
    baseTopo = L.tileLayer.provider('OpenTopoMap')
    baseCartoDB = L.tileLayer.provider('CartoDB.DarkMatter')

    ObjOverlays = {
        "Open Street Map" : leyerOSM,
        "<b>Base Topo Map </b>" : baseTopo,
        "Carto DB" : baseCartoDB,
        " Water Color" : baseWaterColor
    }
    baseMapContoller = L.control.layers(ObjBaseLayers, ObjOverlays).addTo(techMap)

    layerData = L.geoJSON.ajax('data/hospital.geojson', {
        'pointTolayer': dataMarker
    }).addTo(techMap)

    

    layerData.on('data:loaded', () =>{
        techMap.fitBounds(layerData.getBounds())
    })
    // get user location using the capital L key
    techMap.on('keypress', function(e){
        console.log(e)
        if(e.originalEvent.key == 'L'){
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
 
    // Measure control button
    var measure = L.control.polylineMeasure().addTo(techMap);
    
    // zoomIN and Zoom Out btn functions
    zoomInBtn = document.getElementById('zoom-in')
    zoomInOut = document.getElementById('zoom-out')
    
    zoomInBtn.addEventListener('click', () =>{
        techMap.zoomIn()
    })

    zoomInOut.addEventListener('click', () =>{
        techMap.zoomOut()
    })

  
    // Draw controller
    drawController = new L.Control.Draw({

    })
    drawController.addTo(techMap)
    techMap.on('draw:created', (w) =>{
        console.log(w)
    })
   })

   function dataMarker(json, latlng){
        let attr = json.properties
        console.log(attr)
        return L.circleMarker(latlng, {radius:10, color:'blue'}).bindTooltip(`<b>${attr.properties}</b>`)
    }
