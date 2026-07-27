import PDFDocument from "pdfkit";
import type { ManuscriptExportRequest } from "../types";

/**
 * Renders a manuscript into a KDP-friendly PDF buffer.
 * Runs entirely in memory, which is what a stateless serverless
 * function needs (no writing to /tmp required, though /tmp is
 * available on Vercel if you later need it for larger jobs).
 */
export function generatePdfBuffer(
  input: ManuscriptExportRequest
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [432, 648], // 6in x 9in in points (72pt/in) -- common KDP trim size
        margins: { top: 72, bottom: 72, left: 63, right: 63 },
        info: {
          Title: input.title ?? "Untitled Manuscript",
          Author: input.author ?? "Unknown Author",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      if (input.title) {
        doc.font("Helvetica-Bold").fontSize(22).text(input.title, {
          align: "center",
        });
        doc.moveDown();
      }

      if (input.author) {
        doc.font("Helvetica").fontSize(12).text(`by ${input.author}`, {
          align: "center",
        });
        doc.moveDown(2);
      }

      doc.font("Times-Roman").fontSize(11).text(input.content, {
        align: "left",
        lineGap: 4,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
