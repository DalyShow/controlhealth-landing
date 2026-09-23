import type { LucideIcon } from "lucide-react";

export type TrustItem = {
  icon: LucideIcon;
  label: string;
};

type TrustRowProperties = {
  items: TrustItem[];
};

/**
 * A short row of reassurances — compliance, privacy, reach — each a glyph and
 * a few words. One line on a wide screen; on a phone it wraps and centres
 * rather than running off the edge.
 */
const classes = {
  root: "m-0 flex list-none items-center gap-[43px] p-0 max-md:flex-wrap max-md:justify-center max-md:gap-x-[18px] max-md:gap-y-2",
  item: "flex items-center gap-2 whitespace-nowrap font-sans font-semibold text-base text-primary-foreground leading-6 max-md:text-[13px] max-md:leading-5",
  icon: "size-6 shrink-0 text-primary-400 max-md:size-[18px]",
} as const;

export const TrustRow = ({ items }: TrustRowProperties) => (
  <ul className={classes.root}>
    {items.map(({ icon: Icon, label }) => (
      <li className={classes.item} key={label}>
        <Icon aria-hidden="true" className={classes.icon} strokeWidth={2} />
        {label}
      </li>
    ))}
  </ul>
);
