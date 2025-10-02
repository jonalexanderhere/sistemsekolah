import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface AttendanceData {
  id: string;
  tanggal: string;
  waktu: string;
  status: string;
  users: {
    nama: string;
    role: string;
    nisn?: string;
  };
}

export interface UserData {
  id: string;
  nama: string;
  role: string;
  nisn?: string;
  identitas?: string;
  has_face: boolean;
  created_at: string;
}

/**
 * Export attendance data to Excel
 */
export function exportAttendanceToExcel(data: AttendanceData[], filename?: string) {
  // Prepare data for Excel
  const excelData = data.map((record, index) => ({
    'No': index + 1,
    'Nama': record.users.nama,
    'Role': record.users.role,
    'NISN': record.users.nisn || '-',
    'Tanggal': new Date(record.tanggal).toLocaleDateString('id-ID'),
    'Waktu': new Date(record.waktu).toLocaleTimeString('id-ID'),
    'Status': record.status.toUpperCase(),
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 5 },  // No
    { wch: 25 }, // Nama
    { wch: 10 }, // Role
    { wch: 15 }, // NISN
    { wch: 12 }, // Tanggal
    { wch: 10 }, // Waktu
    { wch: 12 }, // Status
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data Absensi');

  // Generate filename
  const defaultFilename = `absensi_${new Date().toISOString().split('T')[0]}.xlsx`;
  const finalFilename = filename || defaultFilename;

  // Save file
  XLSX.writeFile(wb, finalFilename);
}

/**
 * Export user data to Excel
 */
export function exportUsersToExcel(data: UserData[], filename?: string) {
  // Prepare data for Excel
  const excelData = data.map((user, index) => ({
    'No': index + 1,
    'Nama': user.nama,
    'Role': user.role.toUpperCase(),
    'NISN': user.nisn || '-',
    'Identitas': user.identitas || '-',
    'Status Wajah': user.has_face ? 'Terdaftar' : 'Belum Terdaftar',
    'Tanggal Daftar': new Date(user.created_at).toLocaleDateString('id-ID'),
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 5 },  // No
    { wch: 25 }, // Nama
    { wch: 10 }, // Role
    { wch: 15 }, // NISN
    { wch: 15 }, // Identitas
    { wch: 15 }, // Status Wajah
    { wch: 15 }, // Tanggal Daftar
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data Pengguna');

  // Generate filename
  const defaultFilename = `data_pengguna_${new Date().toISOString().split('T')[0]}.xlsx`;
  const finalFilename = filename || defaultFilename;

  // Save file
  XLSX.writeFile(wb, finalFilename);
}

/**
 * Export attendance data to PDF
 */
export function exportAttendanceToPDF(data: AttendanceData[], filename?: string) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('Laporan Absensi', 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
  doc.text(`Total Data: ${data.length} record`, 14, 36);

  // Prepare table data
  const tableData = data.map((record, index) => [
    index + 1,
    record.users.nama,
    record.users.role,
    record.users.nisn || '-',
    new Date(record.tanggal).toLocaleDateString('id-ID'),
    new Date(record.waktu).toLocaleTimeString('id-ID'),
    record.status.toUpperCase()
  ]);

  // Add table
  doc.autoTable({
    head: [['No', 'Nama', 'Role', 'NISN', 'Tanggal', 'Waktu', 'Status']],
    body: tableData,
    startY: 45,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Light gray
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 }, // No
      1: { cellWidth: 40 }, // Nama
      2: { halign: 'center', cellWidth: 20 }, // Role
      3: { halign: 'center', cellWidth: 25 }, // NISN
      4: { halign: 'center', cellWidth: 25 }, // Tanggal
      5: { halign: 'center', cellWidth: 20 }, // Waktu
      6: { halign: 'center', cellWidth: 25 }, // Status
    },
  });

  // Add footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      'EduFace Cloud Pro - SISFOTJKT2',
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Generate filename
  const defaultFilename = `laporan_absensi_${new Date().toISOString().split('T')[0]}.pdf`;
  const finalFilename = filename || defaultFilename;

  // Save file
  doc.save(finalFilename);
}

/**
 * Export user data to PDF
 */
export function exportUsersToPDF(data: UserData[], filename?: string) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text('Data Pengguna Sistem', 14, 22);
  
  // Add date and stats
  doc.setFontSize(10);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
  doc.text(`Total Pengguna: ${data.length}`, 14, 36);
  
  const siswaCount = data.filter(u => u.role === 'siswa').length;
  const guruCount = data.filter(u => u.role === 'guru').length;
  const faceRegisteredCount = data.filter(u => u.has_face).length;
  
  doc.text(`Siswa: ${siswaCount} | Guru: ${guruCount} | Wajah Terdaftar: ${faceRegisteredCount}`, 14, 42);

  // Prepare table data
  const tableData = data.map((user, index) => [
    index + 1,
    user.nama,
    user.role.toUpperCase(),
    user.nisn || user.identitas || '-',
    user.has_face ? 'Ya' : 'Tidak',
    new Date(user.created_at).toLocaleDateString('id-ID')
  ]);

  // Add table
  doc.autoTable({
    head: [['No', 'Nama', 'Role', 'NISN/ID', 'Wajah', 'Tgl Daftar']],
    body: tableData,
    startY: 50,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [34, 197, 94], // Green
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Light gray
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 }, // No
      1: { cellWidth: 50 }, // Nama
      2: { halign: 'center', cellWidth: 20 }, // Role
      3: { halign: 'center', cellWidth: 30 }, // NISN/ID
      4: { halign: 'center', cellWidth: 15 }, // Wajah
      5: { halign: 'center', cellWidth: 25 }, // Tgl Daftar
    },
  });

  // Add footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      'EduFace Cloud Pro - SISFOTJKT2',
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Generate filename
  const defaultFilename = `data_pengguna_${new Date().toISOString().split('T')[0]}.pdf`;
  const finalFilename = filename || defaultFilename;

  // Save file
  doc.save(finalFilename);
}

