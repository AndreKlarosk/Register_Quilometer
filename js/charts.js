let kmChartInstance;
let avgChartInstance;

export function renderCharts(records) {
  const totals = {};
  records.forEach((r) => {
    const day = r.dateTime.split('T')[0];
    totals[day] = (totals[day] || 0) + (r.kmEnd - r.kmStart);
  });

  const labels = Object.keys(totals);
  const data = labels.map((day) => totals[day].toFixed(1));

  // Destruir instâncias anteriores
  if (kmChartInstance) kmChartInstance.destroy();

  kmChartInstance = new Chart(
    document.getElementById('km-chart').getContext('2d'),
    {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'KM por Dia', data, fill: false },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    }
  );

  if (avgChartInstance) avgChartInstance.destroy();

  const avgData = labels.map((_, i) => (data[i] / records.length).toFixed(1));

  avgChartInstance = new Chart(
    document.getElementById('avg-chart').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Média de KM', data: avgData }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    }
  );
}