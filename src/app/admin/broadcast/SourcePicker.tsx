"use client";

import { useMemo, useState } from "react";

import type { SourceCatalogEntry } from "@/lib/newsletter-pod";
import styles from "./admin.module.css";

type Props = {
  sources: SourceCatalogEntry[];
  selectedSourceIds: string[];
  // Single hidden input named source_ids holds the JSON-encoded selection.
  // Server action parses it back. We keep a single field so server actions
  // don't need to walk every catalog id on the form.
  inputName?: string;
};

export function SourcePicker({ sources, selectedSourceIds, inputName = "source_ids" }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selectedSourceIds));
  const [filter, setFilter] = useState("");

  const grouped = useMemo(() => {
    const byTopic = new Map<string, SourceCatalogEntry[]>();
    for (const s of sources) {
      const topic = s.topic ?? "Other";
      const list = byTopic.get(topic) ?? [];
      list.push(s);
      byTopic.set(topic, list);
    }
    for (const list of byTopic.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return Array.from(byTopic.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sources]);

  const filterLower = filter.trim().toLowerCase();
  const visible = filterLower
    ? grouped
        .map(([topic, list]) => [
          topic,
          list.filter(
            (s) =>
              s.name.toLowerCase().includes(filterLower) ||
              s.source_id.toLowerCase().includes(filterLower) ||
              (s.topic ?? "").toLowerCase().includes(filterLower),
          ),
        ] as [string, SourceCatalogEntry[]])
        .filter(([, list]) => list.length > 0)
    : grouped;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const [, list] of visible) for (const s of list) next.add(s.source_id);
      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
  }

  // Preserve the order the operator originally submitted (or the order in
  // which they ticked checkboxes) by deriving the JSON from a stable list.
  const serialized = JSON.stringify(Array.from(selected));

  return (
    <div className={styles.sourcePicker}>
      <input type="hidden" name={inputName} value={serialized} />
      <div className={styles.sourcePickerToolbar}>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name, id, or topic"
          className={styles.sourcePickerSearch}
        />
        <div className={styles.sourcePickerCount}>
          {selected.size} selected / {sources.length} total
        </div>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={selectVisible}
          disabled={visible.length === 0}
        >
          Select visible
        </button>
        <button type="button" className={styles.btnSecondary} onClick={clearAll}>
          Clear all
        </button>
      </div>

      {visible.length === 0 && (
        <div className={styles.empty}>No sources match that filter.</div>
      )}

      <div className={styles.sourceGroups}>
        {visible.map(([topic, list]) => (
          <fieldset key={topic} className={styles.sourceGroup}>
            <legend className={styles.sourceGroupLegend}>
              {topic}{" "}
              <span className={styles.formHint}>({list.filter((s) => selected.has(s.source_id)).length}/{list.length})</span>
            </legend>
            <div className={styles.sourceGroupGrid}>
              {list.map((s) => (
                <label key={s.source_id} className={styles.sourceCheckRow}>
                  <input
                    type="checkbox"
                    checked={selected.has(s.source_id)}
                    onChange={() => toggle(s.source_id)}
                  />
                  <span>
                    <strong>{s.name}</strong>
                    <span className={styles.formHint}> · {s.source_id}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
