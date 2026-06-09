import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── EXPORT PATIENTS ──────────────────────────
export const exportPatientsPDF = (patients) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MediConnect', 14, 15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Patient Report', 14, 23);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 23);

  // Table
  autoTable(doc, {
    startY: 40,
    head: [['#', 'Full Name', 'Email', 'Phone', 'Gender', 'Blood Group', 'Emergency Contact']],
    body: patients.map((p, i) => [
      i + 1,
      p.fullName || '—',
      p.email || '—',
      p.phone || '—',
      p.gender || '—',
      p.bloodGroup || '—',
      p.emergencyContact || '—',
    ]),
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} — MediConnect Patient Report`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`mediconnect-patients-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// ── EXPORT SINGLE PATIENT ─────────────────────
export const exportPatientCardPDF = (patient) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MediConnect', 14, 16);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Patient Medical Card', 14, 27);

  // Patient name banner
  doc.setFillColor(239, 246, 255);
  doc.rect(0, 35, 210, 20, 'F');
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.fullName || 'Unknown Patient', 14, 49);

  // Details
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);

  const details = [
    ['Patient ID', `#${patient.id}`],
    ['Email', patient.email || '—'],
    ['Phone', patient.phone || '—'],
    ['Gender', patient.gender || '—'],
    ['Date of Birth', patient.dateOfBirth || '—'],
    ['Blood Group', patient.bloodGroup || '—'],
    ['Address', patient.address || '—'],
    ['Emergency Contact', patient.emergencyContact || '—'],
  ];

  autoTable(doc, {
    startY: 65,
    head: [['Field', 'Information']],
    body: details,
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 },
    },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on ${new Date().toLocaleString()} — MediConnect`, 14, doc.internal.pageSize.height - 10);

  doc.save(`patient-${patient.fullName?.replace(/\s+/g, '-')}-card.pdf`);
};

// ── EXPORT MEDICAL RECORDS ────────────────────
export const exportMedicalRecordsPDF = (records, patientName = 'All Patients') => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MediConnect', 14, 15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Medical Records — ${patientName}`, 14, 23);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 140, 23);

  // Table
  autoTable(doc, {
    startY: 40,
    head: [['#', 'Patient', 'Doctor', 'Date', 'Diagnosis', 'Prescription']],
    body: records.map((r, i) => [
      i + 1,
      r.patient?.fullName || '—',
      r.doctor?.fullName || '—',
      r.recordDate || '—',
      r.diagnosis || '—',
      r.prescription || '—',
    ]),
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [255, 241, 242] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      4: { cellWidth: 45 },
      5: { cellWidth: 45 },
    },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} — MediConnect Medical Records`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`medical-records-${new Date().toISOString().slice(0, 10)}.pdf`);
};

// ── EXPORT APPOINTMENTS ───────────────────────
export const exportAppointmentsPDF = (appointments) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MediConnect', 14, 15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Appointments Report', 14, 23);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 145, 23);

  autoTable(doc, {
    startY: 40,
    head: [['#', 'Patient', 'Doctor', 'Date', 'Time', 'Reason', 'Status']],
    body: appointments.map((a, i) => [
      i + 1,
      a.patient?.fullName || '—',
      a.doctor?.fullName || '—',
      a.appointmentDate || '—',
      a.appointmentTime || '—',
      a.reason || '—',
      a.status || '—',
    ]),
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} — MediConnect Appointments Report`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`appointments-${new Date().toISOString().slice(0, 10)}.pdf`);
};