import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from "docx";
import type { ManuscriptExportRequest } from "../types";

/**
 * Renders a manuscript into a .docx buffer using the `docx` package
 * (pure JS, no native binaries -- important for serverless environments
 * where you can't shell out to LibreOffice/Pandoc).
 */
export async function generateDocxBuffer(
  input: ManuscriptExportRequest
): Promise<Buffer> {
  const children: Paragraph[] = [];

  if (input.title) {
    children.push(
      new Paragraph({
        text: input.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      })
    );
  }

  if (input.author) {
    children.push(
      new Paragraph({
        text: `by ${input.author}`,
        alignment: AlignmentType.CENTER,
      })
    );
  }

  const bodyParagraphs = input.content
    .split(/\n{2,}/)
    .map(
      (para) =>
        new Paragraph({
          text: para.trim(),
          spacing: { after: 200 },
        })
    );

  children.push(...bodyParagraphs);

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}
