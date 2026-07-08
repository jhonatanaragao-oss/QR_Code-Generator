const form = document.querySelector("#qr-form");
const input = document.querySelector("#link");
const image = document.querySelector("#qr-image");
const qrBox = document.querySelector("#qr-box");
const message = document.querySelector("#message");
const download = document.querySelector("#download");
const downloadPdf = document.querySelector("#download-pdf");
let currentQrUrl = "";

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const url = normalizeUrl(input.value);
  input.value = url;

  try {
    new URL(url);
  } catch {
    setMessage("Digite um link válido.", true);
    input.focus();
    return;
  }

  const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrUrl.searchParams.set("size", "600x600");
  qrUrl.searchParams.set("margin", "20");
  qrUrl.searchParams.set("format", "png");
  qrUrl.searchParams.set("data", url);

  image.src = qrUrl.toString();
  currentQrUrl = qrUrl.toString();
  download.hidden = false;
  downloadPdf.hidden = false;
  qrBox.classList.add("has-code");
  setMessage("QR Code gerado.");
});

function saveBlob(blob, filename) {
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(fileUrl);
}

download.addEventListener("click", async () => {
  if (!currentQrUrl) return;

  download.disabled = true;
  setMessage("Preparando download...");

  try {
    const response = await fetch(currentQrUrl);
    if (!response.ok) throw new Error("Falha ao baixar imagem.");

    const blob = await response.blob();
    saveBlob(blob, "qr-code.png");
    setMessage("Download iniciado.");
  } catch {
    setMessage("Não foi possível baixar automaticamente. Tente gerar novamente.", true);
  } finally {
    download.disabled = false;
  }
});

async function createPdfFromQr() {
  const response = await fetch(currentQrUrl);
  if (!response.ok) throw new Error("Falha ao baixar imagem.");

  const imageBlob = await response.blob();
  const bitmap = await createImageBitmap(imageBlob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);

  const jpegBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.95);
  });
  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

  const encoder = new TextEncoder();
  const objects = [];
  const pageWidth = 595;
  const pageHeight = 842;
  const qrSize = 360;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = (pageHeight - qrSize) / 2;
  const content = `q\n${qrSize} 0 0 ${qrSize} ${qrX} ${qrY} cm\n/Im1 Do\nQ\n`;

  objects.push(encoder.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));
  objects.push(encoder.encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"));
  objects.push(encoder.encode(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im1 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n`));
  objects.push([
    encoder.encode(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
    jpegBytes,
    encoder.encode("\nendstream\nendobj\n")
  ]);
  objects.push(encoder.encode(`5 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`));

  const chunks = [encoder.encode("%PDF-1.4\n")];
  const offsets = [0];
  let length = chunks[0].length;

  for (const object of objects) {
    offsets.push(length);
    const parts = Array.isArray(object) ? object : [object];
    for (const part of parts) {
      chunks.push(part);
      length += part.length;
    }
  }

  const xrefOffset = length;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index++) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(encoder.encode(xref));

  return new Blob(chunks, { type: "application/pdf" });
}

downloadPdf.addEventListener("click", async () => {
  if (!currentQrUrl) return;

  downloadPdf.disabled = true;
  setMessage("Preparando PDF...");

  try {
    const pdfBlob = await createPdfFromQr();
    saveBlob(pdfBlob, "qr-code.pdf");
    setMessage("Download do PDF iniciado.");
  } catch {
    setMessage("Não foi possível gerar o PDF. Tente gerar novamente.", true);
  } finally {
    downloadPdf.disabled = false;
  }
});
