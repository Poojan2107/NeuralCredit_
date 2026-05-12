import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PDFData {
  formData: any;
  result: any;
  timestamp: string;
  userName: string;
  isJoint: boolean;
}

export const generateSanctionLetter = (data: PDFData) => {
  const { formData, result, timestamp, userName, isJoint } = data;
  const doc = new jsPDF() as any;

  // --- Theme Colors ---
  const PRIMARY_COLOR = [15, 23, 42]; // Slate 900
  const ACCENT_COLOR = [99, 102, 241]; // Indigo 500
  const TEXT_COLOR = [51, 65, 85]; // Slate 700

  // --- Header ---
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NEURAL_CREDIT', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('INSTITUTIONAL_RISK_GOVERNANCE_REPORT', 20, 28);
  
  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(1);
  doc.line(20, 32, 60, 32);

  // --- Meta Info ---
  doc.setTextColor(...TEXT_COLOR);
  doc.setFontSize(9);
  doc.text(`REPORT_ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 140, 15);
  doc.text(`TIMESTAMP: ${timestamp}`, 140, 20);
  doc.text(`ENGINE_VER: AURA_V2.1_STABLE`, 140, 25);

  // --- Main Title ---
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(18);
  doc.text('LOAN_SANCTION_DECISION', 20, 55);

  // --- Result Status Box ---
  const statusColor = result.approved ? [16, 185, 129] : [244, 63, 94]; // Emerald or Rose
  doc.setFillColor(...statusColor);
  doc.roundedRect(20, 65, 170, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(result.approved ? 'DECISION: APPROVED' : 'DECISION: REJECTED', 25, 78);
  
  doc.setFontSize(10);
  doc.text(`CONFIDENCE_SCORE: ${result.probability.toFixed(2)}%`, 130, 78);

  // --- Applicant Details ---
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(12);
  doc.text('APPLICANT_FINANCIAL_PROFILE', 20, 105);
  
  const applicantData = [
    ['Primary Applicant', userName.toUpperCase()],
    ['Application Type', isJoint ? 'JOINT_ENFORCEMENT' : 'SINGLE_ENTITY'],
    ['Annual Income (Combined)', `Rs. ${formData.annualIncome.toLocaleString('en-IN')}`],
    ['Requested Amount', `Rs. ${formData.loanAmount.toLocaleString('en-IN')}`],
    ['Loan Term', `${formData.loanTerm} Months`],
    ['CIBIL Credit Score', formData.cibilScore.toString()],
    ['Employment Status', formData.selfEmployed === 'Yes' ? 'Self Employed' : 'Salaried'],
    ['Education Level', formData.education]
  ];

  doc.autoTable({
    startY: 110,
    head: [['Parameter', 'Value']],
    body: applicantData,
    theme: 'grid',
    headStyles: { fillStyle: 'F', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 20, right: 20 }
  });

  // --- Asset Portfolio ---
  const nextY = (doc as any).lastAutoTable.finalY + 15;
  doc.text('ASSET_PORTFOLIO_SUMMARY', 20, nextY);

  const assetData = [
    ['Residential Equity', `Rs. ${formData.residentialAssets.toLocaleString('en-IN')}`],
    ['Commercial Assets', `Rs. ${formData.commercialAssets.toLocaleString('en-IN')}`],
    ['Luxury Holdings', `Rs. ${formData.luxuryAssets.toLocaleString('en-IN')}`],
    ['Bank Liquid Capital', `Rs. ${formData.bankAssets.toLocaleString('en-IN')}`]
  ];

  doc.autoTable({
    startY: nextY + 5,
    head: [['Asset Type', 'Evaluated Market Value']],
    body: assetData,
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 20, right: 20 }
  });

  // --- AI Insights / Terms ---
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(12);
  doc.text('NEURAL_LOGIC_INSIGHTS', 20, finalY);
  
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_COLOR);
  const terms = [
    "* Decision generated via Aura RF-Classifier Node NC-482.",
    "* Interest rate of " + result.interestRate + "% calculated via dynamic yield optimization.",
    "* EMI projection: Rs. " + result.emi.toLocaleString('en-IN') + " per month.",
    "* Anomaly score: " + result.anomaly_score + (result.is_anomaly ? " (High Risk Flagged)" : " (Nominal)"),
    "* This is a computer-generated report and does not require a physical signature."
  ];
  
  terms.forEach((term, i) => {
    doc.text(term, 20, finalY + 8 + (i * 5));
  });

  // --- Footer ---
  doc.setFontSize(6);
  doc.setTextColor(180, 180, 180);
  const teamLine = "ENGINEERED BY: ZARVIN // MANIT // POOJAN // VANSH // KARTIK // ABHISHEK";
  doc.text(teamLine, 105, 280, { align: 'center' });
  doc.setFontSize(7);
  doc.text('NEURAL_CREDIT_FINTECH_SOLUTIONS_PRIVATE_LIMITED // 2026', 105, 287, { align: 'center' });

  // Save the PDF
  doc.save(`NeuralCredit_Report_${formData.loanAmount}_${Date.now()}.pdf`);
};
