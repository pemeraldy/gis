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
    baseLayers,
    overlays,
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
    techMap = L.map('mapid', {
        zoomControl:false
    }).setView([6.6088, 3.2545], 9);
    
    // Scale display at bottom left
    L.control.scale().addTo(techMap)
    //*********** BASE MAP OPTIONS ***********/
    leyerOSM = L.tileLayer.provider('OpenStreetMap')
    techMap.addLayer(leyerOSM)

    baseWaterColor = L.tileLayer.provider('Stamen.Watercolor')
    baseTopo = L.tileLayer.provider('OpenTopoMap')
    baseCartoDB = L.tileLayer.provider('CartoDB.DarkMatter')

    // ######## AJAX data Calls #########
    layerData = L.geoJSON.ajax('data/PPMV.geojson', {
        'pointToLayer': dataMarker
    }).addTo(techMap)

    let layerData2 = L.geoJSON.ajax('data/hospital.geojson', {
        'pointToLayer': dataStyler
    }).addTo(techMap)
    
    
    layerData.on('data:loaded', () =>{
        techMap.fitBounds(layerData.getBounds())
    })

    // Draw controller
    drawnItems = new L.FeatureGroup();
        techMap.addLayer(drawnItems);
    
        let drawned  = new L.FeatureGroup()
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
        "live drawn": drawnItems
    }

    baseMapContoller = L.control.layers(baseLayers, overlays).addTo(techMap)
     
        
    // Easy Button
    easyBtn = L.easyButton('fa-globe', function(){
        console.log('hey')
     }).addTo(techMap)

     
    

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

    // drawStyle = L.control.styleEditor().addTo(techMap)

    // Measure area and line
    measureControl = new L.Control.Measure({position: 'topright', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters'});
    measureControl.addTo(techMap);
    // Measure control button
    measure = L.control.polylineMeasure().addTo(techMap);

    
    // #########LEGEND TEMPLATES ###########

    /*Legend specific*/
    var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "legend trans-open");
      div.innerHTML += "<h4>Legend</h4>";
      div.innerHTML += "<div class='anchor'>&gt</div>";
      div.innerHTML += '<i style="background: #477AC2"></i><span>Water</span><br>';
      div.innerHTML += '<i style="background: #448D40"></i><span>Forest</span><br>';
      div.innerHTML += '<i style="background: #E6E696"></i><span>Land</span><br>';
      div.innerHTML += '<i style="background: #E8E6E0"></i><span>Residential</span><br>';
      
      
      
    
      return div;
    };
    
    legend.addTo(techMap);
    
    // Control slide in n out of infoBar
    const inforBarState = () =>{
      let infBar = document.querySelector('.legend')
      infBar.classList.toggle('trans-open')
    }
    const anchor = document.querySelector('.anchor') 
    anchor.addEventListener('click', inforBarState)

    

})

// ###########################
//    outside ready function

//  display data attributes and control data presentations
    function dataMarker(json, latlng){
        let attr = json.properties
        // console.log(attr)
        return L.circleMarker(latlng).bindTooltip(`<b>LGA:${attr.lga}</b> <br> 
        Address: ${attr.address} <br> 
        Wardcode: <i class="text-success">${attr.wardcode}</i>`)
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
        `)
    }