import type { Variant } from "@/config/schema";
import { computeSeparators, visibleSections } from "@/lib/section-tones";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Guide } from "@/components/landing/Guide";
import { Plan } from "@/components/landing/Plan";
import { Proof } from "@/components/landing/Proof";
import { Objections } from "@/components/landing/Objections";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { QualifierRoot } from "@/components/qualifier/QualifierRoot";

/**
 * Composes a full landing page from the variant's section toggle map, in fixed
 * order, inserting auto-computed separators. The header always renders; every
 * other section is gated by the toggle. All CTAs open the qualifier.
 */
export function LandingPage({ variant }: { variant: Variant }) {
  const visible = visibleSections(variant.sections);
  const sep = computeSeparators(variant.sections);

  const sectionEls: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" variant={variant} separator={sep.hero} />,
    problem: <Problem key="problem" variant={variant} separator={sep.problem} />,
    guide: <Guide key="guide" variant={variant} separator={sep.guide} />,
    plan: <Plan key="plan" variant={variant} separator={sep.plan} />,
    proof: <Proof key="proof" variant={variant} separator={sep.proof} />,
    objections: <Objections key="objections" variant={variant} separator={sep.objections} />,
    cta: <FinalCta key="cta" variant={variant} separator={sep.cta} />,
    footer: <Footer key="footer" variant={variant} separator={sep.footer} />,
  };

  return (
    <>
      <Nav variant={variant} />
      {visible.map((key) => sectionEls[key])}
      <QualifierRoot variant={variant} />
    </>
  );
}
