export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const STAT_TONES = {
  primary: { bg: "bg-primary-soft", text: "text-primary" },
  emerald: { bg: "bg-emerald-soft", text: "text-emerald" },
  amber: { bg: "bg-amber-soft", text: "text-amber" },
  rose: { bg: "bg-rose-soft", text: "text-rose" },
};

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }) {
  const t = STAT_TONES[tone] || STAT_TONES.primary;
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.bg}`}>
            <Icon size={20} className={t.text} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted">{label}</p>
          <p className="mt-0.5 text-xl font-semibold text-ink">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function initialsOf(text) {
  if (!text) return "?";
  const parts = text.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export function Avatar({ name, size = 32 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
    >
      {initialsOf(name)}
    </div>
  );
}

export function DataTable({ columns, rows, emptyLabel = "Aucune donnée pour le moment." }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
        {emptyLabel}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-border last:border-0 hover:bg-bg/60">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3.5 text-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BADGE_TONES = {
  ABSENCE: "bg-rose-soft text-rose",
  RETARD: "bg-amber-soft text-amber",
  EXPULSION: "bg-rose-soft text-rose",
  Actif: "bg-emerald-soft text-emerald",
  "Désactivé": "bg-rose-soft text-rose",
};

export function Badge({ value }) {
  const tone = BADGE_TONES[value] || "bg-primary-soft text-primary";
  return (
    <span className={`inline-block rounded-pill px-2.5 py-1 text-xs font-medium ${tone}`}>
      {typeof value === "string" ? value.replaceAll("_", " ") : value}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    outline: "border border-border text-ink hover:bg-bg",
    danger: "bg-rose text-white hover:opacity-90",
  };
  return (
    <button
      {...props}
      className={`focus-ring rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
