import { NativeSelect } from '@saas-maker/ui/components/native-controls';
import { useEffect, useRef, useState } from 'react';
import { DataTable, type DataColumn, type DataSort, type DataValue } from '@saas-maker/ui/components/data-table';
import { Badge } from '@saas-maker/ui/components/badge';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@saas-maker/ui/components/sheet';
import { filterOutcomeRows, outcomeTitle } from '../lib/outcome-list.mjs';
import { evidenceRowId } from '../lib/evidence-table.mjs';
import '../styles/evidence-table.css';

type Row = Record<string, any>;
export type EvidenceColumn = {
  id: string;
  label: string;
  value: (row: Row) => DataValue;
  display: (row: Row) => string;
  align?: 'left' | 'right';
};
export type EvidenceTableProps = {
  rows: Row[];
  label: string;
  columns: EvidenceColumn[];
  detail: (row: Row) => Node;
  projectHref: (id: string) => string;
  formatted: (date?: string | null) => string;
};

// Existing evidence renderers retain their source notes, disclosures and links.
// This component only moves that presentation into the library's accessible sheet.
function EvidenceDetail({ row, render }: { row: Row; render: (row: Row) => Node }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = host.current;
    target?.replaceChildren(render(row));
    return () => target?.replaceChildren();
  }, [row, render]);
  return <div ref={host} className="evidence-sheet__detail" />;
}

export default function EvidenceTable({ rows, label, columns, detail, projectHref, formatted }: EvidenceTableProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<DataSort>([]);
  const [compact, setCompact] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const target = host.current;
    if (!target) return;
    const update = () => setCompact(target.getBoundingClientRect().width < 1000);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const visible = filterOutcomeRows(rows, query);
  const active = rows.find(row => evidenceRowId(row) === selected);
  const compactIdentity = (row: Row) => <div className="evidence-table__compact"><strong>{outcomeTitle(row)}</strong>{row.domain && row.domain !== outcomeTitle(row) && <small>{row.domain}</small>}<div className="evidence-table__compact-metrics">{columns.map(column => <span key={column.id}><small>{column.label}</small><strong>{column.display(row)}</strong></span>)}</div><small>{String(row.status ?? 'not-measured').replaceAll('-', ' ')} · {formatted(row.observedAt)}</small></div>;
  const tableColumns: DataColumn<Row>[] = [
    {
      id: 'product', header: 'Product / domain', value: outcomeTitle, hideable: false,
      cell: row => compact ? compactIdentity(row) : <div className="evidence-table__identity"><strong>{outcomeTitle(row)}</strong>{row.domain && row.domain !== outcomeTitle(row) && <small>{row.domain}</small>}</div>,
      compactCell: compactIdentity,
    },
    ...columns.map(column => ({
      id: column.id, header: column.label, value: column.value,
      cell: column.display, align: column.align ?? 'right', collapseInCompact: true, hidden: compact, hideable: !compact,
    } satisfies DataColumn<Row>)),
    { id: 'status', header: 'Status', value: row => row.status, cell: row => <Badge variant="outline">{String(row.status ?? 'not-measured').replaceAll('-', ' ')}</Badge>, collapseInCompact: true, hidden: compact, hideable: !compact },
    { id: 'observed', header: 'Observed', value: row => row.observedAt, cell: row => <span className="evidence-table__date">{formatted(row.observedAt)}</span>, collapseInCompact: true, hidden: compact, hideable: !compact },
  ];
  const open = (row: Row) => {
    // The shared table focuses keyboard rows; a pointer click may leave focus on
    // the body. Resolve the selected row after the shared component has rendered.
    opener.current = document.activeElement instanceof HTMLElement && document.activeElement.closest('tr[data-row]') ? document.activeElement : null;
    setSelected(evidenceRowId(row));
  };
  return <div className="evidence-table" ref={host}>
    <div className="evidence-table__toolbar"><Input type="search" aria-label={`Find product or domain in ${label}`} placeholder="Find product or domain…" value={query} onChange={event => setQuery(event.target.value)} /><span aria-live="polite">{visible.length} of {rows.length}</span></div>
    {compact && <div className="evidence-table__sort"><label>Order <NativeSelect aria-label={`Order ${label}`} value={sort[0]?.id ?? 'product'} onChange={event => setSort([{ id: event.target.value, desc: event.target.value !== 'product' }])}>{tableColumns.map(column => <option key={column.id} value={column.id}>{column.header}</option>)}</NativeSelect></label><Button variant="outline" size="sm" onClick={() => setSort([{ id: sort[0]?.id ?? 'product', desc: !sort[0]?.desc }])}>{sort[0]?.desc ? 'Descending ↓' : 'Ascending ↑'}</Button></div>}
    <DataTable key={`${visible.length}:${compact}`} data={visible} columns={tableColumns} getRowId={evidenceRowId} label={label} pageSize={Math.max(1, visible.length)} maxHeight="none" sort={sort} onSortChange={setSort} onRowClick={open} selectedId={active ? selected : null} empty={rows.length ? "No products or domains match this search." : "No evidence recorded for this scope."} />
    <Sheet open={Boolean(active)} onOpenChange={open => { if (!open) setSelected(null); }}>
      <SheetContent className="evidence-sheet" onCloseAutoFocus={event => {
        event.preventDefault();
        const target = opener.current?.isConnected ? opener.current : host.current?.querySelector<HTMLElement>('tr[data-row][tabindex="0"]');
        target?.focus({ preventScroll: true });
      }}>
        <SheetHeader><SheetTitle>{active ? outcomeTitle(active) : label}</SheetTitle><SheetDescription>{active ? `${active.domain ?? label} · ${formatted(active.observedAt)}` : label}</SheetDescription></SheetHeader>
        {active && <div className="evidence-sheet__body"><div className="evidence-sheet__actions"><Badge variant="outline">{String(active.status ?? 'not-measured').replaceAll('-', ' ')}</Badge>{active.projectId && <Button variant="outline" size="sm" asChild><a href={projectHref(active.projectId)}>View product</a></Button>}</div><EvidenceDetail row={active} render={detail} /></div>}
      </SheetContent>
    </Sheet>
  </div>;
}
