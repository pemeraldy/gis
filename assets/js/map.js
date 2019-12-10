//*********GLOBAL VARAIBLES********* */
let techMap,
    leyerOSM,
    zoomInBtn,
    zoomOutBtn,
    easyBtn,
    measure,
    baseWaterColor,
    baseTopo,
    baseCartoDB,
    baseMapContoller,
    objBaseLayers,
    objOverlays,
    featureGRP,
    drawController,
    layerData,
    drawnItems,
    drawControl,
    drawStyle,
    measureControl,
    layerSearch

   $(document).ready(function(){
    //init setting
    techMap = L.map('mapid', {zoomControl:false}).setView([6.6088, 3.2545], 9);
    
    //######## adding markers to map at will for position purpose#######
    // techMap.on("click", function(e){
    //     new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(techMap);
    //  })

    //*********** BASE MAP OPTIONS ***********/
    leyerOSM = L.tileLayer.provider('OpenStreetMap')
    techMap.addLayer(leyerOSM)

    baseWaterColor = L.tileLayer.provider('Stamen.Watercolor')
    baseTopo = L.tileLayer.provider('OpenTopoMap')
    baseCartoDB = L.tileLayer.provider('CartoDB.DarkMatter')

    objBaseLayers = {
        "Open Street Map" : leyerOSM,
        "Base Topo Map" : baseTopo,
        "Carto DB" : baseCartoDB,
        // " Water Color" : baseWaterColor
    }


    baseMapContoller = L.control.layers(objBaseLayers, objOverlays).addTo(techMap)
    
    let drawned  = new L.FeatureGroup()
    drawned.addTo(techMap)  

    objOverlays  = {
        "Lagos Data": layerData,
        "nfnf" : drawned
    }

    
    // ######## AJAX data Call #########
    layerData = L.geoJSON.ajax('data/PPMV.geojson', {
        'pointToLayer': dataMarker
    }).addTo(techMap)
    
    
    layerData.on('data:loaded', () =>{
        techMap.fitBounds(layerData.getBounds())
    })
        
    easyBtn = L.easyButton('fa-globe', function(){
        console.log('hey')
     }).addTo(techMap)

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
    measure = L.control.polylineMeasure().addTo(techMap);
    
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
    drawnItems = new L.FeatureGroup();
        techMap.addLayer(drawnItems);

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
                console.log(layer._mRadius, e, layer)                
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
    });

    drawStyle = L.control.styleEditor().addTo(techMap)

    // Measure area and line
    measureControl = new L.Control.Measure({position: 'topright', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters'});
    measureControl.addTo(techMap);

    // File layer uploader
    var layer = omnivore.gpx('data/laboratory.geojson')
    .on('ready', function() {
        // when this is fired, the layer
        // is done being initialized
    })
    .on('error', function() {
        // fired if the layer can't be loaded over AJAX
        // or can't be parsed
    })
    .addTo(techMap);

    // Search function
            	    
        function returnResById(id){
            let searchedLayer = layerData.getLayers()
            for(i = 0 ;searchedLayer.length -1 ; i++){
                console.log(searchedLayer[i])
                // let featureID = searchedLayer[i].features.properties.Property
                // if(featureID == id){
                //     return searchedLayer[i]
                // }
            }
            return false
        }
        
        $('#search').click((e) =>{
            e.preventDefault()
            let id = $('#searchedValue').val()
            let lyr = returnResById(id)
            if(lyr) {
                if(layerSearch){
                    layerSearch.remove()                   
                }
                layerSearch = L.geoJSON(lyr.toGeoJson(), {style: {color: 'red', weight:10,opacity: 0.5}}).addTo(techMap)
                techMap.fitBounds(lyr.getBounds().pad(1))
            }else{
                console.log('found not')
            }
        })
    
    

    

})




// ###########################
//    outside ready function

//    display data attributes
   function dataMarker(json, latlng){
        let attr = json.properties
        console.log(attr)
        return L.circleMarker(latlng).bindTooltip(`<b>LGA:${attr.lga}</b> <br> 
        Address: ${attr.address} <br> 
        Wardcode: <i class="text-success">${attr.wardcode}</i>`)
    }
