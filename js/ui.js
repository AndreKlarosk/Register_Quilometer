import { addRecord, getRecords } from './db.js';
import { renderCharts } from './charts.js';
import { renderMap } from './map.js';
import { exportCSV, generatePDF } from './pdf.js';

function applyFilters(records) {
  const atmFilter = document
    .getElementById('filter-atm')
    .value.trim()
    .toLowerCase();
  const dateFilter = document.getElementById('filter-date').value;

  return records.filter((rec) => {
    const matchATM = atmFilter
      ? rec.atm.toLowerCase().includes(atmFilter)
      : true;
    const recDate = rec.dateTime.split('T')[0];
    return matchATM && (!dateFilter || recDate === dateFilter);
  });
}

export function renderRecords(records) {
  const container = document.getElementById('records-container');

  if (!records.length) {
    container.innerHTML = '<p>Nenhum registro encontrado.</p>';
    return;
  }

  const rows = records
    .map((rec) => {
      const dist = (rec.kmEnd - rec.kmStart).toFixed(1);
      const note = rec.notes || '';
      const imgTag = rec.photo
        ? `<img src="${rec.photo}" alt="Foto" />`
        : '';

      return `
        <tr>
          <td>${rec.atm}</td>
          <td>${new Date(rec.dateTime).toLocaleString()}</td>
          <td>${rec.kmStart}</td>
          <td>${rec.kmEnd}</td>
          <td>${dist}</td>
          <td>${note}</td>
          <td>${imgTag}</td>
        </tr>`;
    })
    .join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ATM</th>
          <th>Data e Hora</th>
          <th>KM In</th>
          <th>KM Out</th>
          <th>Dist</th>
          <th>Notas</th>
          <th>Foto</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

async function loadAndRender() {
  const all = await getRecords();
  const filtered = applyFilters(all);

  renderRecords(filtered);
  renderCharts(filtered);
  renderMap(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('record-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          document.getElementById('lat').value = lat;
          document.getElementById('lng').value = lng;

          const atm = document.getElementById('atm').value.trim();
          const kmStart = parseFloat(
            document.getElementById('km-start').value
          );
          const kmEnd = parseFloat(
            document.getElementById('km-end').value
          );
          const dateTime =
            document.getElementById('date-time').value;
          const notes =
            document.getElementById('notes').value.trim();
          const photoFile =
            document.getElementById('photo').files[0];

          if (kmEnd < kmStart) {
            return alert(
              'KM final deve ser ≥ KM inicial'
            );
          }

          const recordBase = {
            atm,
            kmStart,
            kmEnd,
            dateTime,
            latitude: lat,
            longitude: lng,
            notes,
          };

          if (photoFile) {
            const reader = new FileReader();
            reader.onload = async () => {
              await addRecord({
                ...recordBase,
                photo: reader.result,
              });
              document
                .getElementById('record-form')
                .reset();
              loadAndRender();
            };
            reader.readAsDataURL(photoFile);
          } else {
            await addRecord({
              ...recordBase,
              photo: null,
            });
            document
              .getElementById('record-form')
              .reset();
            loadAndRender();
          }
        },
        (err) =>
          alert(
            'Geolocalização falhou: ' + err.message
          )
      );
    });

  document
    .getElementById('apply-filters')
    .addEventListener('click', (e) => {
      e.preventDefault();
      loadAndRender();
    });

  document
    .getElementById('export-csv')
    .addEventListener('click', async () => {
      const recs = await getRecords();
      exportCSV(recs);
    });

  document
    .getElementById('export-pdf')
    .addEventListener('click', async () => {
      const recs = await getRecords();
      generatePDF(recs);
    });

  loadAndRender();
});
