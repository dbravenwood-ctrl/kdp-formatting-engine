from fastapi import FastAPI, Form
from fastapi.responses import Response
from weasyprint import HTML, CSS
import ebooklib
from ebooklib import epub

app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "formatting engine online"}

@app.post("/generate-pdf")
async def generate_pdf(
    title: str = Form(...),
    author: str = Form(...),
    content_html: str = Form(...),
    gutter_margin: str = Form("0.5in")
):
    # KDP CSS Print Layout Rules
    css_rules = f"""
    @page {{
        size: 6in 9in;
        margin-top: 0.75in;
        margin-bottom: 0.75in;
        margin-outside: 0.5in;
        margin-inside: {gutter_margin};
    }}
    body {{
        font-family: 'Georgia', serif;
        font-size: 11pt;
        line-height: 1.4;
        text-align: justify;
    }}
    h1 {{
        page-break-before: always;
        text-align: center;
        margin-top: 2in;
    }}
    """
    
    full_html = f"<html><body><h1>{title}</h1><p><i>by {author}</i></p>{content_html}</body></html>"
    pdf_bytes = HTML(string=full_html).write_pdf(stylesheets=[CSS(string=css_rules)])
    
    return Response(content=pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={title}_KDP_Print.pdf"
    })
