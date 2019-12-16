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
    layerSearch,
    mainSideBar

   $(document).ready(function(){
    //init setting
    techMap = L.map('mapid', {
        zoomControl:false
    }).setView([6.6088, 3.2545], 9);
    
    // Scale display at bottom left
    L.control.scale().addTo(techMap)
    drawStyle = L.control.styleEditor().addTo(techMap)
    //*********** BASE MAP OPTIONS ***********/
    leyerOSM = L.tileLayer.provider('OpenStreetMap')
    techMap.addLayer(leyerOSM)

    baseWaterColor = L.tileLayer.provider('Stamen.Watercolor')
    baseTopo = L.tileLayer.provider('OpenTopoMap')
    baseCartoDB = L.tileLayer.provider('CartoDB.DarkMatter')

    // ######## AJAX data Calls #########
    layerData = L.geoJSON.ajax('data/PPMV.geojson', {
        'pointToLayer': dataMarker,
        onEachFeature: popUpData
    }).addTo(techMap)

    let layerData2 = L.geoJSON.ajax('data/hospital.geojson', {
        'pointToLayer': dataStyler,
        onEachFeature: popUpData
    }).addTo(techMap)
    
    let lagosLGA = L.geoJSON.ajax('data/lagos_LGA.geojson', {
        'pointToLayer': dataStyler,
        onEachFeature: popUpData
    }).addTo(techMap)

    let States = L.geoJSON.ajax('data/Nigeria_states.geojson', {
        'pointToLayer': dataStyler,
        onEachFeature: stateAttribute
    }).addTo(techMap)

    let lga = L.geoJSON.ajax('data/Nigeria_LGAs.geojson', {
        'pointToLayer': dataStyler,
        style: styleOne
    }).addTo(techMap)

    
    
    
    layerData.on('data:loaded', () =>{
        techMap.fitBounds(layerData.getBounds())
    })


    ////////// Autocomplete search
    let url = States,
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

    var highlight = {
        'fillColor': 'yellow',
        'weight': 2,
        'opacity': 1
    };


    function forEachFeature(feature, layer) {
        // Tagging each state poly with their name for the search control.
        layer._leaflet_id = feature.properties.statename;

        var popupContent = "<p><b>STATE: </b>"+ feature.properties.statename +
            "</br>REGION: "+ feature.properties.statecode 
            
        layer.bindPopup(popupContent);

        layer.on("click", function (e) { 
            stateLayer.setStyle(style); //resets layer colors
            layer.setStyle(highlight);  //highlights selected.
        }); 
    }

    var stateLayer = L.geoJson(null, {onEachFeature: forEachFeature, style: style});

    $.getJSON(null, function(data) {
            stateLayer.addData(data);
        
            for (i = 0; i < data.features.length; i++) {  //loads State Name into an Array for searching
                arr1.push({label:data.features[i].properties.statename, value:""});
            }
        addDataToAutocomplete(arr1);  //passes array for sorting and to load search control.
        });

    stateLayer.addTo(techMap);

	function addDataToAutocomplete(newArr) {
		arr = arr.concat(newArr);
		
		function uniques(arr) {
			var a = [];
			for (var i=0, l=arr.length; i<l; i++)
				if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
					a.push(arr[i]);
					x =a.sort();
			return x;
		}
		
		// The source 4 autocomplete.  https://api.jqueryui.com/autocomplete/#method-option
		$( "#autocomplete" ).autocomplete("option", "source", uniques(arr));
		$( "#autocomplete"  ).autocomplete( "option", "minLength", 2 ); // number of char. before making list
		$( "#autocomplete" ).on( "autocompleteselect", function( event, ui ) {
			updateLayer(ui.item.value);
			polySelect(ui.item.label);
			ui.item.value='';
		});
	}	///////////// Autocomplete search end
	


    // ############### HEATMAP ######
    // Heat map deals with points will later create a point extractor function
        
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
        "live drawn": drawnItems,
        // "heat map": heat,
        "Lagos LGA": lagosLGA,
        "States": States,
        "Local Govt.": lga
    }

    baseMapContoller = L.control.layers(baseLayers, overlays,{
        collapse: false,
        expand: false
    }).addTo(techMap)
     
        
    // Easy Button
    // easyBtn = L.easyButton('fa-globe', function(){
    //     turf.buffer(layerData2.toGeoJSON(), 0.3, {unit:'kilometers'})
    //     console.log('')
    //  }).addTo(techMap)

     
    

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
        let newGeo = JSON.stringify(layer.toGeoJSON())
        
        // sendDraw()
    });


    // drawStyle = L.control.styleEditor().addTo(techMap)

    // Measure area and line
    measureControl = new L.Control.Measure({position: 'topright', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters'});
    measureControl.addTo(techMap);
    // Measure control button
    measure = L.control.polylineMeasure().addTo(techMap);

    // ############### HEATMAP ######
    // let heat = L.heatLayer(layerData2).addTo(techMap)


    // #########LEGEND TEMPLATES ###########

    /*Legend specific*/
    let legend = L.control({ position: "bottomleft" });

    legend.onAdd = function(layerdata) {
      var div = L.DomUtil.create("div", "legend trans-open");
      div.innerHTML += `<h4>Legend</h4>`;
      div.innerHTML += `<div class='anchor'>&gt</div>`;
      div.innerHTML += `<i style="background: #477AC2"></i><span>Hospitals</span><br>`;
      div.innerHTML += `<i style="background: #448D40"></i><span>Wards</span><br>`;
      div.innerHTML += `<i style="background: #E6E696"></i><span>LGA</span><br>`;
      div.innerHTML += `<i style="background: #E8E6E0"></i><span>States</span><br>`;
      
    
      return div;
    };
    
    legend.addTo(techMap);

    // ********UTILITY SIDEBAR******

    mainSideBar = L.control({ position: "bottomright" });

    mainSideBar.onAdd = function() {
      var div = L.DomUtil.create("div", "main-side-bar slide-left");
    div.innerHTML += `<h4>Utilities</h4>`;
    div.innerHTML += `<div class='anchor'>&lt</div>`;
    // div.innerHTML += `<div class="query-continer">
    //                         <a id="do" class="btn btn-primary" href="#"> Remove layer</a>
    //                     </div>`;
    // div.innerHTML += `<div class="query-continer">
    //         <a id="remove" class="btn btn-primary" href="#"> add Layer</a>
    //     </div>`;

    div.innerHTML += `<div class="accordion" id="accordionExample">`
    div.innerHTML += `<div class="card ">
        <div class="card-header" id="headingOne">
        <h2 class="mb-0">
            <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
            Buffer Area
            </button>
        </h2>
        </div>

        <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
        <div class="card-body">
            Anim p
        </div>
        </div>
    </div>`  
        div.innerHTML += `<div class="card">
        <div class="card-header" id="headingTwo">
        <h2 class="mb-0">
            <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
            Query Search
            </button>
        </h2>
        </div>
        <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
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
      
            // console.log(e.target)
            // return L.circleMarker(json.latlng).bindTooltip(`<b>LGA:${attr.lga}</b> <br> 
            // Address: ${attr.address} <br> 
            // Wardcode: <i class="text-success">${attr.wardcode}</i>`)
        });


        


        /***************Search Works****************/
        function returnProj(feat, layer){
            techMap.removeLayer(layerData)
        }

        
        function addLayer(feat, layer){
            techMap.addLayer(layerData)
            L.geoJSON(layerData, {
                style: function (feature) {
                    return {color: feature.properties.color};
                },
                filter: function(feature,layer){
                    console.log(feature.properties)
                }
            })

        }
        // let btn = document.getElementById('do').addEventListener('click', returnProj)
        // let btn2 = document.getElementById('remove').addEventListener('click', addLayer)

        // var searchLayer = L.layerGroup().addTo(techMap);
        // //... adding data in searchLayer ...
        // techMap.addControl( new L.Control.Search({layer: layerData}) );

       
       
})

// ###########################
//    outside ready function

//  display data attributes and control data presentations
    function dataMarker(json, latlng){
        let attr = json.properties
        // console.log(attr)
        return L.circleMarker(latlng,{
            color: 'red',
        }).bindTooltip(`<b>LGA:${attr.lga}</b> <br> 
        Address: ${attr.address} <br> 
        Wardcode: <i class="text-success">${attr.wardcode}</i>`)
    }

    function highlightFeature(e) {
        var layer = e.target;
    
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

    // function resetHighlight(e,geojson) {
    //     // geojson = this.
    //     // geojson.resetStyle(e.target);
    // }
    // function zoomToFeature(e,feature) {
    //     console.log(this)
    //     map.fitBounds(this._bonds._southWest.getBounds());
    // }

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
        `)
    }

    function popUpData(feature, ltlng){
        let res = []
        if(feature.properties){
            res.push(feature.name)
            console.log('from popup data',feature.properties)
        }
    }
    let styleOne = {
        "color": "purple",
        "weight": 1,
        "opacity": 0.65
    }