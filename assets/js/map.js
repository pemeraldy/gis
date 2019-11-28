let map = L.map('mapid').setView([51.505, -0.09], 9);

      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);