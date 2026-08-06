"use client";

import { KIND_CONFIG, specFor } from "./bindingSpecs";

export default function BindingDetails({
  departmentSlug,
  purpose,
  dataSourceKind,
  config,
}: {
  departmentSlug: string;
  purpose: string;
  dataSourceKind: string;
  config: Record<string, unknown>;
}) {
  const spec = specFor(purpose);
  const kindFields = KIND_CONFIG[dataSourceKind] ?? [];
  const spreadsheetId =
    typeof config.spreadsheetId === "string" ? config.spreadsheetId : "";
  const gid = typeof config.gid === "number" ? config.gid : null;
  const sheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit${gid != null ? `#gid=${gid}` : ""}`
    : null;

  return (
    <div className="flex flex-col gap-5 p-4 bg-black/[0.02] dark:bg-white/[0.02] text-sm">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium">{spec?.label ?? purpose}</h3>
        {spec && <p className="opacity-70">{spec.summary}</p>}
        {!spec && (
          <p className="opacity-70">
            No description recorded for this purpose.
          </p>
        )}
      </div>

      {spec?.unused && (
        <p className="rounded border border-amber-500/30 bg-amber-500/[0.07] px-3 py-2 text-xs">
          <span className="font-medium">Not in use. </span>
          {spec.unused}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Current settings">
          <dl className="flex flex-col gap-1.5">
            <Row label="Scope" value={departmentSlug === "ceo" ? "ceo (CEO dashboards)" : departmentSlug} />
            <Row label="Source" value={dataSourceKind} />
            {kindFields.map((f) => {
              const raw = config[f.field];
              const shown =
                f.field === "(none)"
                  ? "—"
                  : raw === undefined || raw === ""
                    ? "(not set)"
                    : String(raw);
              return (
                <div key={f.field} className="flex flex-col gap-0.5 pt-1">
                  <div className="flex gap-2 items-baseline">
                    <dt className="opacity-60 min-w-[7.5rem] font-mono text-xs">
                      {f.field}
                      {f.required && <span className="text-red-500"> *</span>}
                    </dt>
                    <dd
                      className={`font-mono text-xs break-all ${
                        shown === "(not set)" ? "opacity-40" : ""
                      }`}
                    >
                      {shown}
                    </dd>
                  </div>
                  <p className="text-[11px] opacity-50 pl-[8.2rem]">{f.note}</p>
                </div>
              );
            })}
          </dl>
          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline-offset-2 hover:underline self-start"
            >
              Open this sheet ↗
            </a>
          )}
        </Section>

        <Section title="Where this shows up">
          {spec && spec.usedBy.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {spec.usedBy.map((u) => (
                <li key={u} className="flex gap-2">
                  <span className="opacity-40">•</span>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="opacity-60 text-xs">
              Nothing on the dashboards reads this binding.
            </p>
          )}
          {spec && spec.readBy.length > 0 && (
            <div className="flex flex-col gap-0.5 pt-1">
              <span className="text-[11px] opacity-50">Read by</span>
              {spec.readBy.map((f) => (
                <code key={f} className="text-[11px] opacity-60 break-all">
                  {f}
                </code>
              ))}
            </div>
          )}
        </Section>
      </div>

      {spec?.layout && (
        <Section title="Expected data structure">
          {spec.layout.tabs && spec.layout.tabs.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs opacity-60">Tabs:</span>
              {spec.layout.tabs.map((t) => (
                <code
                  key={t}
                  className="text-xs rounded bg-black/[0.06] dark:bg-white/[0.08] px-1.5 py-0.5"
                >
                  {t}
                </code>
              ))}
            </div>
          )}

          {spec.layout.columns && spec.layout.columns.length > 0 && (
            <div className="border border-black/10 dark:border-white/10 rounded overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5">
                  <tr className="text-left">
                    {spec.layout.columns.some((c) => c.column) && (
                      <th className="px-2 py-1.5 font-medium w-16">Column</th>
                    )}
                    <th className="px-2 py-1.5 font-medium">Holds</th>
                    <th className="px-2 py-1.5 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {spec.layout.columns.map((c) => (
                    <tr
                      key={c.name}
                      className="border-t border-black/10 dark:border-white/10"
                    >
                      {spec.layout!.columns!.some((x) => x.column) && (
                        <td className="px-2 py-1.5 font-mono font-medium">
                          {c.column ?? ""}
                        </td>
                      )}
                      <td className="px-2 py-1.5">{c.name}</td>
                      <td className="px-2 py-1.5 opacity-60">{c.note ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {spec.layout.notes && spec.layout.notes.length > 0 && (
            <ul className="flex flex-col gap-1 text-xs opacity-70">
              {spec.layout.notes.map((n) => (
                <li key={n} className="flex gap-2">
                  <span className="opacity-40">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h4 className="text-[11px] uppercase tracking-wider opacity-50 font-medium">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 items-baseline">
      <dt className="opacity-60 min-w-[7.5rem] font-mono text-xs">{label}</dt>
      <dd className="font-mono text-xs">{value}</dd>
    </div>
  );
}
