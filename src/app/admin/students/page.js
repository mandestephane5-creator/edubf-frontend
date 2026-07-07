"use client";

import { useEffect, useState } from "react";
import { Copy, MessageCircle, Trash2 } from "lucide-react";
import { PageHeader, DataTable, Button, Avatar } from "@/components/ui";
import Modal from "@/components/Modal";
import ShareCredentials from "@/components/ShareCredentials";
import { useAuth } from "@/context/AuthContext";
import { studentsApi } from "@/app/api-calls/students";
import { classesApi } from "@/app/api-calls/directory";
import { parseSpreadsheetFile, extractPdfText, downloadImportTemplate } from "./importUtils";

const emptyForm = {
  student: { firstName: "", lastName: "", birthDate: "", classId: "" },
  parent: { firstName: "", lastName: "", phone: "" },
};

export default function StudentsPage() {
  const { user } = useAuth();
  const schoolName = user?.school?.name || "l'école";
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkError, setBulkError] = useState("");
  const [fileImporting, setFileImporting] = useState(false);
  const [pdfNotice, setPdfNotice] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [duplicateConfirm, setDuplicateConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([studentsApi.list(search ? { search } : {}), classesApi.list()]);
      setStudents(s);
      setClasses(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load();
  }

  function resetModal() {
    setForm(emptyForm);
    setDuplicateConfirm(null);
    setError("");
  }

  async function submitCreate(linkToExistingParentId) {
    setError("");
    try {
      const payload = {
        student: { ...form.student, classId: form.student.classId || undefined },
        parent: form.parent,
        ...(linkToExistingParentId && { linkToExistingParentId }),
      };
      const result = await studentsApi.create(payload);
      setSuccessInfo({
        matricule: result.matricule,
        parentPassword: result.parentPassword,
        studentName: `${form.student.firstName} ${form.student.lastName}`,
        parentPhone: form.parent.phone,
      });
      setModalOpen(false);
      resetModal();
      load();
    } catch (err) {
      if (err.code === "PHONE_ALREADY_EXISTS") {
        const existing = await studentsApi.checkParentPhone(form.parent.phone);
        setDuplicateConfirm({ existingParent: existing });
      } else {
        setError(err.message);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await submitCreate();
  }

  async function handleDeleteStudent(student) {
    const fullName = `${student.firstName} ${student.lastName}`;
    const typed = window.prompt(
      `⚠️ Cette action est définitive et supprimera aussi toutes ses notes et incidents.\n\nPour confirmer, tape exactement le nom de l'élève : ${fullName}`
    );
    if (typed !== fullName) {
      if (typed !== null) alert("Le nom tapé ne correspond pas — suppression annulée.");
      return;
    }
    try {
      await studentsApi.remove(student.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBulkImport(e) {
    e.preventDefault();
    setBulkError("");
    setBulkResults(null);
    try {
      const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
      const rows = lines.map((line) => {
        const [studentFirstName, studentLastName, birthDate, className, parentFirstName, parentLastName, parentPhone] =
          line.split(";").map((v) => v.trim());
        return { studentFirstName, studentLastName, birthDate: birthDate || undefined, className: className || undefined, parentFirstName, parentLastName, parentPhone };
      });
      const results = await studentsApi.bulkCreate(rows);
      setBulkResults(results);
      load();
    } catch (err) {
      setBulkError(err.message);
    }
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkError("");
    setPdfNotice("");
    setFileImporting(true);
    try {
      const extension = file.name.split(".").pop().toLowerCase();

      if (extension === "xlsx" || extension === "csv") {
        // Excel/CSV : lecture fiable, colonnes détectées automatiquement via le modèle
        const rows = await parseSpreadsheetFile(file);
        if (rows.length === 0) {
          setBulkError("Aucune ligne valide trouvée. Vérifie que le fichier suit bien le modèle fourni.");
          return;
        }
        const results = await studentsApi.bulkCreate(rows);
        setBulkResults(results);
        load();
      } else if (extension === "pdf") {
        // PDF : extraction du texte uniquement — la mise en page d'un PDF est trop
        // variable pour retrouver les colonnes de façon fiable. Le texte extrait est
        // affiché ci-dessous pour vérification/correction manuelle avant l'import.
        const text = await extractPdfText(file);
        setBulkText(text);
        setPdfNotice(
          "Texte extrait du PDF. Vérifie et reformate chaque ligne (Prénom;Nom;Date;Classe;PrénomParent;NomParent;Téléphone) avant de cliquer sur Importer — l'extraction automatique des colonnes n'est pas fiable pour un PDF."
        );
      } else {
        setBulkError("Format non reconnu. Utilise un fichier .xlsx, .csv ou .pdf.");
      }
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setFileImporting(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <PageHeader
        title="Élèves"
        description="Inscription et suivi des élèves"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBulkModalOpen(true)}>Import en masse</Button>
            <Button onClick={() => setModalOpen(true)}>+ Inscrire un élève</Button>
          </div>
        }
      />

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un élève ou un matricule…"
          className="focus-ring w-full max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
        />
        <Button variant="outline" type="submit">Rechercher</Button>
      </form>

      {successInfo && (
        <div className="mb-4 rounded-lg bg-emerald-soft px-4 py-3 text-sm text-emerald">
          <p className="font-medium">Élève inscrit avec succès.</p>
          <p>Matricule : <span className="font-mono">{successInfo.matricule}</span></p>
          {successInfo.parentPassword && (
            <p>Mot de passe du parent : <span className="font-mono">{successInfo.parentPassword}</span> — transmettez-le au parent.</p>
          )}
          <ShareCredentials
            schoolName={schoolName}
            studentName={successInfo.studentName}
            matricule={successInfo.matricule}
            password={successInfo.parentPassword}
            phone={successInfo.parentPhone}
          />
        </div>
      )}
      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <DataTable
          columns={[
            { key: "avatar", header: "", render: (r) => <Avatar name={`${r.firstName} ${r.lastName}`} /> },
            { key: "matricule", header: "Matricule", render: (r) => <span className="font-mono text-xs">{r.matricule}</span> },
            { key: "name", header: "Nom", render: (r) => `${r.firstName} ${r.lastName}` },
            { key: "class", header: "Classe", render: (r) => r.class?.name || "—" },
            {
              key: "parents",
              header: "Parent(s)",
              render: (r) => r.parents?.map((p) => `${p.parent.firstName} ${p.parent.lastName}`).join(", ") || "—",
            },
            {
              key: "delete",
              header: "",
              render: (r) => (
                <button onClick={() => handleDeleteStudent(r)} className="text-rose hover:opacity-70" aria-label="Supprimer">
                  <Trash2 size={16} />
                </button>
              ),
            },
          ]}
          rows={students}
          emptyLabel="Aucun élève inscrit pour le moment."
        />
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetModal(); }} title="Inscrire un élève">
        {duplicateConfirm ? (
          <div className="space-y-4">
            <p className="text-sm text-ink">
              Le numéro <span className="font-mono">{form.parent.phone}</span> correspond déjà à{" "}
              <strong>{duplicateConfirm.existingParent.firstName} {duplicateConfirm.existingParent.lastName}</strong>,
              parent de {duplicateConfirm.existingParent.children?.length ?? 0} élève(s) dans l'école.
            </p>
            <p className="text-sm text-muted">Voulez-vous relier ce nouvel élève à ce compte parent existant ?</p>
            {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDuplicateConfirm(null)} className="flex-1">Annuler</Button>
              <Button onClick={() => submitCreate(duplicateConfirm.existingParent.id)} className="flex-1">Oui, relier</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Élève</p>
              <div className="space-y-3">
                <TextField label="Prénom" value={form.student.firstName} onChange={(v) => setForm((f) => ({ ...f, student: { ...f.student, firstName: v } }))} />
                <TextField label="Nom" value={form.student.lastName} onChange={(v) => setForm((f) => ({ ...f, student: { ...f.student, lastName: v } }))} />
                <TextField label="Date de naissance" type="date" value={form.student.birthDate} onChange={(v) => setForm((f) => ({ ...f, student: { ...f.student, birthDate: v } }))} required={false} />
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Classe</span>
                  <select
                    value={form.student.classId}
                    onChange={(e) => setForm((f) => ({ ...f, student: { ...f.student, classId: e.target.value } }))}
                    className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
                  >
                    <option value="">— Aucune classe —</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Parent</p>
              <div className="space-y-3">
                <TextField label="Prénom" value={form.parent.firstName} onChange={(v) => setForm((f) => ({ ...f, parent: { ...f.parent, firstName: v } }))} />
                <TextField label="Nom" value={form.parent.lastName} onChange={(v) => setForm((f) => ({ ...f, parent: { ...f.parent, lastName: v } }))} />
                <TextField label="Téléphone" value={form.parent.phone} onChange={(v) => setForm((f) => ({ ...f, parent: { ...f.parent, phone: v } }))} placeholder="+226 70 00 00 00" />
              </div>
            </div>

            {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
            <Button type="submit" className="w-full">Inscrire l'élève</Button>
          </form>
        )}
      </Modal>

      <Modal
        open={bulkModalOpen}
        onClose={() => { setBulkModalOpen(false); setBulkResults(null); setBulkText(""); setBulkError(""); setPdfNotice(""); }}
        title="Import en masse"
      >
        {bulkResults ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              {bulkResults.filter((r) => r.success).length} réussite(s), {bulkResults.filter((r) => !r.success).length} échec(s).
            </p>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {bulkResults.map((r, i) => (
                <div key={i} className={`rounded-md px-3 py-2 text-sm ${r.success ? "bg-emerald-soft text-emerald" : "bg-rose-soft text-rose"}`}>
                  <p className="font-medium">{r.studentName}</p>
                  {r.success ? (
                    <>
                      <p>
                        Matricule : <span className="font-mono">{r.matricule}</span>
                        {r.parentPassword && <> — Mot de passe parent : <span className="font-mono">{r.parentPassword}</span></>}
                      </p>
                      <ShareCredentials
                        schoolName={schoolName}
                        studentName={r.studentName}
                        matricule={r.matricule}
                        password={r.parentPassword}
                        phone={r.parentPhone}
                      />
                    </>
                  ) : (
                    <p>{r.error}</p>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={() => { setBulkModalOpen(false); setBulkResults(null); setBulkText(""); }} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBulkImport} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={downloadImportTemplate}>
                Télécharger le modèle Excel
              </Button>
              <label className="focus-ring cursor-pointer rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-bg">
                {fileImporting ? "Lecture…" : "Importer un fichier (.xlsx, .csv, .pdf)"}
                <input
                  type="file"
                  accept=".xlsx,.csv,.pdf"
                  onChange={handleFileSelected}
                  disabled={fileImporting}
                  className="hidden"
                />
              </label>
            </div>

            {pdfNotice && <p className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">{pdfNotice}</p>}

            <p className="text-sm text-muted">
              Ou colle directement le texte ci-dessous — une ligne par élève, valeurs séparées par des points-virgules (<code>;</code>) :
            </p>
            <p className="rounded-md bg-bg px-3 py-2 font-mono text-xs text-ink">
              Prénom;Nom;DateNaissance(AAAA-MM-JJ, optionnel);Classe(optionnel);PrénomParent;NomParent;TéléphoneParent
            </p>
            <p className="rounded-md bg-bg px-3 py-2 font-mono text-xs text-muted">
              Awa;Ouédraogo;2014-03-12;6e A;Moussa;Ouédraogo;+226 70 00 00 00
            </p>
            <textarea
              required
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs outline-none"
              placeholder="Awa;Ouédraogo;2014-03-12;6e A;Moussa;Ouédraogo;+226 70 00 00 00"
            />
            {bulkError && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{bulkError}</p>}
            <Button type="submit" className="w-full">Importer</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", required = true, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}
