import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs';

async function createPdf(filename: string, text: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(text, {
    x: 50,
    y: 700,
    size: 15,
    font: font,
    color: rgb(0, 0, 0),
  });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filename, pdfBytes);
}

async function runTest() {
  await createPdf('bearing1.pdf', 'Bearing 6208\nType: Deep Groove Ball Bearing\nInner Diameter: 1.5748 in\nOuter Diameter: 80 mm\nWidth: 1.8 cm\nManufacturer: SKF\nMaterial: SUJ2');
  await createPdf('bearing2.pdf', 'Bearing 6000\nType: Deep Groove Ball Bearing\nInner Diameter: 10 mm\nOuter Diameter: 1.0236 inches\nWidth: 8 mm\nManufacturer: NTN\nMaterial: Stainless 316');

  const file1 = fs.readFileSync('bearing1.pdf');
  const file2 = fs.readFileSync('bearing2.pdf');

  const formData = new FormData();
  formData.append('original', new Blob([file1], { type: 'application/pdf' }), 'bearing1.pdf');
  formData.append('replacement', new Blob([file2], { type: 'application/pdf' }), 'bearing2.pdf');

  console.log('1. Creating comparison (POST /api/comparisons)...');
  const res1 = await fetch('http://localhost:3000/api/comparisons', {
    method: 'POST',
    body: formData,
  });
  
  if (!res1.ok) throw new Error(`Failed to create comparison: ${res1.status}`);
  const { comparisonId, documentIds } = await res1.json();
  console.log(`✅ Created comparison: ${comparisonId}`);

  console.log('2. Extracting Document A...');
  const resA = await fetch(`http://localhost:3000/api/documents/${documentIds.original}/extract`, { method: 'POST' });
  if (!resA.ok) throw new Error(`Extract A failed: ${resA.status}`);
  console.log(await resA.json());

  console.log('3. Extracting Document B...');
  const resB = await fetch(`http://localhost:3000/api/documents/${documentIds.replacement}/extract`, { method: 'POST' });
  if (!resB.ok) throw new Error(`Extract B failed: ${resB.status}`);
  console.log(await resB.json());

  console.log('4. Analyzing comparison...');
  const resAnalyze = await fetch(`http://localhost:3000/api/comparisons/${comparisonId}/analyze`, { method: 'POST' });
  if (!resAnalyze.ok) throw new Error(`Analyze failed: ${resAnalyze.status}`);

  console.log('5. Loading comparison page...');
  const resPage = await fetch(`http://localhost:3000/comparisons/${comparisonId}`);
  if (!resPage.ok) throw new Error(`Page load failed: ${resPage.status}`);
  const html = await resPage.text();
  console.log(`✅ Page loaded! Length: ${html.length} bytes`);
  
  fs.unlinkSync('bearing1.pdf');
  fs.unlinkSync('bearing2.pdf');
}

runTest().catch(console.error);
