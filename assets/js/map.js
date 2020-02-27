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
  poi,
  bufferCircle,
  cIndicator,
  addNewLayer;

$(document).ready(function() {
  //init setting
  techMap = L.map("mapid", {
    zoomControl: false
  }).setView([6.465422, 3.406448], 5);

  // Scale display at bottom left
  L.control.scale().addTo(techMap);
  // drawStyle = L.control.styleEditor().addTo(techMap)

  //*********** BASE MAP OPTIONS ***********/
  leyerOSM = L.tileLayer.provider("OpenStreetMap");
  techMap.addLayer(leyerOSM);

  baseWaterColor = L.tileLayer.provider("Stamen.Watercolor");
  baseTopo = L.tileLayer.provider("OpenTopoMap");
  baseCartoDB = L.tileLayer.provider("CartoDB.DarkMatter");

  overlaysArray = [];

  // ######## data AJAX  Calls #########
  layerPPMV = L.geoJSON.ajax("data/PPMV.geojson", {
    pointToLayer: points,
    onEachFeature: feat1
  });

  function filterLayer(feature) {
    let prop = feature.properties.lga;
    // console.log(feature.properties.lga)
    if (feature.properties.lga == "Ajeromi")
      console.log(feature.properties.lga);

    // return prop.lga == 'Ajeromi'
  }

  layerHospital = L.geoJSON.ajax("data/hospital.geojson", {
    // filter: filterLayer,
    pointToLayer: newPoints,
    onEachFeature: feat1
  });
  let hMarkerCluster = L.markerClusterGroup();
  layerHospital.on("data:loaded", () => {
    hMarkerCluster.addLayer(layerHospital);
  });

  lagosLGA = L.geoJSON.ajax("data/lagos_LGA.geojson", {
    pointToLayer: dataStyler,
    onEachFeature: feat1
  });

  states = L.geoJSON.ajax("data/Nigeria_states.geojson", {
    pointToLayer: dataStyler,
    onEachFeature: feat1,
    style: style
  });

  lga = L.geoJSON.ajax("data/Nigeria_LGAs.geojson", {
    pointToLayer: dataStyler,
    onEachFeature: feat1,
    style: styleOne
  });

  // When Data Has Successfully Loaded
  let ppmarkerCluster = L.markerClusterGroup();
  layerPPMV.on("data:loaded", data => {
    ppmarkerCluster.addLayer(layerPPMV);
  });

  states.on("data:loaded", () => {
    overlaysArray.push(states);
    // states.fitBounds(states.getBounds())
  });

  /**STYLING FUNCTIONS**/
  function style(feature) {
    return {
      fillColor: "#2dce89",
      fillOpacity: 0.5,
      weight: 2,
      opacity: 1,
      color: "#ffffff",
      dashArray: "3"
    };
  }
  function style2(feature) {
    return {
      fillColor: "orange",
      fillOpacity: 0.5,
      weight: 2,
      opacity: 1,
      color: "#ffffff",
      dashArray: "3"
    };
  }

  let highlight = {
    fillColor: "yellow",
    weight: 2,
    opacity: 1
  };

  function forEachFeature(feature, layer) {
    let popupContent =
      "<p><b>STATE: </b>" +
      feature.properties.statename +
      "</br>REGION: " +
      feature.properties.statecode;

    layer.bindPopup(popupContent);

    layer.on("click", function(e) {
      layer.setStyle(style2); //resets layer colors
      layer.setStyle(highlight); //highlights selected.
    });
  }

  // ############### HEATMAP ######
  // Heat map deals with points will later create a point extractor function

  // Draw controller
  drawnItems = new L.FeatureGroup();
  techMap.addLayer(drawnItems);

  let drawned = new L.FeatureGroup();
  let drawnedJSON = drawned.toGeoJSON();
  // console.log(drawnedJSON)
  drawned.addTo(techMap);

  baseLayers = {
    "Open Street Map": leyerOSM,
    "Base Topo Map": baseTopo,
    "Carto DB": baseCartoDB,
    " Water Color": baseWaterColor
  };

  overlays = {
    "Lagos PPMV": layerPPMV,
    Hospital: layerHospital,
    "live drawn": drawnItems,
    // "heat map": heat,
    "Lagos LGA": lagosLGA,
    States: states,
    "Local Govt.": lga
  };

  baseMapContoller = L.control.layers(baseLayers, overlays, {
    collapse: false,
    expand: true
  });

  /**** SEARCH LAYERS ***/
  poi = L.layerGroup([overlays["Lagos PPMV"]]);

  searchControl = L.control.search({
    layer: poi,
    initial: false,
    marker: false,
    propertyName: "name",
    hideMarkerOnCollapse: true,
    marker: {
      icon: new L.Icon({
        iconUrl: "./assets/firstaid.png",
        iconSize: [20, 20]
      }),
      circle: {
        radius: 20,
        color: "#f41642",
        opacity: 1
      }
    },
    moveToLocation: function(latlng, title, techMap) {
      // techMap.fitBounds( latlng.layer.getBounds() );
      // console.log(latlng, title, techMap)
      // var zoom = techMap.getBoundsZoom(latlng.layer.getBounds());
      techMap.flyTo(latlng, 11); // access the zoom
    }
  });

  searchControl
    .on("search:locationfound", function(e) {
      console.log(e);
      let marker = new L.Marker(new L.latLng(e.latlng));

      // states.eachLayer(function(layer) {
      // 	// states.resetStyle(layer);
      // });

      // poi.addLayer(marker)

      // e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
      if (e.layer._popup) e.layer.openPopup();
    })
    .on("search:collapsed", function(e) {
      states.eachLayer(function(layer) {
        //restore feature color
        states.resetStyle(layer);
      });
    });

  techMap.addControl(searchControl);

  // get user location using the capital L key
  techMap.on("keypress", function(e) {
    // console.log(e)
    if (e.originalEvent.key === "L") {
      techMap.locate();
    }
  });

  techMap.on("locationfound", function(e) {
    L.circleMarker(e.latlng).addTo(techMap);
    techMap.flyTo(e.latlng, 14);
  });

  techMap.on("locationerror", function() {
    console.log("location not found");
  });

  // zoomIN and Zoom Out btn functions
  zoomInBtn = document.getElementById("zoom-in");
  zoomInOut = document.getElementById("zoom-out");

  zoomInBtn.addEventListener("click", () => {
    techMap.zoomIn();
  });

  zoomInOut.addEventListener("click", () => {
    techMap.zoomOut();
  });

  // create draw control
  drawControl = new L.Control.Draw({
    draw: {
      polygon: {
        shapeOptions: {
          color: "purple"
        },
        showArea: true,
        metric: false,
        allowIntersection: false,
        repeatMode: true,
        draggable: true
      },
      marker: true
    },
    edit: {
      featureGroup: drawnItems,
      remove: true
    }
  });

  //Add draw control to map
  techMap.addControl(drawControl);

  techMap.on("draw:created", function(e) {
    let type = e.layerType;
    // let layer = e.layer
    console.log(e.layer);

    if (type === "circle") {
      layer.bindTooltip(
        "<b>Radius: </b>" + (layer._mRadius / 1000).toFixed(3) + " km"
      );
      console.log(e, e.layer.toGeoJSON());
    }
    if (type === "rectangle") {
      layer.bindTooltip(
        "width: " +
          e.sourceTarget._size.x +
          "km <br/> Height " +
          e.sourceTarget._size.y +
          "km"
      );
      console.log(e, e.layer, e.sourceTarget._size);
    }
    if (type === "polygon") {
      e.layer.bindTooltip("");
      console.log(e.layer);
    }

    // cHECKING IF ITS A MARKER AND TRIGGRED
    if (e.layerType === "marker" && bufferMode.classList.contains("active")) {
      if (bufferCircle) {
        techMap.removeLayer(bufferCircle);
      }

      if (cIndicator) {
        techMap.removeLayer(cIndicator);
      }

      let marker_lat_long = e.layer._latlng;
      // console.log(marker_lat_long)
      let radius = milesToMeters($("#radiusSelected").val());

      bufferCircle = L.circle(marker_lat_long, radius);
      // console.log(bufferCircle)
      bufferCircle.addTo(techMap);

      // Calculate the number of eco icons within the circle
      // So we can put it on the DOM
      pointsInCircle(bufferCircle, radius);

      // Make the marker draggable
      console.log(e.layer);
      e.layer.dragging.enable();

      // If you drag the marker, make sure the circle goes with it
      e.layer.on("dragend", function(event) {
        techMap.setView(event.target.getLatLng());
        bufferCircle.setLatLng(event.target.getLatLng());

        // Clear out results
        // $('#ofi_paf').html('');

        // This will determine how many markers are within the circle
        pointsInCircle(
          bufferCircle,
          milesToMeters($("#radius-selected").val())
        );

        // Redraw: Leaflet function
        bufferCircle.redraw();
      });
    }

    drawnItems.addLayer(e.layer);
    // let newGeo = layer.toGeoJSON()
    // console.log(newGeo)

    // sendDraw()
  });

  // drawStyle = L.control.styleEditor().addTo(techMap)

  // Measure area and line
  measureControl = new L.Control.Measure({
    position: "topleft",
    primaryLengthUnit: "meters",
    secondaryLengthUnit: "kilometers",
    primaryAreaUnit: "sqmeters"
  });
  oldContainer = measureControl.getContainer();
  let newMeasureToolCont = document.querySelector("#pills-contact");
  newMeasureToolCont.append(oldContainer);
  measureControl.addTo(techMap);

  // ######### Feature INfo Bar ###########

  /*Legend specific*/
  legend = L.control({ position: "bottomleft" });

  legend.onAdd = function(featPoint) {
    let div = L.DomUtil.create("div", "legend trans-open");
    if (featPoint == undefined) {
      return false;
    } else {
      div.innerHTML += `<h2>Feature Info</h2>`;
      div.innerHTML += `<div class='anchor'><i class="fas fa-chevron-right"></i></div>`;
      div.innerHTML += `<div class="legend-content">
                            <div class="card" style="width: 18rem;">
                                
                                <div class="card-body">
                                    <div class="card-text">
                                    
                                    </div>
                                </div>
                            </div>
                           
                        </div>`;

      return div;
    }
  };

  legend.addTo(techMap);

  // Base Map activators
  document.getElementById("osm").addEventListener("click", () => {
    L.tileLayer.provider("OpenStreetMap").addTo(techMap);
  });
  document.getElementById("cartoDb").addEventListener("click", () => {
    L.tileLayer.provider("CartoDB.DarkMatter").addTo(techMap);
  });
  document.getElementById("openTopo").addEventListener("click", () => {
    L.tileLayer.provider("OpenTopoMap").addTo(techMap);
  });
  //  document.getElementById('waterpaint').addEventListener('click', () =>{
  //     L.tileLayer.provider('Stamen.Watercolor').addTo(techMap)
  //  })

  // Control slide in n out of infoBars
  // const inforBarState = (el,togglClass) =>{
  //   let element = document.querySelector(`.${el}`)
  //   element.classList.toggle(`${togglClass}`)
  // }

  const anchor = document.querySelector(".anchor"); //anchor button on legend bar
  anchor.addEventListener("click", () => inforBarState("legend", "trans-open"));

  options = {
    icon: "clinic-medical",
    iconShape: "marker"
  };
  const freshMark = L.marker([48.1371, 11.57539], {
    icon: L.BeautifyIcon.icon(options),
    draggable: false
  })
    .addTo(techMap)
    .bindPopup("popup");

  techMap.on("click", function(e) {
    // let attr = json.properties
    console.log(e);
  });

  fillLayer();
  bufferLayerGen();
});