/**
 * Generate attendance certificate PDF
 */
export function generateAttendanceCertificate(
  userName: string,
  userRole: string,
  attendanceData: {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    attendanceRate: number;
  },
  filename?: string
) {
  const doc = new jsPDF();

  // Certificate border
  doc.setLineWidth(2);
  doc.rect(10, 10, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20);
  
  doc.setLineWidth(1);
  doc.rect(15, 15, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 30);

  // Title
  doc.setFontSize(24);
  doc.text('SERTIFIKAT KEHADIRAN', doc.internal.pageSize.width / 2, 50, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('EduFace Cloud Pro - SISFOTJKT2', doc.internal.pageSize.width / 2, 65, { align: 'center' });

  // Content
  doc.setFontSize(14);
  doc.text('Diberikan kepada:', doc.internal.pageSize.width / 2, 90, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(userName, doc.internal.pageSize.width / 2, 110, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${userRole.toUpperCase()}`, doc.internal.pageSize.width / 2, 125, { align: 'center' });

  // Attendance details
  const startY = 150;
  const leftX = 50;
  const rightX = doc.internal.pageSize.width - 50;

  doc.text('Statistik Kehadiran:', leftX, startY);
  
  doc.text(`Total Hari: ${attendanceData.totalDays}`, leftX, startY + 15);
  doc.text(`Hadir: ${attendanceData.presentDays}`, leftX, startY + 30);
  doc.text(`Terlambat: ${attendanceData.lateDays}`, leftX, startY + 45);
  doc.text(`Tidak Hadir: ${attendanceData.absentDays}`, leftX, startY + 60);

  // Attendance rate
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Tingkat Kehadiran: ${attendanceData.attendanceRate.toFixed(1)}%`,
    doc.internal.pageSize.width / 2,
    startY + 85,
    { align: 'center' }
  );

  // Date and signature
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Diterbitkan pada: ${new Date().toLocaleDateString('id-ID')}`,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 50,
    { align: 'center' }
  );

  doc.text('Sistem EduFace Cloud Pro', rightX, doc.internal.pageSize.height - 30, { align: 'center' });

  // Generate filename
  const defaultFilename = `sertifikat_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  const finalFilename = filename || defaultFilename;

  // Save file
  doc.save(finalFilename);
}

