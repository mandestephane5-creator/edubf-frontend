import * as XLSX from "xlsx";

// Correspondance entre les en-têtes de colonnes attendues (insensible à la casse/accents)
// et les champs internes utilisés par l'API d'import en masse.
const HEADER_MAP = {
  "prenom eleve": "studentFirstName",
  "prénom élève": "studentFirstName",
  "nom eleve": "studentLastName",
  "nom élève": "studentLastName",
  "date de naissance": "birthDate",
  classe: "className",
  "prenom parent": "parentFirstName",
  "prénom parent": "parentFirstName",
  "nom parent": "parentLastName",
  telephone: "parentPhone",
  "téléphone": "parentPhone",
  "telephone parent": "parentPhone",
  "téléphone parent": "parentPhone",
};

function normalizeHeader(header) {
  return header
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // retire les accents pour matcher "élève" et "eleve" pareil
}

/** Lit un fichier .xlsx ou .csv et le convertit en lignes exploitables par l'import en masse */
export function parseSpreadsheetFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const rows = json
          .map((row) => {
            const mapped = {};
            for (const [key, value] of Object.entries(row)) {
              const field = HEADER_MAP[normalizeHeader(key)];
              if (field && value !== "") mapped[field] = String(value).trim();
            }
            return mapped;
          })
          .filter((r) => r.studentFirstName && r.studentLastName && r.parentFirstName && r.parentLastName && r.parentPhone);

        resolve(rows);
      } catch (err) {
        reject(new Error("Impossible de lire ce fichier — vérifie qu'il suit bien le modèle fourni."));
      }
    };
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extrait le texte brut d'un PDF. L'extraction depuis un PDF n'est PAS fiable pour
 * retrouver automatiquement des colonnes (mise en page trop variable) — le texte est
 * donc renvoyé pour être vérifié/corrigé manuellement avant l'import, plutôt que
 * converti directement en lignes comme pour Excel/CSV.
 */
export async function extractPdfText(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return fullText.trim();
}

/** Génère et télécharge un modèle Excel prêt à remplir, avec les bonnes colonnes */
export function downloadImportTemplate() {
  const headers = ["Prénom élève", "Nom élève", "Date de naissance", "Classe", "Prénom parent", "Nom parent", "Téléphone parent"];
  const example = ["Awa", "Ouédraogo", "2014-03-12", "6e A", "Moussa", "Ouédraogo", "+226 70 00 00 00"];
  const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Élèves");
  XLSX.writeFile(workbook, "modele_import_eleves.xlsx");
}
