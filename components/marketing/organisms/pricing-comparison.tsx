import { Check, Minus } from "lucide-react";

/** `true` renders a tick, `false` a dash, a string renders as written. */
export type ComparisonValue = string | boolean;

export type ComparisonRow = {
  label: string;
  /** One per column, in the same order as `columns`. */
  values: ComparisonValue[];
};

export type ComparisonGroup = {
  heading: string;
  rows: ComparisonRow[];
};

export type ComparisonColumn = {
  name: string;
  price: string;
  /** One line on what this column is for. */
  tagline: string;
};

type PricingComparisonProperties = {
  columns: ComparisonColumn[];
  groups: ComparisonGroup[];
};

/**
 * The plan comparison, as a real table.
 *
 * Four columns will not fit a phone, and stacking a comparison destroys the
 * thing it exists to do, so it scrolls sideways instead with the label column
 * pinned. The header is sticky too, so a long group still says which column is
 * which.
 */
const classes = {
  section: "w-full bg-figure-ground py-24 max-md:py-16",
  shell: "mx-auto w-full max-w-page px-24 max-xl:px-10 max-sm:px-6",
  scroller: "-mx-6 overflow-x-auto px-6 max-sm:-mx-4 max-sm:px-4",
  table: "w-full min-w-[720px] border-collapse text-left",
  corner: "sticky left-0 z-10 bg-figure-ground align-bottom",
  columnHead: "px-6 pb-6 align-bottom max-sm:px-4",
  columnName: "font-medium font-sans text-base text-primary-foreground",
  columnPrice: "pt-1 font-sans text-[15px] text-figure-body",
  columnTagline: "pt-3 font-sans text-[13px] text-figure-body",
  groupHead:
    "border-figure-rule border-b pt-12 pb-4 font-medium font-mono text-figure-accent text-xs uppercase tracking-[0.18em]",
  rowLabel:
    "sticky left-0 z-10 bg-figure-ground py-4 pr-6 font-sans text-[15px] text-figure-body",
  cell: "px-6 py-4 font-sans text-[15px] text-primary-foreground max-sm:px-4",
  tick: "size-[18px] text-figure-accent",
  dash: "size-[18px] text-figure-line-dim",
  row: "border-figure-rule/60 border-b",
} as const;

const renderValue = (value: ComparisonValue) => {
  if (value === true) {
    return (
      <Check aria-label="Included" className={classes.tick} strokeWidth={2.5} />
    );
  }

  if (value === false) {
    return (
      <Minus
        aria-label="Not included"
        className={classes.dash}
        strokeWidth={2}
      />
    );
  }

  return value;
};

export const PricingComparison = ({
  columns,
  groups,
}: PricingComparisonProperties) => (
  <section className={classes.section}>
    <div className={classes.shell}>
      <div className={classes.scroller}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th
                className={`${classes.corner} ${classes.columnHead}`}
                scope="col"
              >
                <span className="sr-only">Feature</span>
              </th>
              {columns.map((column) => (
                <th
                  className={classes.columnHead}
                  key={column.name}
                  scope="col"
                >
                  <span className={classes.columnName}>{column.name}</span>
                  <span className={`block ${classes.columnPrice}`}>
                    {column.price}
                  </span>
                  <span className={`block ${classes.columnTagline}`}>
                    {column.tagline}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {groups.map((group) => (
            <tbody key={group.heading}>
              <tr>
                <th
                  className={`${classes.corner} ${classes.groupHead}`}
                  colSpan={columns.length + 1}
                  scope="colgroup"
                >
                  {group.heading}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr className={classes.row} key={row.label}>
                  <th className={classes.rowLabel} scope="row">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      className={classes.cell}
                      key={`${row.label}-${columns[index]?.name ?? index}`}
                    >
                      {renderValue(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  </section>
);
