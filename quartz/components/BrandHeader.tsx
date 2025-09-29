import { QuartzComponent, QuartzComponentConstructor } from "./types"

interface NavLink {
  text: string
  link: string
}

interface Options {
  navLinks?: NavLink[]
  tagline?: string
  cta?: NavLink
}

export default ((opts?: Options) => {
  const navLinks = opts?.navLinks ?? []
  const tagline = opts?.tagline ?? ""
  const cta = opts?.cta

  const BrandHeader: QuartzComponent = ({ cfg }) => {
    const siteTitle = cfg?.configuration?.pageTitle ?? ""

    return (
      <div class="brand-header">
        <div class="brand-header__identity">
          <a class="brand-header__title" href="/">
            {siteTitle}
          </a>
          {tagline && <p class="brand-header__tagline">{tagline}</p>}
        </div>
        <nav class="brand-header__nav" aria-label="Primary">
          <ul>
            {navLinks.map(({ text, link }) => (
              <li><a href={link}>{text}</a></li>
            ))}
          </ul>
        </nav>
        {cta && (
          <a class="brand-header__cta" href={cta.link}>
            {cta.text}
          </a>
        )}
      </div>
    )
  }

  BrandHeader.css = `
  .brand-header {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--lightgray);
  }

  @media (min-width: 768px) {
    .brand-header {
      flex-direction: row;
      align-items: center;
    }
  }

  .brand-header__identity {
    flex: 1 1 auto;
  }

  .brand-header__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--dark);
    text-decoration: none;
  }

  body[data-theme="dark"] .brand-header__title {
    color: var(--darkgray);
  }

  .brand-header__title:hover,
  .brand-header__title:focus {
    color: var(--secondary);
  }

  .brand-header__tagline {
    margin: 0.25rem 0 0;
    font-size: 0.95rem;
    color: var(--gray);
  }

  .brand-header__nav ul {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
  }

  .brand-header__nav a {
    text-decoration: none;
    font-weight: 500;
    color: var(--darkgray);
    padding-bottom: 0.15rem;
    border-bottom: 2px solid transparent;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  body[data-theme="dark"] .brand-header__nav a {
    color: var(--gray);
  }

  .brand-header__nav a:hover,
  .brand-header__nav a:focus {
    border-color: var(--secondary);
    color: var(--secondary);
  }

  .brand-header__cta {
    align-self: flex-start;
    background: var(--secondary);
    color: var(--light);
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .brand-header__cta:hover,
  .brand-header__cta:focus {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }

  @media (prefers-reduced-motion: reduce) {
    .brand-header__cta,
    .brand-header__nav a {
      transition: none;
    }
  }
  `

  return BrandHeader
}) satisfies QuartzComponentConstructor
