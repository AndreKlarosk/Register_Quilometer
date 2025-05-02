// map.js - centraliza no usuário e exibe ícone de carrinho na localização atual
const cartIconUrl = 'assets/cart.png';

// Define ícone de carrinho para localização do usuário
const cartIcon = L.icon({
  iconUrl: cartIconUrl,
  iconSize: [32, 32],      // tamanho do ícone
  iconAnchor: [16, 32],    // ponto do ícone correspondente à localização
});

let map;
let markersLayer;
let userMarker;

export function renderMap(records) {
  if (!map) {
    map = L.map('map');

    // Tenta obter e centralizar na localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 13);

          // Adiciona marcador de carrinho se ainda não existir
          if (!userMarker) {
            userMarker = L.marker([latitude, longitude], { icon: cartIcon })
              .bindPopup('Você está aqui!')
              .addTo(map);
          } else {
            userMarker.setLatLng([latitude, longitude]);
          }
        },
        () => {
          // Fallback se falhar
          map.setView([-30.0346, -51.2177], 10);
        }
      );
    } else {
      map.setView([-30.0346, -51.2177], 10);
    }

    // Adiciona camada de tiles e de marcadores
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap' }
    ).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
  }

  // Atualiza marcadores dos registros
  markersLayer.clearLayers();
  records.forEach((r) => {
    if (r.latitude && r.longitude) {
      L.marker([r.latitude, r.longitude])
        .bindPopup(`${r.atm} - ${new Date(r.dateTime).toLocaleString()}`)
        .addTo(markersLayer);
    }
  });
}