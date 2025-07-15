const map = L.map('map').setView([coords[1], coords[0]], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 19,
}).addTo(map);

L.marker([coords[1], coords[0]]).addTo(map)
    .bindPopup(mapLocation)
    .openPopup();
