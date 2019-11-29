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
    ObjOverlays

   $(document).ready(function(){
    //init setting
    techMap = L.map('mapid', {zoomControl:false}).setView([6.6088, 3.2545], 9);

    //*********** BASE MAP OPTIONS ***********/
    leyerOSM = L.tileLayer.provider('OpenStreetMap')
    techMap.addLayer(leyerOSM)

    baseWaterColor = L.tileLayer.provider('OpenTopoMap')
    baseTopo = L.tileLayer.provider('OpenTopoMap')
    baseCartoDB = L.tileLayer.provider('CartoDB.DarkMatter')

    ObjOverlays = {
        "Open Street Map" : leyerOSM,
        "<b>Base Topo Map </b>" : baseTopo,
        "<img src='https://picsum.photos/id/237/50/50' /> <span class='my-layer-item'>DarkMode - Carto DB</span>" : baseCartoDB
    }
    baseMapContoller = L.control.layers(ObjBaseLayers, ObjOverlays).addTo(techMap)






    // get user location
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

    rightNavMain = L.control.sidebar({
        autopan: false,       // whether to maintain the centered map point when opening the sidebar
        closeButton: false,    // whether t add a close button to the panes
        container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'right',     // left or right
    }).addTo(techMap);

    // rightNavMain.addPanel({
    //     id: 'click',
    //     tab: '<i class="fa fa-tape"></i>',
    //     button: function (event) { console.log(event); }
    // });

    
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

   })
