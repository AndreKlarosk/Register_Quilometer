import { addRecord, getRecords, deleteRecord, updateRecord } from './db.js';
import { renderCharts } from './charts.js';
import { renderMap } from './map.js';
import { exportCSV, generatePDF } from './pdf.js';

function applyFilters(records) {
  const atmFilter = document.getElementById('filter-atm').value.trim().toLowerCase();
  const dateFilter = document.getElementById('filter-date').value;
  // se nenhum filtro, não mostra nada
  if (!atmFilter && !dateFilter) return [];

  return records.filter((rec) => {
    const matchATM = atmFilter ? rec.atm.toLowerCase().includes(atmFilter) : true;
    const recDate = rec.dateTime.split('T')[0];
    const matchDate = dateFilter ? recDate === dateFilter : true;
    return matchATM && matchDate;
  });
}

export function renderRecords(records) {
  const container = document.getElementById('records-container');

  if (!records.length) {
    container.innerHTML = '<p>Nenhum registro encontrado.</p>';
    return;
  }

  const rows = records.map((rec) => {
    const dist = (rec.kmEnd - rec.kmStart).toFixed(1);
    const note = rec.notes || '';
    const imgTag = rec.photo
      ? `<img src="${rec.photo}" alt="Foto">`
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
        <td>
          <button class="edit-btn" data-id="${rec.id}">Editar</button>
          <button class="delete-btn" data-id="${rec.id}">Excluir</button>
        </td>
      </tr>`;
  }).join('');

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
          <th>Ações</th>
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
  // Grava novo
  // Grava novo registro
document.getElementById('record-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  navigator.geolocation.getCurrentPosition(async (pos) => {
    // captura da posição atual
    const latitude  = pos.coords.latitude;
    const longitude = pos.coords.longitude;

    // captura dos campos do formulário principal
    const atm      = document.getElementById('atm').value.trim();
    const kmStart  = parseFloat(document.getElementById('km-start').value);
    const kmEnd    = parseFloat(document.getElementById('km-end').value);
    const dateTime = document.getElementById('date-time').value;
    const notes    = document.getElementById('notes').value.trim();

    // captura da foto (se houver)
    const photoFile = document.getElementById('photo').files[0];
    let photoData = '';
    if (photoFile) {
      photoData = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(photoFile);
      });
    }

    // grava no banco de dados
    await addRecord({
      atm,
      kmStart,
      kmEnd,
      dateTime,
      latitude,
      longitude,
      notes,
      photo: photoData
    });

    // reseta o formulário e atualiza a lista
    document.getElementById('record-form').reset();
    loadAndRender();

  }, (err) => {
    alert('Geolocalização falhou: ' + err.message);
  });
});


  // Filtro
  document.getElementById('apply-filters').addEventListener('click', e => {
    e.preventDefault();
    loadAndRender();
  });

  // Export CSV/PDF
  document.getElementById('export-csv').addEventListener('click', async () => {
    const recs = await getRecords(); exportCSV(recs);
  });
  document.getElementById('export-pdf').addEventListener('click', async () => {
    const recs = await getRecords(); generatePDF(recs);
  });

  // Delegação: Editar / Excluir
  const container = document.getElementById('records-container');
  container.addEventListener('click', async (e) => {
    const id = Number(e.target.dataset.id);
    if (e.target.classList.contains('delete-btn')) {
      if (confirm('Deseja excluir este registro?')) {
        await deleteRecord(id);
        loadAndRender();
      }
    } else if (e.target.classList.contains('edit-btn')) {
      const recs = await getRecords();
      const rec = recs.find(r => r.id === id);
      if (rec) openEditModal(rec);
    }
  });

  // Modal de edição
  const editModal = document.getElementById('editModal');
  const closeModalBtn = editModal.querySelector('.close-btn');
  const editForm = document.getElementById('editForm');

  function openEditModal(rec) {
    document.getElementById('edit-id').value = rec.id;
    document.getElementById('edit-atm').value = rec.atm;
    document.getElementById('edit-km-start').value = rec.kmStart;
    document.getElementById('edit-km-end').value = rec.kmEnd;
    document.getElementById('edit-date-time').value = rec.dateTime;
    document.getElementById('edit-notes').value = rec.notes || '';
    document.getElementById('edit-lat').value = rec.latitude;
    document.getElementById('edit-lng').value = rec.longitude;
    document.getElementById('edit-photo-preview').src = rec.photo || '';
    editModal.classList.add('active');
  }

  closeModalBtn.addEventListener('click', () => editModal.classList.remove('active'));
  editModal.addEventListener('click', e => { if (e.target === editModal) editModal.classList.remove('active'); });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id        = Number(document.getElementById('edit-id').value);
    const atm       = document.getElementById('edit-atm').value.trim();
    const kmStart   = parseFloat(document.getElementById('edit-km-start').value);
    const kmEnd     = parseFloat(document.getElementById('edit-km-end').value);
    const dateTime  = document.getElementById('edit-date-time').value;
    const notes     = document.getElementById('edit-notes').value.trim();
    const latitude  = parseFloat(document.getElementById('edit-lat').value);
    const longitude = parseFloat(document.getElementById('edit-lng').value);
    // Foto substituta?
    const photoFile = document.getElementById('edit-photo').files[0];
    let photoData   = document.getElementById('edit-photo-preview').src;
    if (photoFile) {
      photoData = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(photoFile);
      });
    }
    // Atualiza no banco
    await updateRecord(id, { atm, kmStart, kmEnd, dateTime, latitude, longitude, notes, photo: photoData });
    editModal.classList.remove('active');
    loadAndRender();
  });

  // Primeira renderização
  loadAndRender();
});