/*************************************************************************************/
/*************************************************************************************/
/*************************************************************************************/
/*************************************************************************************/

// ############# GLOBLA SCOPE -- OUTSIDE IFFE##############

// toggle Draw Controller
function toggleDraw() {
  drawControl._container.style.display =
    drawControl._container.style.display == "none" ? "flex" : "none";
}

// TOGGLE SIDE BARS
const inforBarState = (el, togglClass) => {
  let element = document.querySelector(`.${el}`);
  element.classList.toggle(`${togglClass}`);
};

const sideAnchor = document.querySelector(".sidebar-anchor"); //anchor button on legend bar

sideAnchor.addEventListener("click", () =>
  inforBarState("map-sidebar", "side-open")
);

//  display data attributes and control data presentations
function dataMarker(json, latlng, options) {
  options = {
    color: "red"
  };
  let attr = json.properties;
  // console.log(json)
  if (attr.type == "PPMV") {
    return L.marker(latlng, {
      icon: myIcon
    })
      .bindTooltip(
        `<b>Name:${attr.name}</b> <br> 
            Address: ${attr.address} <br> 
            `,
        { direction: "top" }
      )
      .bindPopup(attr.name);
  } else {
    return L.marker(latlng, {
      icon: iconHospital
    }).bindTooltip(`<b>Name:${attr.name}</b> <br> 
            Address: ${attr.address} <br> 
            Wardcode: <i class="text-success">${attr.state}</i>`);
  }
}

