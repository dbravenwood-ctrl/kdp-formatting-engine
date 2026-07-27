import { useEffect, useState } from "react";
import { api, API_BASE_URL, ApiError, type HealthResponse } from "./config/api";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const [title, setTitle] = useState("My KDP Book");
  const [author, setAuthor] = useState("Author Name");
  const [content, setContent] = useState(
    "Chapter One\n\nType or paste your manuscript here. Blank lines separate paragraphs."
  );
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch((err: unknown) =>
        setHealthError(err instanceof ApiError ? err.message : "Backend unreachable")
      );
  }, []);

  async function handleExport(format: "pdf" | "docx") {
    setBusy(format);
    setExportError(null);
    try {
      const blob =
        format === "pdf"
          ? await api.exportPdf({ title, author, content })
          : await api.exportDocx({ title, author, content });
      downloadBlob(blob, `${title.replace(/[^a-z0-9-_]+/gi, "_")}.${format}`);
    } catch (err) {
      setExportError(err instanceof ApiError ? err.message : "Export failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>KDP Formatting Engine</h1>
        <p className="api-status">
          API: <code>{API_BASE_URL}</code>{" "}
          {health && <span className="ok">● connected</span>}
          {healthError && <span className="err">● {healthError}</span>}
        </p>
      </header>

      <main>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Author
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>
        <label>
          Manuscript
          <textarea
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>

        <div className="actions">
          <button disabled={busy !== null} onClick={() => handleExport("pdf")}>
            {busy === "pdf" ? "Generating PDF…" : "Export PDF"}
          </button>
          <button disabled={busy !== null} onClick={() => handleExport("docx")}>
            {busy === "docx" ? "Generating DOCX…" : "Export DOCX"}
          </button>
        </div>

        {exportError && <p className="err">{exportError}</p>}
      </main>
    </div>
  );
}
