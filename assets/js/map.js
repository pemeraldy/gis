$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});

// const axios = require('axios');
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

$(document).ready(function () {
    //init setting
    techMap = L.map('mapid', { zoomControl: false }).setView([6.6088, 3.2545], 9);

    //######## adding markers to map at will for position purpose#######
    // techMap.on("click", function(e){
    //     new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(techMap);
    //  })
    // Scale display at bottom left
    L.control.scale().addTo(techMap)

    //*********** BASE MAP OPTIONS ***********/
    leyerOSM = L.tileLayer.provider('OpenStreetMap')
    techMap.addLayer(leyerOSM)

    baseWaterColor = L.tileLayer.provider('Stamen.Watercolor')
    baseTopo = L.tileLayer.provider('OpenTopoMap')
    baseCartoDB = L.tileLayer.provider('CartoDB.DarkMatter')

    baseLayers = {
        "Open Street Map": leyerOSM,
        "Base Topo Map": baseTopo,
        "Carto DB": baseCartoDB,
        // " Water Color" : baseWaterColor
    }

    let drawnItm = new L.featureGroup()
    // ######## AJAX data Call #########

    // Draw controller
    drawnItems = new L.FeatureGroup()
    techMap.addLayer(drawnItems)
    // console.log(drawnItems)

    // Dataset layer
    layerData = L.geoJSON.ajax('features', {
        'pointToLayer': dataMarker,
    }).addTo(techMap)
    layerData.on('data:loaded', () => {
        techMap.fitBounds(layerData.getBounds())
        // console.log(layerData)
    })

    // PPMV
    layerPPMV = L.geoJSON.ajax('data/PPMV.geojson', {
        'pointToLayer': dataMarker,
    }).addTo(techMap)
    layerPPMV.on('data:loaded', () => {
        techMap.fitBounds(layerPPMV.getBounds())
    })

    // CP
    layerCP = L.geoJSON.ajax('data/CP.geojson', {
        'pointToLayer': dataMarker,
    })
    layerCP.on('data:loaded', () => {
        techMap.fitBounds(layerCP.getBounds())
    })

    // Hospital
    layerHospital = L.geoJSON.ajax('data/hospital.geojson', {
        'pointToLayer': dataMarker,
    })
    layerHospital.on('data:loaded', () => {
        techMap.fitBounds(layerHospital.getBounds())
    })

    // Laboratory
    layerLaboratory = L.geoJSON.ajax('data/laboratory.geojson', {
        'pointToLayer': dataMarker,
    }).addTo(techMap)
    layerLaboratory.on('data:loaded', () => {
        techMap.fitBounds(layerLaboratory.getBounds())
    })

    // lagos State
    layerLagos = L.geoJSON.ajax('data/lagos_state.geojson', {
        'pointToLayer': dataMarker,
    }).addTo(techMap)
    layerLagos.on('data:loaded', () => {
        techMap.fitBounds(layerLagos.getBounds())
    })

    // lagos State LGA
    layerLagosLGA = L.geoJSON.ajax('data/lagos_LGA.geojson', {
        'pointToLayer': dataMarker,
    })
    layerLagosLGA.on('data:loaded', () => {
        techMap.fitBounds(layerLagosLGA.getBounds())
    })

    // States Layer
    statesLayer = L.geoJSON.ajax('states', {
        'pointToLayer': dataStyler,
    })

    // LGAs layer
    red = { // Define your style object
        "color": "#ff0000"
    }
    lgasLayer = L.geoJSON.ajax('lgas', {
        'pointToLayer': dataMarker,
        'style': red,
    })

    overlays = {
        "States": statesLayer,
        "LGAs": lgasLayer,
        "Lagos": layerLagos,
        "LagosLGAs": layerLagosLGA,
        "PPMV": layerPPMV,
        "CP": layerCP,
        "Hospital": layerHospital,
        "Laboratory": layerLaboratory,
        "Dataset": layerData,
        "Draw Layer": drawnItems
    }

    baseMapContoller = L.control.layers(baseLayers, overlays, {
        collapse: false,
        expand: false
    }).addTo(techMap)    // console.log(drawnItems)

    // easyBtn = L.easyButton('fa-globe', function () {
    //     console.log('hey')
    // }).addTo(techMap)

    // get user location using the capital L key
    techMap.on('keypress', function (e) {
        // console.log(e)
        if (e.originalEvent.key == 'L') {
            techMap.locate()
        }
    })

    techMap.on('locationfound', function (e) {
        L.circleMarker(e.latlng).addTo(techMap)
        techMap.setView(e.latlng, 14)
    })

    techMap.on('locationerror', function () {
        console.log('location not found')
    })

    // Measure control button
    // measure = L.control.polylineMeasure().addTo(techMap);

    // zoomIN and Zoom Out btn functions
    zoomInBtn = document.getElementById('zoom-in')
    zoomInOut = document.getElementById('zoom-out')

    zoomInBtn.addEventListener('click', () => {
        techMap.zoomIn()
    })

    zoomInOut.addEventListener('click', () => {
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
            layer.bindTooltip('<b>Radius: </b>' + (layer._mRadius / 1000).toFixed(3) + ' km');
            // console.log(layer._mRadius, e, layer)
        }
        if (type === 'rectangle') {
            layer.bindTooltip('width: ' + e.sourceTarget._size.x + 'km <br/> Height ' + e.sourceTarget._size.y + 'km');
            // console.log(e, layer, e.sourceTarget._size)
        }
        if (type === 'polygon') {
            layer.bindTooltip('');
            // console.log(layer)
        }

        drawnItems.addLayer(layer);
        // let newGeo = JSON.stringify(layer.toGeoJSON())

    });


    drawStyle = L.control.styleEditor().addTo(techMap)

    // Measure area and line
    measureControl = new L.Control.Measure({ position: 'topright', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters' });
    measureControl.addTo(techMap);
    measure = L.control.polylineMeasure().addTo(techMap);

    // #########LEGEND TEMPLATES ###########

    /*Legend specific*/
    let legend = L.control({ position: "bottomleft" });

    legend.onAdd = function (layerdata) {
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

    mainSideBar.onAdd = function () {
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
    const inforBarState = (el, togglClass) => {
        let element = document.querySelector(`.${el}`)
        element.classList.toggle(`${togglClass}`)
    }

    const anchor = document.querySelector('.anchor') //anchor button on legend bar
    anchor.addEventListener('click', () => inforBarState('legend', 'trans-open'))

    const sideBarAnchor = document.querySelector('.main-side-bar .anchor') //anchor button on utility side bar bar
    sideBarAnchor.addEventListener('click', () => {
        inforBarState('main-side-bar', 'slide-left')
        console.log('heu')
    })


    let styleOne = {
        "color": "purple",
        "weight": 1,
        "opacity": 0.65
    }
})


// ###########################
//    outside ready function

function dataMarker(json, latlng) {
    let attr = json.properties
    // console.log(attr)
    if (attr.type == 'PPMV') {
        return L.marker(latlng, {
            icon: iconPPMV,
        }).bindTooltip(`<b>LGA:${attr.lga}</b> <br>
        Address: ${attr.address} <br>
        Wardcode: <i class="text-success">${attr.wardcode}</i>`)
    } else {
        return L.marker(latlng, {
            icon: iconHospital,
        }).bindTooltip(`<b>LGA:${attr.lga}</b> <br>
        Address: ${attr.address} <br>
        Wardcode: <i class="text-success">${attr.wardcode}</i>`)
    }

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

function stateAttribute(feat, layer) {
    layer.on({
        // mouseover: highlightFeature,
        // mouseout: resetHighlight,
        // click: zoomToFeature
    }).bindTooltip(`<div class="card"> ${feat.properties.statename}</div>`)
}

function dataStyler(json, latlng) {
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

function popUpData(feature, ltlng) {
    let feat = feature
    let att = feature.properties
    let res = []
    if (att) {
        res.push(att.name)
        console.log('from popup data', res, feat)
    }
}

// ************ASIGN CUSTOM MARKERS*************
let iconPPMV = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='color:#fff;' class='marker-pin-two'></div><i class='fas fa-capsules awesome fa-3x'>",
    iconSize: [30, 42],
    iconAnchor: [15, 42]
});

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

// save drawn items layer
$(".save-map").click(function (e) {
    $.ajax({
        type: 'POST',
        url: '/drawnSave',
        data: drawnItems,
        success: function (data) {
            alert(data.success);
        }
    });
});
