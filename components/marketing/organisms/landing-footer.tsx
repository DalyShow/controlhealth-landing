import { ParticleMark } from "@/components/marketing/atoms/particle-mark";
import {
  SocialIcon,
  type SocialNetwork,
} from "@/components/marketing/atoms/social-icon";

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

export type SocialLink = {
  network: SocialNetwork;
  href: string;
};

type LandingFooterProperties = {
  /** Wordmark that sits under the mark, completing a stacked lockup. */
  wordmarkSrc: string;
  markLabel: string;
  blurb: string;
  /** The closing line, set heavier than the blurb above it. */
  statement: string;
  columns: FooterColumn[];
  socials: SocialLink[];
  legal: string;
};

/** Mark width in the footer, in CSS pixels. */
const MARK_SIZE = 72;

/** The wordmark asset's own proportions, so the browser can plan for it. */
const WORDMARK = { width: 1394, height: 164 } as const;

/**
 * Page footer, on the same ground as everything below the hero and separated
 * from it by a hairline rather than a change of colour.
 *
 * The brand block takes five of the twelve columns — the mark, the wordmark
 * under it so the two read as a stacked lockup, then the blurb and the closing
 * line. The link columns take the last six, which leaves a column of air
 * between the halves without needing a rule to divide them.
 */
const classes = {
  footer: "w-full border-figure-rule border-t bg-figure-ground",
  shell:
    "mx-auto w-full max-w-page px-24 py-24 max-xl:px-10 max-md:py-16 max-sm:px-6",
  grid: "grid grid-cols-12 gap-x-6 gap-y-16",
  brand: "col-span-5 flex flex-col gap-8 max-lg:col-span-12",
  lockup: "flex flex-col items-start gap-5",
  wordmark: "block h-5 w-auto",
  copy: "flex max-w-[42ch] flex-col gap-5",
  blurb: "text-pretty font-sans text-[15px] text-figure-body leading-[1.65]",
  statement:
    "text-pretty font-medium font-sans text-[15px] text-primary-foreground leading-[1.65]",
  columns:
    "col-span-6 col-start-7 grid grid-cols-3 gap-x-6 gap-y-12 max-lg:col-span-12 max-lg:col-start-1 max-sm:grid-cols-1",
  column: "flex flex-col gap-5",
  heading:
    "font-medium font-mono text-figure-label text-xs uppercase tracking-[0.18em]",
  links: "flex flex-col gap-3",
  link: "w-fit font-sans text-[15px] text-figure-body transition-colors hover:text-primary-foreground",
  base: "col-span-12 flex items-center justify-between gap-8 border-figure-rule border-t pt-10 max-sm:flex-col max-sm:items-start",
  socials: "flex items-center gap-5",
  social: "text-figure-body transition-colors hover:text-primary-foreground",
  legal: "font-mono text-figure-label text-xs tracking-[0.06em]",
} as const;

export const LandingFooter = ({
  wordmarkSrc,
  markLabel,
  blurb,
  statement,
  columns,
  socials,
  legal,
}: LandingFooterProperties) => (
  <footer className={classes.footer}>
    <div className={classes.shell}>
      <div className={classes.grid}>
        <div className={classes.brand}>
          <div className={classes.lockup}>
            <ParticleMark label={markLabel} size={MARK_SIZE} />
            {/* Decorative: the mark above it already carries the name. */}
            {/** biome-ignore lint/performance/noImgElement: static export, unoptimized */}
            <img
              alt=""
              className={classes.wordmark}
              height={WORDMARK.height}
              src={wordmarkSrc}
              width={WORDMARK.width}
            />
          </div>

          <div className={classes.copy}>
            <p className={classes.blurb}>{blurb}</p>
            <p className={classes.statement}>{statement}</p>
          </div>
        </div>

        <div className={classes.columns}>
          {columns.map((column) => (
            <nav
              aria-label={column.heading}
              className={classes.column}
              key={column.heading}
            >
              <p className={classes.heading}>{column.heading}</p>
              <div className={classes.links}>
                {column.links.map((link) => (
                  <a className={classes.link} href={link.href} key={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>
          ))}
        </div>

        <div className={classes.base}>
          <div className={classes.socials}>
            {socials.map((social) => (
              <a
                className={classes.social}
                href={social.href}
                key={social.network}
                rel="noreferrer"
                target="_blank"
              >
                <SocialIcon network={social.network} />
              </a>
            ))}
          </div>
          <p className={classes.legal}>{legal}</p>
        </div>
      </div>
    </div>
  </footer>
);
