export function exportCSV(records) {
    const header = [
      'ATM',
      'Data e Hora',
      'KM In',
      'KM Out',
      'Distância',
      'Notas',
    ];
    const rows = records.map((r) => [
      r.atm,
      new Date(r.dateTime).toLocaleString(),
      r.kmStart,
      r.kmEnd,
      (r.kmEnd - r.kmStart).toFixed(1),
      r.notes || '',
    ]);
  
    let csv = header.join(',') + '\n';
    rows.forEach((row) => { csv += row.map((c) => `"${c}"`).join(',') + '\n'; });
  
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quilometrias.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  export function generatePDF(records) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    doc.setFontSize(16);
    doc.text('Relatório de Quilometragem', 14, 20);
  
    const cols = [
      'ATM',
      'Data e Hora',
      'KM In',
      'KM Out',
      'Distância',
      'Notas',
    ];
    const rows = records.map((r) => [
      r.atm,
      new Date(r.dateTime).toLocaleString(),
      r.kmStart,
      r.kmEnd,
      (r.kmEnd - r.kmStart).toFixed(1),
      r.notes || '',
    ]);
  
    doc.autoTable({
      head: [cols],
      body: rows,
      startY: 30,
      styles: { cellPadding: 2 },
      headStyles: { fillColor: [51, 103, 214] },
    });
  
    doc.save('quilometrias.pdf');
  }