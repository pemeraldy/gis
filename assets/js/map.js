$.ajaxSetup({
  headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
  }
});

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
  overlaysArray,
  featureGRP,
  drawController,
  layerData,
  drawnItems,
  drawControl,
  drawStyle,
  measureControl,
  markerCluster,
  layerSearch,
  mainSideBar,
  sites,
  poi,
  searchControl,
  statesLayer,
  lgasLayer,
  bufferCircle,
  cIndicator,
  mapLayers,
  pointS,
  legend;


$(document).ready(function () {
  //init setting
  techMap = L.map('mapid', { zoomControl: false }).setView([6.6088, 3.2545], 9);

  // Scale display at bottom left
  L.control.scale().addTo(techMap)

  //*********** BASE MAP OPTIONS ***********/
  leyerOSM = L.tileLayer.provider('OpenStreetMap')
  techMap.addLayer(leyerOSM)

  baseWaterColor = L.tileLayer.provider('Stamen.Watercolor')
  baseTopo = L.tileLayer.provider('OpenTopoMap')
  baseCartoDB = L.tileLayer.provider('CartoDB.DarkMatter')

  // overlaysArray = [];

  // ######## AJAX data Calls #########
  // Dataset layer
  layerData = L.geoJSON.ajax('/features', {
      'pointToLayer': newPoints,
      onEachFeature: feat1
  }).addTo(techMap);
  // overlaysArray.push(layerData);
  layerData.on('data:loaded', () => {
      techMap.fitBounds(layerData.getBounds());
      console.log(layerData);

  }).addTo(techMap);

  let hMarkerCluster = L.markerClusterGroup()
  layerData.on('data:loaded', () => {
      hMarkerCluster.addLayer(layerData);
  });

  // Saved Map layer
  // layerMap = L.geoJSON.ajax('/featuresmap', {
  //     'pointToLayer': dataMarker,
  // }).addTo(techMap)
  // layerMap.on('data:loaded', () => {
  //     techMap.fitBounds(layerMap.getBounds())
  //     console.log(layerMap)
  // }).addTo(techMap)

  // // PPMV
  // layerPPMV = L.geoJSON.ajax('/data/PPMV.geojson', {
  //     'pointToLayer': dataMarker,
  //     onEachFeature: feat1
  // })
  // layerPPMV.on('data:loaded', () => {
  //     techMap.fitBounds(layerPPMV.getBounds());

  // })

  // // CP
  // layerCP = L.geoJSON.ajax('/data/CP.geojson', {
  //     'pointToLayer': dataMarker,
  //     onEachFeature: feat1
  // })
  // layerCP.on('data:loaded', () => {
  //     techMap.fitBounds(layerCP.getBounds());
  // })

  // // Hospital
  // layerHospital = L.geoJSON.ajax('/data/hospital.geojson', {
  //     'pointToLayer': dataMarker,
  //     onEachFeature: feat1
  // })
  // layerHospital.on('data:loaded', () => {
  //     techMap.fitBounds(layerHospital.getBounds())
  // })

  // // Laboratory
  // layerLaboratory = L.geoJSON.ajax('/data/laboratory.geojson', {
  //     'pointToLayer': dataMarker,
  //     onEachFeature: feat1
  // })
  // layerLaboratory.on('data:loaded', () => {
  //     techMap.fitBounds(layerLaboratory.getBounds())
  // })

  // // lagos State
  // layerLagos = L.geoJSON.ajax('/data/lagos_state.geojson', {
  //     'pointToLayer': dataStyler,
  // })

  // layerLagos.on('data:loaded', () => {
  //     techMap.fitBounds(layerLagos.getBounds())
  // })

  // // lagos State LGA
  // layerLagosLGA = L.geoJSON.ajax('/data/lagos_LGA.geojson', {
  //     'pointToLayer': dataStyler,
  //     onEachFeature: popUpData
  // })

  // layerLagosLGA.on('data:loaded', () => {
  //     techMap.fitBounds(layerLagosLGA.getBounds())
  // })

  // States Layer
  statesLayer = L.geoJSON.ajax('/states', {
      // 'pointToLayer': dataStyler,
      'pointToLayer': dataStyler,
      onEachFeature: feat1,
      style: style
  })
  statesLayer.on('data:loaded', () => {
      // overlaysArray.push(statesLayer)
      // states.fitBounds(states.getBounds())
      console.log(statesLayer);

  })

  // LGAs layer
  lgasLayer = L.geoJSON.ajax('/lgas', {
      'pointToLayer': dataStyler,
      onEachFeature: feat1,
      style: styleOne
  })

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

  // L.Routing.control({
  //     waypoints: [
  //       L.latLng(57.74, 11.94),
  //       L.latLng(57.6792, 11.949)
  //     ]
  //   }).addTo(techMap);

  //   L.control.coordinates({
  //     position:"bottomright", //optional default "bootomright"
  //     decimals:2, //optional default 4
  //     decimalSeperator:".", //optional default "."
  //     labelTemplateLat:"Latitude: {y}", //optional default "Lat: {y}"
  //     labelTemplateLng:"Longitude: {x}", //optional default "Lng: {x}"
  //     enableUserInput:true, //optional default true
  //     useDMS:false, //optional default false
  //     useLatLngOrder: true, //ordering of labels, default false-> lng-lat
  //     markerType: L.marker, //optional default L.marker
  //     markerProps: {}, //optional default {},
  //     labelFormatterLng : function(lng){return lng+" lng"}, //optional default none,
  //     labelFormatterLat : function(lat){return lat+" lat"}, //optional default none
  //     customLabelFcn: function(latLonObj, opts) { "Geohash: " + encodeGeoHash(latLonObj.lat, latLonObj.lng)} //optional default none
  // }).addTo(techMap);

  // When Data Has Successfully Loaded
  // let ppmarkerCluster = L.markerClusterGroup()
  // layerPPMV.on('data:loaded', () => {
  //     ppmarkerCluster.addLayer(layerPPMV)
  //     overlaysArray.push(layerPPMV)

  // })
  // let stateLayer = L.geoJson(null, { onEachFeature: forEachFeature, style: style });

  function forEachFeature(feature, layer) {
      // Tagging each state poly with their name for the search control.
      layer._leaflet_id = feature.properties.statename;

      let popupContent = "<p><b>STATE: </b>" + feature.properties.statename +
          "</br>REGION: " + feature.properties.statecode

      layer.bindPopup(popupContent);

      layer.on("click", function (e) {
          layer.setStyle(style2); //resets layer colors
          layer.setStyle(highlight);  //highlights selected.
      });
  }

  // stateLayer.addTo(techMap);

  // Draw controller
  drawnItems = new L.FeatureGroup();
  techMap.addLayer(drawnItems);
  // console.log(drawnItems)
  // let drawned = new L.FeatureGroup()
  // drawned.addTo(techMap)

  baseLayers = {
      "Open Street Map": leyerOSM,
      "Base Topo Map": baseTopo,
      "Carto DB": baseCartoDB,
      "Water Color": baseWaterColor
  }

  overlays = {
      "States": statesLayer,
      "LGAs": lgasLayer,
      // "Lagos": layerLagos,
      // "LagosLGAs": layerLagosLGA,
      // "PPMV": layerPPMV,
      // "CP": layerCP,
      // "Hospital": layerHospital,
      // "Laboratory": layerLaboratory,
      "Dataset": layerData,
      // "Saved Map": layerMap,
      "Draw Layer": drawnItems
  }

  // baseMapContoller = L.control.layers(baseLayers, overlays, {
  //     collapse: false,
  //     expand: true
  // })
  let poi = L.layerGroup([overlays["Dataset"]]);
  searchControl = L.control.search({
      layer: poi,
      initial: false,
      propertyName: 'name',
      hideMarkerOnCollapse: true,
      marker: {
          icon: new L.Icon({ iconUrl: '/assets/firstaid.png', iconSize: [20, 20] }),
          circle: {
              radius: 20,
              color: '#f41642',
              opacity: 1
          }
      },
      moveToLocation: function (latlng, title, techMap) {
          // techMap.fitBounds( latlng.layer.getBounds() );
          // console.log(latlng, title, techMap)
          // var zoom = techMap.getBoundsZoom(latlng.layer.getBounds());
          techMap.flyTo(latlng, 18); // access the zoom

      }
  })

  searchControl.on('search:locationfound', function (e) {

      console.log(e)
      let marker = new L.Marker(new L.latLng(e.latlng))

      statesLayer.eachLayer(function (layer) {
          statesLayer.resetStyle(layer);
      });

      // poi.addLayer(marker)

      // e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
      if (e.layer._popup)
          e.layer.openPopup();

  }).on('search:collapsed', function (e) {

      statesLayer.eachLayer(function (layer) {	//restore feature color
          statesLayer.resetStyle(layer);
      });

  });



  techMap.addControl(searchControl)
  // console.log(drawnItems)

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
  measure = L.control.polylineMeasure().addTo(techMap);

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
          marker: true,
          polyline: true,
      },
      edit: {
          featureGroup: drawnItems,
          remove: true,
          buffer: {
              replacePolylines: false,
              separateBuffer: false,
          },
      },

  });

  //Add draw control to map
  techMap.addControl(drawControl);

  L.Util.VincentyConstants = {
      a: 6378137,
      b: 6356752.3142,
      f: 1 / 298.257223563
  };
  function destinationVincenty(lonlat, brng, dist) { //rewritten to work with leaflet

      var u = L.Util;
      var ct = u.VincentyConstants;
      var a = ct.a, b = ct.b, f = ct.f;
      var lon1 = lonlat.lng;
      var lat1 = lonlat.lat;
      var s = dist;
      var pi = Math.PI;
      var alpha1 = brng * pi / 180; //converts brng degrees to radius
      var sinAlpha1 = Math.sin(alpha1);
      var cosAlpha1 = Math.cos(alpha1);
      var tanU1 = (1 - f) * Math.tan(lat1 * pi / 180 /* converts lat1 degrees to radius */);
      var cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
      var sigma1 = Math.atan2(tanU1, cosAlpha1);
      var sinAlpha = cosU1 * sinAlpha1;
      var cosSqAlpha = 1 - sinAlpha * sinAlpha;
      var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
      var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
      var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
      var sigma = s / (b * A), sigmaP = 2 * Math.PI;
      while (Math.abs(sigma - sigmaP) > 1e-12) {
          var cos2SigmaM = Math.cos(2 * sigma1 + sigma);
          var sinSigma = Math.sin(sigma);
          var cosSigma = Math.cos(sigma);
          var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
              B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
          sigmaP = sigma;
          sigma = s / (b * A) + deltaSigma;
      }
      var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
      var lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
          (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
      var lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
      var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
      var lam = lambda - (1 - C) * f * sinAlpha *
          (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
      var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing
      var lamFunc = lon1 + (lam * 180 / pi); //converts lam radius to degrees
      var lat2a = lat2 * 180 / pi; //converts lat2a radius to degrees

      return L.latLng(lamFunc, lat2a);

  };

  function createGeodesicPolygon(origin, radius, sides, rotation, projection) {

      var latlon = origin; //leaflet equivalent
      var angle;
      var new_lonlat, geom_point;
      var points = [];

      for (var i = 0; i < sides; i++) {
          angle = (i * 360 / sides) + rotation;
          new_lonlat = destinationVincenty(latlon, angle, radius);
          geom_point = L.latLng(new_lonlat.lng, new_lonlat.lat);

          points.push(geom_point);
      }

      return points;
  };


  techMap.on('draw:created', function (e) {
      let type = e.layerType,
          layer = e.layer

      if (type === 'circle') {
          layer.bindTooltip('<b>Radius: </b>' + (layer._mRadius / 1000).toFixed(3) + ' km');
          // console.log(layer._mRadius, e, layer)
          var origin = layer.getLatLng(); //center of drawn circle
          var radius = layer.getRadius(); //radius of drawn circle
          var projection = L.CRS.EPSG4326;
          var polys = createGeodesicPolygon(origin, radius, 60, 0, projection); //these are the points that make up the circle
          var polygon = []; // store the geometry
          for (var i = 0; i < polys.length; i++) {
              var geometry = [polys[i].lat, polys[i].lng];
              polygon.push(geometry);
          }
          var cpolygon = L.polygon(polygon);
          drawnItems.addLayer(cpolygon);
      }
      else if (type === 'rectangle') {
          layer.bindTooltip('width: ' + e.sourceTarget._size.x + 'km <br/> Height ' + e.sourceTarget._size.y + 'km');
          // console.log(e, layer, e.sourceTarget._size)
          drawnItems.addLayer(layer);

      }
      else if (type === 'polygon') {
          layer.bindTooltip('');
          // console.log(layer)
          drawnItems.addLayer(layer);


      }
      // else if (type === 'polyline') {
      //     var line = layer.toGeoJSON();
      //     console.log(line);

      //     var lines = summarisePointsByLine(line,0.8,layerData.toGeoJSON(),'name');
      //     var sum = summariseArray(lines.features[0].properties.statusVals);
      //     strpopup = "Hospitals";
      //     for (var i=0; i<sum[0].length;i++){
      //         strpopup+="<br>"+sum[0][i]+":"+sum[1][i];
      //     }
      //     drawnItems.addLayer(layer.bindPopup(strpopup));

      // }
      // cHECKING IF ITS A MARKER AND TRIGGRED
      else if (e.layerType === 'marker' && bufferMode.classList.contains('active')) {
          if (bufferCircle) {
              techMap.removeLayer(bufferCircle)

          }

          if (cIndicator) {
              techMap.removeLayer(cIndicator)
          }

          let marker_lat_long = e.layer._latlng
          // console.log(marker_lat_long)
          let radius = milesToMeters($('#radiusSelected').val());

          bufferCircle = L.circle(marker_lat_long, radius)
          // console.log(bufferCircle)
          bufferCircle.addTo(techMap);

          // Calculate the number of eco icons within the circle
          // So we can put it on the DOM
          pointsInCircle(bufferCircle, radius)

          // Make the marker draggable
          console.log(e.layer)
          e.layer.dragging.enable();

          // If you drag the marker, make sure the circle goes with it
          e.layer.on('dragend', function (event) {
              techMap.setView(event.target.getLatLng());
              bufferCircle.setLatLng(event.target.getLatLng());

              // Clear out results
              // $('#ofi_paf').html('');

              // This will determine how many markers are within the circle
              pointsInCircle(bufferCircle, milesToMeters($('#radius-selected').val()));

              // Redraw: Leaflet function
              bufferCircle.redraw();
          });
      }
      else {
          drawnItems.addLayer(layer);
      }

      // let newGeo = JSON.stringify(layer.toGeoJSON())

  });


  // drawStyle = L.control.styleEditor().addTo(techMap)

  // Measure area and line
  measureControl = new L.Control.Measure({ position: 'topright', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters' });
  let oldContainer = measureControl.getContainer()
  let newMeasureToolCont = document.querySelector('#pills-contact');
  // newMeasureToolCont.append(oldContainer);
  measureControl.addTo(techMap);

  // #########LEGEND TEMPLATES ###########

  // ######### Feature INfo Bar ###########

  /*Legend specific*/
  legend = L.control({ position: "bottomleft" });

  legend.onAdd = function (featPoint) {
      let div = L.DomUtil.create("div", "legend trans-open");
      if (featPoint == undefined) {
          return false
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

                      </div>`

          return div;
      }
  };

  legend.addTo(techMap);

  // ********UTILITY SIDEBAR******

  // mainSideBar = L.control({ position: "bottomright" });

  // mainSideBar.onAdd = function () {
  //     var div = L.DomUtil.create("div", "main-side-bar slide-left");
  //     div.innerHTML += `<h4>Utilities</h4>`;
  //     div.innerHTML += `<div class='anchor'>&lt</div>`;
  //     div.innerHTML += `<div class="accordion" id="accordionExample">`
  //     div.innerHTML += `<div class="card ">
  //     <div class="card-header" id="headingOne">
  //     <h2 class="mb-0">
  //         <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
  //         Buffer Area
  //         </button>
  //     </h2>
  //     </div>

  //     <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
  //     <div class="card-body">
  //         Anim p
  //     </div>
  //     </div>
  // </div>`
  //     div.innerHTML += `<div class="card">
  //     <div class="card-header" id="headingTwo">
  //     <h2 class="mb-0">
  //         <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
  //         Query Search
  //         </button>
  //     </h2>
  //     </div>
  //     <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
  //     <div class="card-body">
  //         Buffer Area
  //     </div>
  //     </div>
  // </div>`
  //     div.innerHTML += `</div>`
  //     div.innerHTML += `</div>`         //end div for query side bar


  //     return div;
  // };
  // mainSideBar.addTo(techMap); //Add created side bar to map

  // Control slide in n out of infoBars
  // const inforBarState = (el, togglClass) => {
  //     let element = document.querySelector(`.${el}`)
  //     element.classList.toggle(`${togglClass}`)
  // }

  // Base Map activators
  document.getElementById('osm').addEventListener('click', () => {
      L.tileLayer.provider('OpenStreetMap').addTo(techMap)
  })
  document.getElementById('cartoDb').addEventListener('click', () => {
      L.tileLayer.provider('CartoDB.DarkMatter').addTo(techMap)
  })
  document.getElementById('openTopo').addEventListener('click', () => {
      L.tileLayer.provider('OpenTopoMap').addTo(techMap)
  })

  const anchor = document.querySelector('.anchor') //anchor button on legend bar
  anchor.addEventListener('click', () => inforBarState('legend', 'trans-open'))

  options = {
      icon: 'clinic-medical',
      iconShape: 'marker'
  };
  const freshMark = L.marker([48.13710, 11.57539], {
      icon: L.BeautifyIcon.icon(options),
      draggable: false
  }).addTo(techMap).bindPopup("popup").bindPopup("This is a BeautifyMarker");

  techMap.on('click', function (e) {
      // let attr = json.properties
      console.log(e)

  });

  fillLayer()
  bufferLayerGen()

  // autofill the share buttons
  document.querySelector('#fb_share').setAttribute('href', 'http://www.facebook.com/share.php?u=' + encodeURIComponent(location.href))
  document.querySelector('#tw_share').setAttribute('href', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(location.href))
  document.querySelector('#copy_url').setAttribute('value', location.href)

})


// ############# GLOBLA SCOPE -- OUTSIDE IFFE##############

// toggle Draw Controller
function toggleDraw() {
  drawControl._container.style.display = drawControl._container.style.display == 'none' ? 'flex' : 'none'
}

// TOGGLE SIDE BARS
const inforBarState = (el, togglClass) => {
  let element = document.querySelector(`.${el}`)
  element.classList.toggle(`${togglClass}`)
}

const sideAnchor = document.querySelector('.sidebar-anchor') //anchor button on legend bar

sideAnchor.addEventListener('click', () => inforBarState('map-sidebar', 'side-open'))






//  display data attributes and control data presentations
function dataMarker(json, latlng, options) {
  options = {
      color: 'red'
  }
  let attr = json.properties
  // console.log(json)
  if (attr.type == 'PPMV') {
      return L.marker(latlng, {
          icon: myIcon,
      }).bindTooltip(`<b>Name:${attr.name}</b> <br>
          Address: ${attr.address} <br>
          `, { direction: 'top' }).bindPopup(attr.name)

  } else {
      return L.marker(latlng, {
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
              <b>Name:${attr.name}</b>
                  <br>
              <i class="fas fa-home"></i> Address: ${attr.address}
              <br>
              Wardcode: <i class="text-primary"> ${attr.state}</i>
          </div>
      `, { direction: 'side' })
}

function popUpData(feature, ltlng) {
  let feat = feature
  let att = feature.properties
  let res = []
  if (att) {
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
  let thecoords = coords.toString().split(',');
  let lat = thecoords[1];
  let lng = thecoords[0];
  console.log('click mark', clickmark)
  //if prior marker exists, remove it.
  if (clickmark != undefined) {
      techMap.removeLayer(clickmark);
  };

  clickmark = L.circleMarker([lat, lng], {
      radius: 8,
      //opacity: 1,
      color: "yellow",
      fillColor: "yellow",
      fillOpacity: 0.8
  }
  ).addTo(techMap);
}
// end of code for click marker.



function feat1(feature, layer) {
  feature.layer = layer

  let bd = document.querySelector('.legend-content .card-body .card-text')
  // console.log('layer:',layer)

  layer.on('click', e => {
      let coords = e.target.feature.geometry.coordinates
      let props = feature.properties
      document.querySelector('.legend').classList.remove('trans-open')
      // console.log(props)

      if (feature.geometry.type == "MultiPolygon") {
          color.type = 'color'
          console.log(layer)

          bd.innerHTML = ""
          for (let key in props) {

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
          fillColor.addEventListener('change', () => {

              layer.setStyle({
                  fillColor: fillColor.value
              })
          })

          fillOpacity.addEventListener('change', () => {


              layer.setStyle({
                  fillOpacity: fillOpacity.value
              })

          })

      } else if (feature.geometry.type == "Point" || "MultiPoint") {
          onMapClick(coords)
          // console.log(feature.properties)
          delete props.file_id;
          delete props.geometry;
          delete props.created_at;
          delete props.updated_at;
          // bd.innerHTML = ' <img src='+props.photo+' alt="feature photo" class="img-responsive"/>'
          bd.innerHTML = '<h3>' + props.name + '</h3>'
          delete props.name;

          for (let key in props) {

              let value = props[key]
              if (key === 'photo') {
                  bd.innerHTML += `<div><b> ${key}</b>: <a href='${value}' target="_blank">click here</a></div>`
              } else {

                  bd.innerHTML += `<div><b> ${key}</b>: ${value}</div>`

              }
          }
          // bd.innerHTML += `
          //     <div class="custom-control custom-checkbox mr-sm-2">
          //         <label for="marker"> Change marker</label>
          //         <input id="marker" type="text" list="marker-list" value>
          //         <datalist id="marker-list">
          //             <!-- popluate list of icons -->
          //             <option value="1">
          //             <option value="2">
          //         </datalist>
          //     </div>
          // `

      } else {
          document.querySelector('.legend-content').innerHTML = `
          <h2>Click a Layer to display properties</h2>
          `
      }

  })
}

/*********HELPER FUNCs FOR INFO DIV************/

//fill container with a list of loaded layers
function fillLayer() {
  document.querySelector('#pills-profile').innerHTML = ''

  for (key of Object.keys(overlays)) {
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
function loadLayer(e) {
  // if a layer is not active, add the class active and also add to Map else do d opp
  // if(e.target !== 'div'){ return}
  // console.log(e)
  e.target.classList.contains('inactive') ? techMap.addLayer(overlays[e.target.innerText]) : techMap.removeLayer(overlays[e.target.innerText])
  e.target.classList.toggle('inactive')
  e.target.lastElementChild.classList.toggle('fa-check-square')
  e.target.lastElementChild.style.fontSize = '22px'
  // console.log(e.target.lastElementChild)
}


function callModal(e) {
  let call = document.querySelector("a[data-target] ")
  let modalTitle = document.querySelector('#customize .modal-title')
  let layerName = e.target.parentElement.innerText
  // modalTitle = `${modalTitle.innerText} ${e.target.parentElement.innerText}`
  document.querySelector(" .map-sidebar").classList.add('side-open')

  // console.log(e.target.parentElement.innerText)
  call.click()
  modalTitle.innerText = ''
  modalTitle.innerText = `${layerName}`
  // console.log(modalTitle)
  return layerName
}

const mapThumb = document.querySelectorAll('.map-thumb')

// TOGGLE ACTIVE CLASS FOR BASE MAPS
mapThumb.forEach(thum => {

  thum.addEventListener('click', function (e) {

      mapThumb.forEach(thum => thum.classList.remove('base-active'))
      thum.classList.toggle('base-active')

  })

})

// SIDE BAR crumbs BUTTONS
const sideBarBtns = document.querySelectorAll('.sidebar .nav-link')
const sideBarHeader = document.querySelector('.sidebar-header')
sideBarBtns.forEach(btn => {
  // Set Header of Side Bar on CLick of BTNS
  btn.addEventListener('click', (e) => { sideBarHeader.innerText = btn.innerText })

})

// Layer Edit functions
const modalFormValues = () => {
  // let iconList = editLayerModalForm.iconList.value
  let fillColor = editLayerModalForm.fillColor.value
  let fillOpacity = editLayerModalForm.fillOpacity.value
  console.log(fillColor, fillOpacity)
  return {
      fillColor: fillColor,
      fillOpacity: fillOpacity
  }

  // changePoints("Hospital", points )
}


// const editLayerModalForm = document.getElementById('editLayer')
// // console.log(editLayerModalForm)

// const saveCustomize = document.getElementById('saveCustomize')
// saveCustomize.addEventListener('click', changePoints)



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


function newPoints(json, latlng) {
  let attr = json.properties
  options = {
      icon: 'home',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      // iconShape: 'marker'
  };
  return L.marker(latlng, {
      icon: L.BeautifyIcon.icon(options),
      draggable: false
  }).bindTooltip(`<b>${attr.name}</b> <br>
  Address: ${attr.address} <br>
  `, { direction: 'auto' }).bindPopup(attr.name)
}

function points(json, latlng, options) {

  let attr = json.properties
  // console.log(json)

  var options = {
      icon: 'hospital-alt',
      iconShape: 'marker',
      borderColor: '#b3334f',
      textColor: '#b3334f',
      //  iconSize: [40,40],
      // innerIconStyle: 'font-size:20px; margin:10px auto'
  };
  return L.marker(latlng, {
      icon: L.BeautifyIcon.icon(options),
      draggable: false
  })
      .bindTooltip(`<b>Name:${attr.name}</b> <br>
      Address: ${attr.address} <br>
      `, { direction: 'top' }).bindPopup(attr.name)


}
console.log(myIcon)
/* LINK THE SEARCH INPUT WITH LEAFLET SEARCH PLUGIN */
$('#autocomplete').on('keyup', function (e) {

  searchControl.searchText(e.target.value);

})

function changePoints(layer, pointFunc) {
  techMap.removeLayer(overlays[`${layer}`])
  overlays[`${layer}`].options.pointToLayer = null
  overlays[`${layer}`].options.pointToLayer = pointFunc

  overlays[`${layer}`].refresh()


  techMap.addLayer(overlays[`${layer}`])

  console.log(overlays[`${layer}`])
}

const ptSymbol = document.getElementById('ptSymbol')
const ptSize = document.getElementById('ptSize')
const ptFill = document.getElementById('ptFill')

const ptOpacity = document.getElementById('ptOpacity')


const ptStrokeOp = document.getElementById('ptStrokeOp')
const ptStrokeW = document.getElementById('ptStrokeW')
const ptSolid = document.getElementById('ptSolid')
const ptDash = document.getElementById('ptDash')

ptOpacity.addEventListener('change', () => ptSymbol.style.opacity = ptOpacity.value)
const ptStroke = document.getElementById('ptStroke')

ptFill.addEventListener('change', () => ptSymbol.style.background = ptFill.value)

// ptStroke.addEventListener('change', ()=>{
//     console.log(ptStroke.value)
//     if(ptSolid.checked){ ptSymbol.style.border = `${ptStrokeW.value}px  solid  ${ptStroke.value}` }
//     if(ptDash.checked){ ptSymbol.style.border = `${ptStrokeW.value}px  dotted  ${ptStroke.value}` }
// })
// ptStrokeW.addEventListener('change', ()=>{
//     if(ptSolid.checked){ ptSymbol.style.border = `${ptStrokeW.value}px  solid  ${ptStroke.value}` }
//     if(ptDash.checked){ ptSymbol.style.border = `${ptStrokeW.value}px  dotted  ${ptStroke.value}` }
// })
/****** MAP MODAL STYLING *******/
// ######POINTS
function returnPointValues() {
  const ptSize = document.getElementById('ptSize')
  const ptFill = document.getElementById('ptFill')
  const ptOpacity = document.getElementById('ptOpacity')
  // const ptStroke = document.getElementById('ptStroke')
  // const ptStrokeW  = document.getElementById('ptStrokeW')
  // const ptSolid = document.querySelector('input[name="ptStrokeType"]:checked').value
  // const ptDash = document.getElementById('ptDash')

  const ptOptions = {
      ptSize: ptSize.value,
      ptFill: ptFill.value,
      ptOpacity: ptOpacity.value,
      // ptStroke: ptStroke.value,
      // ptStrokeOp: ptStrokeOp.value,
      // ptSolid: ptSolid,
      // ptStrokeW: ptStrokeW.value

  }
  return ptOptions
}
// Button to effect point changes
const savePtCustomize = document.getElementById('savePtCustomize')

savePtCustomize.addEventListener('click', () => {

  const layer = document.getElementById('customizeLabel').innerText
  changePoints(layer, pointStyler)


  console.log(returnPointValues())
  document.getElementById('ptmodalClose').click()
})

// FUNCTION THAT STYLES POINTS ONLY
function pointStyler(json, latlng, val) {
  let attr = json.properties
  val = returnPointValues()
  options = {
      iconShape: 'circle-dot',
      iconSize: [val.ptSize, val.ptSize],
      // borderWidth: val.ptStrokeW,
      // borderColor: val.ptStroke,
      borderStyle: val.ptSolid,
      backgroundColor: val.ptFill,
  };
  return L.marker(latlng, {
      icon: L.BeautifyIcon.icon(options),
      draggable: false,
      opacity: val.ptOpacity
  }).bindTooltip(`<b>${attr.name}</b> <br> Address: ${attr.address} <br>
  `, { direction: 'auto' }).bindPopup(attr.name)
}


// FUNCTION TO STYLE ICONS
function iconStyler(json, latlng) {
  let attr = json.properties
  val = returnIconValues()
  options = {
      icon: val.icon,
      borderColor: 'transparent',
      textColor: val.textColor,
      backgroundColor: val.backgroundColor,
      iconSize: val.iconSize,
      innerIconStyle: val.innerIconStyle,
      // iconShape: ''
  };
  return L.marker(latlng, {
      icon: L.BeautifyIcon.icon(options),
      draggable: false,
  }).bindTooltip(`<b>${attr.name}</b> <br> Address: ${attr.address} <br>
  `, { direction: 'auto' }).bindPopup(attr.name)
}

// Icon FORM VALUES
function returnIconValues() {
  const icon = document.getElementById('iconType')
  const iconColor = document.getElementById('iconColor')
  const iconSize = document.getElementById('iconSize')
  // const iconBg = document.getElementById('iconBg')
  // const iconStroke  = document.getElementById('iconStroke')
  // const iconStrokeSize  = document.getElementById('iconStrokeSize')
  const sele = document.getElementById('add_Layer');
  // var layerNy= sele.options[sele.selectedIndex].text;
  var layerIDy = sele.options[sele.selectedIndex].value;
  dataid = layerIDy
  console.log("dataid: " + dataid);
  // pointS = [];
  pointS[layerIDy] = {
      icon: icon.value,
      textColor: iconColor.value,
      // backgroundColor: iconBg.value,
      iconSize: [Number(iconSize.value), Number(iconSize.value)],
      innerIconStyle: `font-size:${Math.floor(Number(iconSize.value) / 2)}px; padding:${Math.floor(Number(iconSize.value) / 5)}px;`
  }
  console.log(pointS);
  const iconOptions = {
      icon: icon.value,
      textColor: iconColor.value,
      // backgroundColor: iconBg.value,
      iconSize: [Number(iconSize.value), Number(iconSize.value)],
      // borderWidth: iconStrokeSize.value,
      // borderColor: iconStroke.value,
      innerIconStyle: `font-size:${Math.floor(Number(iconSize.value) / 2)}px; padding:${Math.floor(Number(iconSize.value) / 5)}px;`
  }
  return iconOptions
}


const saveIconCustomize = document.getElementById('saveIcon')

saveIconCustomize.addEventListener('click', () => {

  const layer = document.getElementById('customizeLabel').innerText
  changePoints(layer, iconStyler)
  // changePoints('Dataset',iconStyler)
  // console.log( returnPointValues() )
  document.getElementById('cancelIcon').click()
})


// TRY TURF AFRESH
// var point = turf.point([-90.548630, 14.616599]);
// var buffered = turf.buffer(point, 500, {units: 'miles'})
// buffered.addTo(techMap)

// BUFER BUFFER!!!
// Convert miles to meters to set radius of circle
function milesToMeters(miles) {
  return (miles * 1069.344) / 1
}

// figures out how many points are i a circle
function pointsInCircle(circle, meters_user_set, bufferLayer) {

  let bd = document.querySelector('.legend-content .card-body .card-text')
  let counts = document.createElement('div')

  counts.classList.add('count')
  bd.parentElement.parentElement.parentElement.parentElement.classList.remove('trans-open')
  bufferLayer = document.querySelector('#bufferLayer').value

  // if(cIndicator){
  //     console.log('Somen is here')
  //     techMap.removeLayer(cIndicator)

  // } else{console.log('we gat nothn')}

  if (bufferCircle !== undefined) {

      // Lat, long of circle
      circle_lat_long = bufferCircle.getLatLng();

      let counter_points_in_circle = 0;
      bd.innerHTML = ' '
      bd.appendChild(counts)
      // Loop through each point in JSON file
      overlays[`${bufferLayer}`].eachLayer(function (layer) {
          // Lat, long of current point
          layer_lat_long = layer.getLatLng();

          // Distance from our circle marker
          // To current point in meters
          distance_from_layer_circle = layer_lat_long.distanceTo(circle_lat_long);

          // See if meters is within raduis
          // The user has selected
          if (distance_from_layer_circle <= meters_user_set) {
              counter_points_in_circle += 1
              console.log(layer)
              console.log(layer.feature.properties.name)
              // console.log('layer',layer)

              // cIndicator = L.circle(layer._latlng, {
              //     color: 'red',
              //     fillColor: '#f03',
              //     fillOpacity: 0.5,
              //     radius: 0
              //   }).addTo(techMap);
              let lat = layer.feature.layer._latlng.lat
              let lng = layer.feature.layer._latlng.lng
              bd.innerHTML += ` <p class="buffer-points" > ${layer.feature.properties.name} <span class="lat" style="display:none">${lat}</span> <span class="lng" style="display:none">${lng}</span> <br/>
                                      <b>Distance:  ${(distance_from_layer_circle * 0.000621371).toFixed(2)}  miles / ${(distance_from_layer_circle / 1000).toFixed(2)} Km</b>

                </p> `

          }

      });
      console.log(counts)
      document.querySelector('.count').innerHTML = `<h4> ${counter_points_in_circle} points within buffer radius </h4>`
      // Set number of results on main page
      // $('#ofi_paf_results').html(counter_points_in_circle);
      let l = document.querySelector('.legend')
      l.addEventListener('click', (e) => {
          if (e.target.tagName === 'P') {
              let lat = e.target.firstElementChild.innerText
              let lng = e.target.firstElementChild.nextElementSibling.innerText
              console.log(e.target.innerText)
              techMap.flyTo([lat, lng], 18)
          }

      })
  }
  // Close pointsInCircle
};



const bufferMode = document.getElementById('bufferMode')
bufferMode.addEventListener('click', (e) => {
  let btn = e.target
  bufferLayer = document.querySelector('#bufferLayer').value
  if (bufferLayer === '') {
      alert('Select a layer')
      return false
  }

  e.target.classList.toggle('active')
  btn.innerText = btn.classList.contains('active') ? 'Stop buffer' : 'buffer'
  // e.target.innerText = 'Buffer activated'
  if (bufferCircle && !btn.classList.contains('active')) {
      techMap.removeLayer(bufferCircle)
  }

})

// Buffer Layer generator
function bufferLayerGen() {

  let bl = document.querySelector('#bufferLayer')

  for (key of Object.keys(overlays)) {
      let option = document.createElement('option')

      option.innerText = key
      option.value = key

      bl.append(option)

  }
}

// Testing to add a new layer dynamically
addNewLayer = (layerID) => {
  if (layerID === undefined) {
      const sel = document.getElementById('add_Layer');
      var layerN = sel.options[sel.selectedIndex].text;
      var layerID = sel.options[sel.selectedIndex].value;
  } else {
      return new Promise((resolve, reject) => {
          console.log("layerid:" + layerID);
          $.ajax({
              type: 'POST',
              url: '/layerName',
              data: {
                  id: layerID,
              },
              success: function (data) {
                  //    layerN = data;
                  resolve(data);
                  let bl = document.querySelector('#bufferLayer')
                      let option = document.createElement('option')

                      option.innerText = data.name
                      option.value = data.name

                      bl.append(option)
                  },
                  error: function (xhr, status, error) {
                      alert('Error:' + xhr.responseText);
                  }
              })
      })
  }
  const sampleData = L.geoJSON.ajax("map/" + layerID, {
      pointToLayer: dataStyler,
      onEachFeature: feat1
  });
  overlays[layerN] = sampleData;
  techMap.addLayer(overlays[layerN]);
  mapLayers += layerID;
  mapLayers += ",";
  fillLayer();
  document.getElementById('layerClose').click()
};
//   const addNewLayerBtn = document.querySelector(".add-layer");
//   addNewLayer.addEventListener("click", () => {
// call a modal with dropzone
// add new layer to search group
//   poi.addLayer(overlays[layerN]);
//   });

// save drawn items layer
$(".save-map").click(function (e) {
  var name = document.getElementById("mapname").value;
  geometry = drawnItems.toGeoJSON();
  if (mapLayers != undefined) {
      mapLayers = mapLayers.substring(9, mapLayers.length - 1);
  } else {
      return alert('Please add a layer');
  }
  console.log(mapLayers);
  if (name == '') {
      return alert('Map name is required');
  }
  data = {
      'name': name,
      'geometry': geometry,
      'layers': mapLayers,
      'point_style': pointS,
  }
  console.log('point_style:' + pointS);
  $.ajax({
      type: 'POST',
      url: '/drawnSave',
      data: data,
      success: function (data) {
          alert(data.success);
      },
      error: function (xhr, status, error) {
          alert('Error:' + xhr.responseText);
      },
  });
});

// map print
$("#print_m").on("click", function (e) {
  // prevent the link from taking any action
  event.preventDefault();

  // call the browser print function
  window.print();
});

// map image
$("#image_m").on("click", function (e) {
  // prevent the link from taking any action
  event.preventDefault();
  var mapElement = $("#mapid")[0];

  // perform the conversion
  html2canvas(mapElement, {
      // required otherwise the map will be blank
      useCORS: true,
      onrendered: function (canvas) {
          var url = canvas.toDataURL();
          $("<a>", {
              href: url,
              download: "Map"
          })
              .on("click", function () { $(this).remove() })
              .appendTo("body")[0].click()
      }
  });
});

// Download layer as geojson
document.getElementById('geojson_m').onclick = function (e) {
  // Extract GeoJSON from featureGroup
  var data = layerData.toGeoJSON();

  // Stringify the GeoJSON
  var convertedData = 'text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(layerData));

  // Create export
  document.getElementById('geojson_m').setAttribute('href', 'data:' + convertedData);
  document.getElementById('geojson_m').setAttribute('download', 'data.geojson');
}

// Download as KML
document.getElementById('kml_m').onclick = function (e) {
  var data = layerData.toGeoJSON();
  var kml = tokml(layerData);

  var convertedData = 'application/xml;charset=utf-8,' +
      encodeURIComponent(kml);

  // if you want to use the official MIME type for KML
  // var convertedData = 'application/vnd.google-earth.kml+xml;charset=utf-8,'+
  // encodeURIComponent(kml);
  document.getElementById('kml_m').setAttribute('href', 'data:' + convertedData);
  document.getElementById('kml_m').setAttribute('download', 'data.kml');
}

// search layer
$(".search").click(function (e) {
  e.preventDefault();
  var search = document.getElementById("search").value;
  if (search == '') {
      return alert('Please input feature name');
  }
  // console.log(search);
  page = window.location.pathname + '/' + search;
  $.ajax({
      type: 'POST',
      url: '/search/' + search,
      data: search,
      success: function (status) {
          document.querySelector('#status').innerHTML = status;
          if (status == 'Not Found') {
              alert(data.status);
          } else {
              history.pushState(null, null, window.location.pathname);
              // history.replaceState(null, null, window.location.pathname);
              window.location.replace(page);
              // document.querySelector('#back').setAttribute();
          }
          // location.reload(true);
      },
      error: function (xhr, status, error) {
          alert(xhr.responseText);
          document.querySelector('#status').innerHTML = 'Error:' + xhr.responseText

      },
  });
});

// Search map on enter key
var input = document.getElementById("search");
if (input != null) {
  input.addEventListener("keyup", function (event) {
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          document.getElementById("searchbtn").click();
      }
  })
};

// copy URL
$("#copy_url_btn").click(function (e) {
  /* Get the text field */
  var copyText = document.getElementById("copy_url");

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/

  /* Copy the text inside the text field */
  document.execCommand("copy");

  /* Alert the copied text */
  document.getElementById("copy_url_btn").innerHTML = 'Copied';
});

// buffering by polyline
// function summarisePointsByLine(line, radius, fcpoint, prop){
//     var buf = turf.buffer(line, radius, 'kilometers');
//     buf = turf.featureCollection([buf]);
//     buf = turf.collect(buf, fcpoint, prop+"Vals");
//     return buf;
// }
// function summariseArray(ar){
//     var arUnique = [];
//     var arCount = [];
//     for (var i=0; i<ar.length; i++){
//         var idx = arUnique.indexOf(ar[i]);
//         if (idx<0){
//             arUnique.push(ar[i]);
//             arCount.push(1);
//         } else {
//             arCount[idx] += 1;
//         }
//     }
//     return [arUnique, arCount];
// }