function highlightFeature(e) {
  let layer = e.target;

  layer.setStyle({
    weight: 2,
    color: "yellow",
    dashArray: "",
    fillOpacity: 0.4
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function stateAttribute(feat, layer) {
  layer
    .on({
      // mouseover: highlightFeature,
      // mouseout: resetHighlight,
      // click: zoomToFeature
    })
    .bindTooltip(`<div class="card"> ${feat.properties.statename}</div>`);
}

function dataStyler(json, latlng) {
  let attr = json.properties;
  // console.log(attr)
  return L.marker(latlng).bindTooltip(
    `
            <div class="t-tooltip">
                <b>Name:${attr.name}</b> 
                    <br> 
                <i class="fas fa-home"></i> Address: ${attr.address} 
                <br> 
                Wardcode: <i class="text-primary"> ${attr.state}</i>
            </div>
        `,
    { direction: "side" }
  );
}

function popUpData(feature, ltlng) {
  let feat = feature;
  let att = feature.properties;
  let res = [];
  if (att) {
    res.push(att.name);
    // console.log('from popup data',res,feat)
  }
}
let styleOne = {
  color: "purple",
  weight: 1,
  opacity: 0.65
};

// ************ASIGN CUSTOM MARKERS*************
//    let iconPPMV = L.divIcon({
//             className: 'custom-div-icon',
//             html: "<div style='color:#fff' class='marker-pin-two'></div><i class='fas fa-capsules awesome fa-3x'>",
//             iconSize: [30, 42],
//             iconAnchor: [15, 42]
//         })

//         let iconHospital = L.divIcon({
//             className: 'custom-div-icon',
//             html: "<div style='background-color:#4838cc' class='marker-pin-one'></div><i style='color:#fff' class='fas fa-hospital awesome fa-3x'>",
//             iconSize: [30, 42],
//             iconAnchor: [15, 42]
//         });

//         let iconLaboratory = L.divIcon({
//             className: 'custom-div-icon',
//             html: "<div style='color:#fff;' class='marker-pin-one'></div><i class='fas fa-flask awesome fa-3x'>",
//             iconSize: [30, 42],
//             iconAnchor: [15, 42]
//         });

/*********CUSTOM FUNCTONS**********/

// click marker
let clickmark;

// When you click on a circle, it calls the onMapClick function and passes the layers coordinates.
// I grab the coords which are X,Y, and I need to flip them to latLng for a marker,
function onMapClick(coords) {
  console.log(coords);
  let thecoords = coords.toString().split(",");
  let lat = thecoords[1];
  let lng = thecoords[0];
  console.log("click mark", clickmark);
  //if prior marker exists, remove it.
  if (clickmark != undefined) {
    techMap.removeLayer(clickmark);
  }

  clickmark = L.circleMarker([lat, lng], {
    radius: 8,
    //opacity: 1,
    color: "yellow",
    fillColor: "yellow",
    fillOpacity: 0.8
  }).addTo(techMap);
}
// end of code for click marker.

function feat1(feature, layer) {
  feature.layer = layer;
  // console.log(feature.properties);
  let bd = document.querySelector(".legend-content .card-body .card-text");
  // console.log('layer:',layer)

  layer.on("click", e => {
    let coords = e.target.feature.geometry.coordinates;
    let props = feature.properties;
    document.querySelector(".legend").classList.remove("trans-open");
    // console.log(props)

    if (feature.geometry.type == "MultiPolygon") {
      color.type = "color";
      // console.log(layer)

      bd.innerHTML = "";
      for (let key in props) {
        let value = props[key];

        bd.innerHTML += `<div><b> ${key}</b>: ${value}</div>`;
      }
      bd.innerHtml += `<hr>`;
      bd.innerHTML += `<div><label>Fill color</label>:<input id="fillCol" type='color' value='${layer.options.fillColor}'></div>`;
      bd.innerHTML += `<div><label>Fill opacicty</label>:<input id="fillOp" type='number' min='0' max='1' step='0.1' value='${layer.options.fillOpacity}'></div>`;
      console.log(layer.options.fillColor);

      // addevent listeners for newly filled htmltags
      let fillColor = document.getElementById("fillCol"),
        fillOpacity = document.getElementById("fillOp"),
        strokeWidth = document.getElementById("strokeWit"),
        strokeColor = document.getElementById("strokeCol");
      fillColor.addEventListener("change", () => {
        layer.setStyle({
          fillColor: fillColor.value
        });
      });

      fillOpacity.addEventListener("change", () => {
        layer.setStyle({
          fillOpacity: fillOpacity.value
        });
      });
    } else if (feature.geometry.type == "Point") {
      // onMapClick(coords);
      // console.log(feature.properties)

      bd.innerHTML = "";
      for (let key in props) {
        let value = props[key];

        if (key === "photo" || key === "image") {
          // if its an image, display an image element.
          bd.innerHTML += `<img src = "${value}" width="200" height="200"  alt="point Image"/>`;
          continue;
        }
        bd.innerHTML += `<div><b> ${key}</b>: ${value}</div>`;
      }
    } else {
      document.querySelector(".legend-content").innerHTML = ` 
            <h2>Click a Layer to display properties</h2> 
            `;
    }
  });
}

/*********HELPER FUNCs FOR INFO DIV************/

//fill container with a list of loaded layers
function fillLayer() {
  document.querySelector("#pills-profile").innerHTML = "";

  for (key of Object.keys(overlays)) {
    let el = document.createElement("div");
    let checked = document.createElement("i");
    let edit = document.createElement("i");
    edit.classList.add("fas");
    edit.classList.add("fa-edit");
    edit.classList.add("edit");
    edit.style.fontSize = "18px";
    edit.title = "customize layer";
    checked.classList.add("fas");
    checked.style.marginLeft = "auto";
    // checked.classList.add('fa-check-square')
    el.innerText = key;
    el.prepend(edit);
    edit.addEventListener("click", callModal);
    el.append(checked);
    el.classList.add("inactive");
    el.classList.add("layer");
    el.addEventListener("click", loadLayer);

    document.querySelector("#pills-profile").append(el);
  }
  // return 3;
}
function loadLayer(e) {
  // if a layer is not active, add the class active and also add to Map else do d opp
  // if(e.target !== 'div'){ return}
  // console.log(e)
  e.target.classList.contains("inactive")
    ? techMap.addLayer(overlays[e.target.innerText])
    : techMap.removeLayer(overlays[e.target.innerText]);
  e.target.classList.toggle("inactive");
  e.target.lastElementChild.classList.toggle("fa-check-square");
  e.target.lastElementChild.style.fontSize = "22px";
  // console.log(e.target.lastElementChild)
}

function callModal(e) {
  let call = document.querySelector("a[data-target] ");
  let modalTitle = document.querySelector("#customize .modal-title");
  let layerName = e.target.parentElement.innerText;
  // modalTitle = `${modalTitle.innerText} ${e.target.parentElement.innerText}`
  document.querySelector(" .map-sidebar").classList.add("side-open");

  // console.log(e.target.parentElement.innerText)
  call.click();
  modalTitle.innerText = "";
  modalTitle.innerText = `${layerName}`;
  // console.log(modalTitle)
  return layerName;
}

const mapThumb = document.querySelectorAll(".map-thumb");

// TOGGLE ACTIVE CLASS FOR BASE MAPS
mapThumb.forEach(thum => {
  thum.addEventListener("click", function(e) {
    mapThumb.forEach(thum => thum.classList.remove("base-active"));
    thum.classList.toggle("base-active");
  });
});

// SIDE BAR crumbs BUTTONS
const sideBarBtns = document.querySelectorAll(".sidebar .nav-link");
const sideBarHeader = document.querySelector(".sidebar-header");
sideBarBtns.forEach(btn => {
  // Set Header of Side Bar on CLick of BTNS
  btn.addEventListener("click", e => {
    sideBarHeader.innerText = btn.innerText;
  });
});

// Layer Edit functions

const modalFormValues = () => {
  // let iconList = editLayerModalForm.iconList.value
  let fillColor = editLayerModalForm.fillColor.value;
  let fillOpacity = editLayerModalForm.fillOpacity.value;
  console.log(fillColor, fillOpacity);
  return {
    fillColor: fillColor,
    fillOpacity: fillOpacity
  };

  // changePoints("Hospital", points )
};

// const editLayerModalForm = document.getElementById('editLayer')
// // console.log(editLayerModalForm)

// const saveCustomize = document.getElementById('saveCustomize')
// saveCustomize.addEventListener('click', changePoints)

var myIcon = L.icon({
  iconUrl: "./assets/carrental.png",
  iconSize: [30, 40],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
});

var myIcon2 = L.icon({
  iconUrl: "./assets/firstaid.png",
  iconSize: [30, 40],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
});

function newPoints(json, latlng) {
  let attr = json.properties;
  options = {
    icon: "home",
    iconShape: "marker"
  };
  return L.marker(latlng, {
    icon: L.BeautifyIcon.icon(options),
    draggable: false
  })
    .bindTooltip(
      `<b>${attr.name}</b> <br> 
    Address: ${attr.address} <br> 
    `,
      { direction: "auto" }
    )
    .bindPopup(attr.name);
}

function points(json, latlng, options) {
  let attr = json.properties;
  // console.log(json)

  var options = {
    icon: "hospital-alt",
    iconShape: "marker",
    borderColor: "#b3334f",
    textColor: "#b3334f"
    //  iconSize: [40,40],
    // innerIconStyle: 'font-size:20px; margin:10px auto'
  };
  return L.marker(latlng, {
    icon: L.BeautifyIcon.icon(options),
    draggable: false
  })
    .bindTooltip(
      `<b>Name:${attr.name}</b> <br> 
        Address: ${attr.address} <br> 
        `,
      { direction: "top" }
    )
    .bindPopup(attr.name);
}
console.log(myIcon);
/* LINK THE SEARCH INPUT WITH LEAFLET SEARCH PLUGIN */
$("#autocomplete").on("keyup", function(e) {
  searchControl.searchText(e.target.value);
});

function changePoints(layer, pointFunc) {
  techMap.removeLayer(overlays[`${layer}`]);
  overlays[`${layer}`].options.pointToLayer = null;
  overlays[`${layer}`].options.pointToLayer = pointFunc;

  overlays[`${layer}`].refresh();

  techMap.addLayer(overlays[`${layer}`]);

  console.log(overlays[`${layer}`]);
}

const ptSymbol = document.getElementById("ptSymbol");
const ptSize = document.getElementById("ptSize");
const ptFill = document.getElementById("ptFill");

const ptOpacity = document.getElementById("ptOpacity");

const ptStrokeOp = document.getElementById("ptStrokeOp");
const ptStrokeW = document.getElementById("ptStrokeW");
const ptSolid = document.getElementById("ptSolid");
const ptDash = document.getElementById("ptDash");

ptOpacity.addEventListener(
  "change",
  () => (ptSymbol.style.opacity = ptOpacity.value)
);
const ptStroke = document.getElementById("ptStroke");

ptFill.addEventListener(
  "change",
  () => (ptSymbol.style.background = ptFill.value)
);

ptStroke.addEventListener("change", () => {
  console.log(ptStroke.value);
  if (ptSolid.checked) {
    ptSymbol.style.border = `${ptStrokeW.value}px  solid  ${ptStroke.value}`;
  }
  if (ptDash.checked) {
    ptSymbol.style.border = `${ptStrokeW.value}px  dotted  ${ptStroke.value}`;
  }
});
ptStrokeW.addEventListener("change", () => {
  if (ptSolid.checked) {
    ptSymbol.style.border = `${ptStrokeW.value}px  solid  ${ptStroke.value}`;
  }
  if (ptDash.checked) {
    ptSymbol.style.border = `${ptStrokeW.value}px  dotted  ${ptStroke.value}`;
  }
});
/****** MAP MODAL STYLING *******/
// ######POINTS
function returnPointValues() {
  const ptSize = document.getElementById("ptSize");
  const ptFill = document.getElementById("ptFill");
  const ptOpacity = document.getElementById("ptOpacity");
  const ptStroke = document.getElementById("ptStroke");
  const ptStrokeW = document.getElementById("ptStrokeW");
  const ptSolid = document.querySelector('input[name="ptStrokeType"]:checked')
    .value;
  // const ptDash = document.getElementById('ptDash')

  const ptOptions = {
    ptSize: ptSize.value,
    ptFill: ptFill.value,
    ptOpacity: ptOpacity.value,
    ptStroke: ptStroke.value,
    // ptStrokeOp: ptStrokeOp.value,
    ptSolid: ptSolid,
    ptStrokeW: ptStrokeW.value
  };
  return ptOptions;
}
// Button to effect point changes
const savePtCustomize = document.getElementById("savePtCustomize");

savePtCustomize.addEventListener("click", () => {
  const layer = document.getElementById("customizeLabel").innerText;
  changePoints(layer, pointStyler);

  console.log(returnPointValues());
  document.getElementById("ptmodalClose").click();
});

// FUNCTION THAT STYLES POINTS ONLY
function pointStyler(json, latlng, val) {
  let attr = json.properties;
  val = returnPointValues();
  options = {
    iconShape: "circle-dot",
    iconSize: [val.ptSize, val.ptSize],
    borderWidth: val.ptStrokeW,
    borderColor: val.ptStroke,
    borderStyle: val.ptSolid,
    backgroundColor: val.ptFill
  };
  return L.marker(latlng, {
    icon: L.BeautifyIcon.icon(options),
    draggable: false,
    opacity: val.ptOpacity
  })
    .bindTooltip(
      `<b>${attr.name}</b> <br> Address: ${attr.address} <br> 
    `,
      { direction: "auto" }
    )
    .bindPopup(attr.name);
}

// FUNCTION TO STYLE ICONS
function iconStyler(json, latlng) {
  let attr = json.properties;
  val = returnIconValues();
  options = {
    icon: val.icon,
    borderColor: val.borderColor,
    textColor: val.textColor,
    backgroundColor: val.backgroundColor,
    iconSize: val.iconSize,
    innerIconStyle: val.innerIconStyle
    // iconShape: ''
  };

  return L.marker(latlng, {
    icon: L.BeautifyIcon.icon(options),
    draggable: false
  })
    .bindTooltip(
      `<b>${attr.name}</b> <br> Address: ${attr.address} <br> 
    `,
      { direction: "auto" }
    )
    .bindPopup(attr.name);
}

// Icon FORM VALUES
function returnIconValues() {
  const icon = document.getElementById("iconType");
  const iconColor = document.getElementById("iconColor");
  const iconSize = document.getElementById("iconSize");
  const iconBg = document.getElementById("iconBg");
  const iconStroke = document.getElementById("iconStroke");
  const iconStrokeSize = document.getElementById("iconStrokeSize");

  const iconOptions = {
    icon: icon.value,
    textColor: iconColor.value,
    backgroundColor: iconBg.value,
    iconSize: [Number(iconSize.value), Number(iconSize.value)],
    borderWidth: iconStrokeSize.value,
    borderColor: iconStroke.value,
    innerIconStyle: `font-size:${Math.floor(
      Number(iconSize.value) / 2
    )}px; padding:${Math.floor(Number(iconSize.value) / 5)}px;`
  };
  return iconOptions;
}

const saveIconCustomize = document.getElementById("saveIcon");

saveIconCustomize.addEventListener("click", () => {
  const layer = document.getElementById("customizeLabel").innerText;
  changePoints(layer, iconStyler);

  console.log(returnPointValues());
  document.getElementById("cancelIcon").click();
});

// BUFER BUFFER!!!
// Convert miles to meters to set radius of circle
function milesToMeters(miles) {
  return (miles * 1069.344) / 1;
}

// figures out how many points are i a circle
function pointsInCircle(circle, meters_user_set, bufferLayer) {
  let bd = document.querySelector(".legend-content .card-body .card-text");
  let counts = document.createElement("div");

  counts.classList.add("count");
  bd.parentElement.parentElement.parentElement.parentElement.classList.remove(
    "trans-open"
  );
  bufferLayer = document.querySelector("#bufferLayer").value;

  // if(cIndicator){
  //     console.log('Somen is here')
  //     techMap.removeLayer(cIndicator)

  // } else{console.log('we gat nothn')}

  if (bufferCircle !== undefined) {
    // Lat, long of circle
    circle_lat_long = bufferCircle.getLatLng();

    let counter_points_in_circle = 0;
    bd.innerHTML = " ";
    bd.appendChild(counts);
    // Loop through each point in JSON file
    overlays[`${bufferLayer}`].eachLayer(function(layer) {
      // Lat, long of current point
      layer_lat_long = layer.getLatLng();

      // Distance from our circle marker
      // To current point in meters
      distance_from_layer_circle = layer_lat_long.distanceTo(circle_lat_long);

      // See if meters is within raduis
      // The user has selected
      if (distance_from_layer_circle <= meters_user_set) {
        counter_points_in_circle += 1;
        console.log(layer);
        console.log(layer.feature.properties.name);
        // console.log('layer',layer)

        // cIndicator = L.circle(layer._latlng, {
        //     color: 'red',
        //     fillColor: '#f03',
        //     fillOpacity: 0.5,
        //     radius: 0
        //   }).addTo(techMap);
        let lat = layer.feature.layer._latlng.lat;
        let lng = layer.feature.layer._latlng.lng;
        bd.innerHTML += ` <p class="buffer-points" > ${
          layer.feature.properties.name
        } <span class="lat" style="display:none">${lat}</span> <span class="lng" style="display:none">${lng}</span> <br/>
                                        <b>Distance:  ${(
                                          distance_from_layer_circle *
                                          0.000621371
                                        ).toFixed(2)}  miles / ${(
          distance_from_layer_circle / 1000
        ).toFixed(2)} Km</b>
                                        
                  </p> `;
      }
    });
    console.log(counts);
    document.querySelector(
      ".count"
    ).innerHTML = `<h4> ${counter_points_in_circle} points within buffer radius </h4>`;
    // Set number of results on main page
    // $('#ofi_paf_results').html(counter_points_in_circle);
    let l = document.querySelector(".legend");
    l.addEventListener("click", e => {
      if (e.target.tagName === "P") {
        let lat = e.target.firstElementChild.innerText;
        let lng = e.target.firstElementChild.nextElementSibling.innerText;
        console.log(e.target.innerText);
        techMap.flyTo([lat, lng], 14);
      }
    });
  }
  // Close pointsInCircle
}

const bufferMode = document.getElementById("bufferMode");
bufferMode.addEventListener("click", e => {
  let btn = e.target;
  bufferLayer = document.querySelector("#bufferLayer").value;
  if (bufferLayer === "") {
    alert("Select a layer");
    return false;
  }

  e.target.classList.toggle("active");
  btn.innerText = btn.classList.contains("active") ? "Stop buffer" : "buffer";
  // e.target.innerText = 'Buffer activated'
  if (bufferCircle && !btn.classList.contains("active")) {
    techMap.removeLayer(bufferCircle);
  }
});

// Buffer Layer generator
function bufferLayerGen() {
  let bl = document.querySelector("#bufferLayer");

  for (key of Object.keys(overlays)) {
    let option = document.createElement("option");

    option.innerText = key;
    option.value = key;

    bl.append(option);
  }
}

// Testing to add a new layer dynamically
addNewLayer = () => {
  const sampleData = L.geoJSON.ajax("./data/hospital.geojson", {
    pointToLayer: dataStyler,
    onEachFeature: feat1
  });
  overlays["new layer"] = sampleData;
  techMap.addLayer(overlays["new layer"]);
  console.log(sampleData);
  console.log(overlays);
  // add the new layer to side bar
  fillLayer();
};
const addNewLayerBtn = document.querySelector(".add-layer");
addNewLayerBtn.addEventListener("click", layerName => {
  // call a modal with dropzone
  poi.addLayer(overlays[`${layerName}`]);
  // console.log("isshshs");
  // Add new layer based on the file uploaded
  addNewLayer();
});
