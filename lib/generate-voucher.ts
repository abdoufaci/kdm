import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateVoucher(data: {
  programme: string;
  hotel: string;
  duree: string;
  chambre: string;
  adulte: number;
  enfant: number;
  places: number;
  voyageurs: { nom: string; prenom: string; age: string; passport: string }[];
  compagnie: string;
  destination: string;
  aller: string;
  retour: string;
  tel: string;
}) {
  // Load template
  const existingPdfBytes = await fetch("/voucher-template.pdf").then((res) =>
    res.arrayBuffer()
  );
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let page = pdfDoc.getPages()[0];
  let { height } = page.getSize();

  // Example: adjust coords according to your template
  page.drawText(data.programme, { x: 420, y: height - 195, size: 12, font });
  // page.drawText(data.hotel, { x: 420, y: height - 160, size: 12, font });
  // page.drawText(data.duree, { x: 420, y: height - 180, size: 12, font });
  // page.drawText(data.chambre, { x: 420, y: height - 200, size: 12, font });

  // page.drawText(`${data.adulte}`, { x: 320, y: height - 200, size: 12, font });
  // page.drawText(`${data.enfant}`, { x: 260, y: height - 200, size: 12, font });
  // page.drawText(`${data.places}`, { x: 200, y: height - 200, size: 12, font });

  // page.drawText(data.tel, { x: 420, y: height - 240, size: 12, font });

  // Travellers table
  let y = height - 300;
  data.voyageurs.forEach(async (v, i) => {
    // If overflow → add a new page with template
    if (y < 100) {
      const [templatePage] = await pdfDoc.copyPages(pdfDoc, [0]);
      pdfDoc.addPage(templatePage);
      page = pdfDoc.getPages()[pdfDoc.getPages().length - 1];
      y = height - 100;
    }

    page.drawLine({
      start: { x: 50, y: y - 10 }, // left edge
      end: { x: 550, y: y - 10 }, // right edge
      thickness: 1,
      color: rgb(217, 217, 217), // gray line
      opacity: 0.39,
    });
    page.drawText("الاسم", {
      x: 420,
      y,
      size: 12,
      font,
      color: rgb(175, 173, 173),
    });
    page.drawText("تاريخ الميلاد", {
      x: 320,
      y,
      size: 12,
      font,
      color: rgb(175, 173, 173),
    });
    page.drawText("رقم جواز السفر", {
      x: 120,
      y,
      size: 12,
      font,
      color: rgb(175, 173, 173),
    });

    // page.drawText(v.nom, { x: 420, y, size: 12, font });
    // page.drawText(v.prenom, { x: 320, y, size: 12, font });
    // page.drawText(v.age, { x: 240, y, size: 12, font });
    // page.drawText(v.passport, { x: 120, y, size: 12, font });

    y -= 25;
  });

  // Footer info
  // page.drawText(data.compagnie, { x: 420, y: 80, size: 12, font });
  // page.drawText(data.destination, { x: 300, y: 80, size: 12, font });
  // page.drawText(data.aller, { x: 200, y: 80, size: 12, font });
  // page.drawText(data.retour, { x: 120, y: 80, size: 12, font });

  // Save & download
  const pdfBytes = await pdfDoc.save();
  //@ts-ignore
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "voucher.pdf";
  link.click();
}
