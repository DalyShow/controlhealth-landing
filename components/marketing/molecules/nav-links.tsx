export type NavLink = {
  label: string;
  href: string;
};

type NavLinksProperties = {
  links: NavLink[];
};

/**
 * Horizontal row of primary navigation links for the landing header.
 */
const classes = {
  list: "flex items-center gap-2.5",
  link: "flex items-center justify-center p-2 font-medium font-sans text-base text-white transition-opacity duration-150 ease-out hover:opacity-70",
} as const;

export const NavLinks = ({ links }: NavLinksProperties) => (
  <nav className={classes.list}>
    {links.map((link) => (
      <a className={classes.link} href={link.href} key={link.href}>
        {link.label}
      </a>
    ))}
  </nav>
);
