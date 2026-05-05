import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSanctionLetter = (result: any, currentPayload: any) => {
  if (!result || !result.approved) return;

  const doc = new jsPDF();

  // Premium Background / Watermark setup
  doc.setFillColor(248, 250, 252); // extremely light slate
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  
  doc.setTextColor(230, 230, 240); // very faint
  doc.setFontSize(80);
  doc.text("NC_AI_SECURE", 105, 150, { angle: 45, align: "center" });

  // Header Box
  // --------------------------------------------------
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("NEURALCREDIT_", 20, 23);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Secured Sanction Document", 140, 22);

  // Document Metadata
  // --------------------------------------------------
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const refId = `NC-AI-${Math.floor(Math.random() * 9000000) + 1000000}`;
  doc.text(`Reference No: ${refId}`, 20, 50);
  doc.text(`Date of Sanction: ${new Date().toLocaleDateString()}`, 140, 50);
  doc.setFont("helvetica", "normal");

  // Body Paragraph
  // --------------------------------------------------
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(11);
  doc.text("Dear Applicant,", 20, 65);

  const introText = `We are pleased to inform you that following an algorithmic review by the NeuralCredit_ Intelligence Engine, your application for a personal loan has been provisionally APPROVED with an AI confidence score of ${result.probability.toFixed(0)}%.`;
  const splitIntro = doc.splitTextToSize(introText, 170);
  doc.text(splitIntro, 20, 75);

  // Financial Details Table
  // --------------------------------------------------
  const tableData = [
    ["Approved Loan Amount", `INR ${currentPayload.loanAmount.toLocaleString('en-IN')}`],
    ["Approved Tenure", `${currentPayload.loanTerm} Months`],
    ["Risk-Based Interest Rate", `${result.insights.interestRate}% p.a.`],
    ["Equated Monthly Installment (EMI)", `INR ${Math.floor(result.insights.emi).toLocaleString('en-IN')} / month`],
    ["Verified Applicant CIBIL Score", currentPayload.cibilScore.toString()],
    ["Verified Annual Income", `INR ${currentPayload.annualIncome.toLocaleString('en-IN')}`]
  ];

  try {
    autoTable(doc, {
      startY: 100,
      head: [['Sanction Parameter', 'Authorized Value']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 11, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10, textColor: 50 },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: 20, right: 20 },
      styles: { cellPadding: 6 }
    });
  } catch (atError) {
    console.error('autoTable failed:', atError);
    doc.text("Detailed breakdown available online.", 20, 100);
  }

  // Signatures
  // --------------------------------------------------
  let finalY = 200; 
  try {
    finalY = (doc as any).lastAutoTable?.finalY || 200;
  } catch (e) {
    console.warn('Could not determine lastAutoTable.finalY', e);
  }

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("System Authorized By:", 20, finalY + 30);
  
  // Hex/Cryptographic signature mock
  doc.setFont("courier", "bold");
  doc.setTextColor(99, 102, 241);
  doc.text(`[0x${Math.random().toString(16).substr(2, 8).toUpperCase()}_NC_CORE]`, 20, finalY + 40);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.text("Applicant Signature:", 140, finalY + 30);
  doc.text("_________________________", 140, finalY + 40);

  // Footer Disclaimer
  // --------------------------------------------------
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  const disclaimer = "CONFIDENTIALITY NOTICE: This is an electronically generated and validated document. This document is intended as a demonstration of software architecture. It does not constitute a legal or binding contract.";
  const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
  
  // Bottom Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 275, doc.internal.pageSize.width, 22, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.text(splitDisclaimer, 20, 282);

  doc.save(`NeuralCredit_Sanction_${refId}.pdf`);
};
