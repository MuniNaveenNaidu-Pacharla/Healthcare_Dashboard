document.addEventListener('DOMContentLoaded', async () => {

    const ctx = document.getElementById('bpChart');

    if (!ctx) {
        console.error('Canvas element #bpChart not found in DOM.');
        return;
    }

    try {
        console.log('Fetching patient data from API...');

        // ── API CALL ─────────────────────────────────────────────
        // Basic auth is base64-encoded "coalition:skills-test"
        const response = await fetch(
            'https://fedskillstest.coalitiontechnologies.workers.dev',
            {
                headers: {
                    Authorization: 'Basic ' + btoa('coalition:skills-test')
                }
            }
        );

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const patients = await response.json();
        console.log('All patients fetched:', patients);

        // ── FIND PATIENT ─────────────────────────────────────────
        const patient = patients.find(p => p.name === 'Jessica Taylor');

        if (!patient) {
            console.error('Patient "Jessica Taylor" not found in API response.');
            return;
        }

        console.log('Patient found:', patient);
        console.log('Diagnosis history:', patient.diagnosis_history);

        // ── SLICE + SORT DATA ────────────────────────────────────
        // API returns newest first, so reverse to get oldest → newest for the chart
        const history = patient.diagnosis_history.slice(0, 6).reverse();
        console.log('Chart history (6 months):', history);

        // X-axis labels: "Oct, 2023" format
        const labels    = history.map(item => `${item.month.substring(0, 3)}, ${item.year}`);
        const systolic  = history.map(item => item.blood_pressure.systolic.value);
        const diastolic = history.map(item => item.blood_pressure.diastolic.value);

        console.log('Labels:',    labels);
        console.log('Systolic:',  systolic);
        console.log('Diastolic:', diastolic);

        // ── UPDATE SIDEBAR METRICS ───────────────────────────────
        // Pull the latest entry (last item after reversing)
        const latest          = history[history.length - 1];
        const latestSystolic  = latest.blood_pressure.systolic.value;
        const latestDiastolic = latest.blood_pressure.diastolic.value;
        const systolicLevel   = latest.blood_pressure.systolic.levels;
        const diastolicLevel  = latest.blood_pressure.diastolic.levels;

        // Patch the two .metric-value spans (systolic first, diastolic second)
        const metricValueEls = document.querySelectorAll('.metric-value');
        if (metricValueEls[0]) metricValueEls[0].textContent = latestSystolic;
        if (metricValueEls[1]) metricValueEls[1].textContent = latestDiastolic;

        // Patch the level labels ("Higher than Average" etc.)
        const metricStatusEls = document.querySelectorAll('.metric-status');
        if (metricStatusEls[0]) metricStatusEls[0].lastChild.textContent = ' ' + systolicLevel;
        if (metricStatusEls[1]) metricStatusEls[1].lastChild.textContent = ' ' + diastolicLevel;

        // ── RENDER CHART ─────────────────────────────────────────
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Systolic',
                        data: systolic,
                        borderColor: '#E66FD2',
                        backgroundColor: 'transparent',
                        pointBackgroundColor: '#E66FD2',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        borderWidth: 3,
                        tension: 0.4
                    },
                    {
                        label: 'Diastolic',
                        data: diastolic,
                        borderColor: '#8C6FE6',
                        backgroundColor: 'transparent',
                        pointBackgroundColor: '#8C6FE6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        borderWidth: 3,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend:  { display: false },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0,
                            minRotation: 0,
                            font: { size: 11 }
                        }
                    },
                    y: {
                        min: 40,
                        max: 200,
                        ticks: {
                            color: '#707070',
                            stepSize: 20,
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.07)'
                        }
                    }
                }
            }
        });

        console.log('Chart rendered successfully.');

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }

});
