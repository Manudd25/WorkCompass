import jsPDF from 'jspdf';
import 'jspdf-autotable';

// PDF Export Functions
export const exportToPDF = {
  // Export applications to PDF
  applications: (applications, filename = 'applications') => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Job Applications Report', 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare data for table
    const tableData = applications.map(app => [
      app.company || '',
      app.role || '',
      app.status || '',
      new Date(app.date).toLocaleDateString(),
      app.notes ? app.notes.substring(0, 50) + (app.notes.length > 50 ? '...' : '') : '',
      app.interviewTime || '',
      app.interviewLocation || ''
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Company', 'Role', 'Status', 'Date', 'Notes', 'Interview Time', 'Location']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      },
      columnStyles: {
        4: { cellWidth: 40 }, // Notes column wider
        5: { cellWidth: 25 }, // Interview time
        6: { cellWidth: 30 }  // Location
      }
    });
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text(`Total Applications: ${applications.length}`, 14, finalY + 10);
    
    // Status summary
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    let yPos = finalY + 20;
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`${status}: ${count}`, 14, yPos);
      yPos += 5;
    });
    
    doc.save(`${filename}.pdf`);
  },

  // Export candidates to PDF
  candidates: (candidates, filename = 'candidates') => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Candidates Report', 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare data for table
    const tableData = candidates.map(candidate => [
      candidate.name || '',
      candidate.email || '',
      candidate.jobTitle || 'N/A',
      candidate.company || 'N/A',
      candidate.location || 'N/A',
      candidate.experience || 'N/A',
      candidate.skills ? candidate.skills.substring(0, 30) + (candidate.skills.length > 30 ? '...' : '') : 'N/A',
      new Date(candidate.createdAt).toLocaleDateString()
    ]);
    
    // Add table
    doc.autoTable({
      head: [['Name', 'Email', 'Job Title', 'Company', 'Location', 'Experience', 'Skills', 'Created']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Name
        1: { cellWidth: 35 }, // Email
        2: { cellWidth: 25 }, // Job Title
        3: { cellWidth: 25 }, // Company
        4: { cellWidth: 20 }, // Location
        5: { cellWidth: 20 }, // Experience
        6: { cellWidth: 30 }, // Skills
        7: { cellWidth: 20 }  // Created
      }
    });
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text(`Total Candidates: ${candidates.length}`, 14, finalY + 10);
    
    doc.save(`${filename}.pdf`);
  }
};

// CSV Export Functions
export const exportToCSV = {
  // Export applications to CSV
  applications: (applications, filename = 'applications') => {
    const headers = ['Company', 'Role', 'Status', 'Date', 'Notes', 'Interview Time', 'Interview Date', 'Interview Location', 'Interview Type'];
    
    const csvData = applications.map(app => [
      `"${(app.company || '').replace(/"/g, '""')}"`,
      `"${(app.role || '').replace(/"/g, '""')}"`,
      `"${(app.status || '').replace(/"/g, '""')}"`,
      `"${new Date(app.date).toLocaleDateString()}"`,
      `"${(app.notes || '').replace(/"/g, '""')}"`,
      `"${(app.interviewTime || '').replace(/"/g, '""')}"`,
      `"${app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : ''}"`,
      `"${(app.interviewLocation || '').replace(/"/g, '""')}"`,
      `"${(app.interviewType || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export candidates to CSV
  candidates: (candidates, filename = 'candidates') => {
    const headers = ['Name', 'Email', 'Job Title', 'Company', 'Location', 'Experience', 'Skills', 'Wished Salary', 'Early Start Date', 'Notes', 'Created'];
    
    const csvData = candidates.map(candidate => [
      `"${(candidate.name || '').replace(/"/g, '""')}"`,
      `"${(candidate.email || '').replace(/"/g, '""')}"`,
      `"${(candidate.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(candidate.company || '').replace(/"/g, '""')}"`,
      `"${(candidate.location || '').replace(/"/g, '""')}"`,
      `"${(candidate.experience || '').replace(/"/g, '""')}"`,
      `"${(candidate.skills || '').replace(/"/g, '""')}"`,
      `"${(candidate.wishedSalary || '').replace(/"/g, '""')}"`,
      `"${candidate.earlyStartDate ? new Date(candidate.earlyStartDate).toLocaleDateString() : ''}"`,
      `"${(candidate.candidateNotes || '').replace(/"/g, '""')}"`,
      `"${new Date(candidate.createdAt).toLocaleDateString()}"`
    ]);
    
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Helper function to get current date for filename
export const getCurrentDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper function to format filename with date
export const formatFilename = (baseName, extension) => {
  const date = getCurrentDateString();
  return `${baseName}_${date}.${extension}`;
};
