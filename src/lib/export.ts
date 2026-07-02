import { jsPDF } from "jspdf";

export function exportConversationToPdf(
  title: string,
  messages: Array<{ role: string; content: string }>,
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`NexMind · ${title}`, margin, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleString(), margin, y);
  y += 24;
  doc.setTextColor(0);

  for (const m of messages) {
    if (!m.content) continue;
    if (y > pageH - margin) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(m.role.toUpperCase(), margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(20);
    const lines = doc.splitTextToSize(m.content, maxW);
    for (const line of lines) {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 14;
    }
    y += 10;
  }

  const fileName = `nexmind-${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`;
  doc.save(fileName);
}
