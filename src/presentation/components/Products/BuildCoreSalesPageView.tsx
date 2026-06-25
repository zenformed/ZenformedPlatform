'use client';

import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { resolveZenformedAppIconSrc } from '@zenformed/core/dashboard-shell';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import type { ProductPricingPageConfig } from '@/platform/products/productPricingCatalog';
import {
  BUILDCORE_PRICING_SECTION_ID,
  BUILDCORE_SALES_BENEFITS,
  BUILDCORE_SALES_FAQ,
  BUILDCORE_SALES_FEATURES_SECTION,
  BUILDCORE_SALES_FINAL_CTA,
  BUILDCORE_SALES_HERO,
  BUILDCORE_SALES_SCREENSHOTS,
  BUILDCORE_SALES_WHY_SECTION,
} from '@/platform/products/buildCoreSalesContent';
import { BuildCoreSalesBenefitIcon } from '@/presentation/components/Products/BuildCoreSalesBenefitIcon';
import { BuildCoreSalesCheckCircleIcon } from '@/presentation/components/Products/BuildCoreSalesCheckCircleIcon';
import { PricingCheckIcon } from '@/presentation/components/Products/PricingCheckIcon';
import { ProductPricingSection } from '@/presentation/components/Products/ProductPricingSection';
import { SalesScreenshotCarousel } from '@/presentation/components/Products/SalesScreenshotCarousel';
import { SalesScreenshotLightbox } from '@/presentation/components/Products/SalesScreenshotLightbox';
import { useCheckoutIntentSelection } from '@/presentation/hooks/useCheckoutIntentSelection';
import { resolveBuildCoreDemoUrl } from '@/platform/products/resolveBuildCoreDemoUrl';
import styles from '../../../../app/products/products.module.css';

export type BuildCoreSalesPageViewProps = {
  readonly config: ProductPricingPageConfig;
};

function resolveBuildCoreIconSrc(): string | undefined {
  const product = PLATFORM_APPS.find((app) => app.id === 'buildcore');
  if (product == null) return undefined;
  return resolveZenformedAppIconSrc(product);
}

function scrollToPricing(): void {
  document.getElementById(BUILDCORE_PRICING_SECTION_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function BuildCoreSalesPageView({ config }: BuildCoreSalesPageViewProps): ReactElement {
  const { selectCheckoutIntent } = useCheckoutIntentSelection();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [heroPreviewOpen, setHeroPreviewOpen] = useState(false);
  const productIconSrc = resolveBuildCoreIconSrc();

  const defaultTrialPlanSlug = useMemo(() => {
    const recommended = config.plans.find((plan) => plan.recommended === true);
    return recommended?.planSlug ?? config.plans[0]?.planSlug ?? 'starter';
  }, [config.plans]);

  const liveDemoUrl = useMemo(() => resolveBuildCoreDemoUrl(), []);

  const screenshotSlides = useMemo(
    () =>
      BUILDCORE_SALES_SCREENSHOTS.map((shot) => ({
        id: shot.id,
        title: shot.title,
        description: shot.description,
        imageSrc: shot.imageSrc,
        imageAlt: shot.imageAlt,
      })),
    [],
  );

  const startFreeTrial = useCallback(() => {
    void selectCheckoutIntent({
      productSlug: config.appSlug,
      planSlug: defaultTrialPlanSlug,
      billingCycle: 'monthly',
      checkoutMode: 'trial',
    });
  }, [config.appSlug, defaultTrialPlanSlug, selectCheckoutIntent]);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaqIndex((current) => (current === index ? null : index));
  }, []);

  const openHeroPreview = useCallback(() => {
    setHeroPreviewOpen(true);
  }, []);

  const closeHeroPreview = useCallback(() => {
    setHeroPreviewOpen(false);
  }, []);

  const heroPreviewSlide = screenshotSlides[0];

  return (
    <div className={styles.salesPage}>
      <section className={styles.salesHero} aria-labelledby="buildcore-hero-title">
        <div className={styles.salesHeroInner}>
          <div className={styles.salesHeroCopy}>
            <div className={styles.pricingLabelPill}>
              {productIconSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={productIconSrc}
                  alt=""
                  className={styles.pricingLabelIcon}
                  width={20}
                  height={20}
                />
              ) : null}
              <p className={styles.pricingLabel}>{config.label}</p>
            </div>

            <h1 id="buildcore-hero-title" className={styles.salesHeroTitle}>
              {BUILDCORE_SALES_HERO.headline}
            </h1>
            <p className={styles.salesHeroSubheadline}>{BUILDCORE_SALES_HERO.subheadline}</p>

            <div className={styles.salesHeroCtaRow}>
              <div className={styles.salesHeroCtaPrimaryRow}>
                <a href={liveDemoUrl} className={styles.salesCtaDemo}>
                  {BUILDCORE_SALES_HERO.liveDemoCta}
                </a>
                <button type="button" className={styles.salesCtaPrimary} onClick={startFreeTrial}>
                  Start Free Trial
                </button>
              </div>
              <button type="button" className={styles.salesCtaSecondary} onClick={scrollToPricing}>
                View Pricing
              </button>
            </div>

            <ul className={styles.salesHeroTrustRow}>
              {BUILDCORE_SALES_HERO.trustItems.map((item) => (
                <li key={item}>
                  <PricingCheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.salesHeroScreenshotRgbWrap}>
            <figure className={styles.salesHeroScreenshotFrame}>
              <button
                type="button"
                className={styles.salesHeroScreenshotButton}
                aria-label={`Preview ${heroPreviewSlide?.title ?? 'product'} screenshot`}
                onClick={openHeroPreview}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={BUILDCORE_SALES_HERO.screenshotSrc}
                  alt={BUILDCORE_SALES_HERO.screenshotAlt}
                  className={styles.salesHeroScreenshot}
                  loading="eager"
                />
              </button>
            </figure>
          </div>
        </div>
      </section>

      <section
        className={`${styles.salesSection} ${styles.salesSectionAfterHero}`}
        aria-labelledby="buildcore-features-title"
      >
        <div className={styles.salesSectionInner}>
          <h2 id="buildcore-features-title" className={styles.salesSectionTitle}>
            {BUILDCORE_SALES_FEATURES_SECTION.title}
          </h2>
          <div className={styles.salesBenefitsGrid}>
            {BUILDCORE_SALES_BENEFITS.map((benefit) => (
              <article key={benefit.title} className={styles.salesGlassCard}>
                <div className={styles.salesCardHeader}>
                  <BuildCoreSalesBenefitIcon icon={benefit.icon} />
                  <h3 className={styles.salesCardTitle}>{benefit.title}</h3>
                </div>
                <p className={styles.salesCardBody}>{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.salesSection} aria-labelledby="buildcore-why-title">
        <div className={styles.salesSectionInner}>
          <h2 id="buildcore-why-title" className={styles.salesSectionTitle}>
            {BUILDCORE_SALES_WHY_SECTION.title}
          </h2>
          <p className={styles.salesSectionIntro}>{BUILDCORE_SALES_WHY_SECTION.intro}</p>
          <div className={styles.salesWhyPanel}>
            <div className={styles.salesWhyPanelGrid}>
              <div className={styles.salesWhyPanelColumn}>
                {BUILDCORE_SALES_WHY_SECTION.items.slice(0, 4).map((item) => (
                  <article key={item.title} className={styles.salesWhyFeature}>
                    <BuildCoreSalesCheckCircleIcon />
                    <div className={styles.salesWhyFeatureCopy}>
                      <h3 className={styles.salesWhyFeatureTitle}>{item.title}</h3>
                      <p className={styles.salesWhyFeatureBody}>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className={styles.salesWhyPanelColumn}>
                {BUILDCORE_SALES_WHY_SECTION.items.slice(4, 8).map((item) => (
                  <article key={item.title} className={styles.salesWhyFeature}>
                    <BuildCoreSalesCheckCircleIcon />
                    <div className={styles.salesWhyFeatureCopy}>
                      <h3 className={styles.salesWhyFeatureTitle}>{item.title}</h3>
                      <p className={styles.salesWhyFeatureBody}>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.salesWhyCarousel}>
            <h2 id="buildcore-screenshots-title" className={styles.salesWhyCarouselTitle}>
              See BuildCore in action
            </h2>
            <SalesScreenshotCarousel slides={screenshotSlides} ariaLabel="BuildCore product screenshots" />
          </div>
        </div>
      </section>

      <section
        className={`${styles.salesSection} ${styles.salesSectionPricing}`}
        id={BUILDCORE_PRICING_SECTION_ID}
        aria-label="Pricing"
      >
        <div className={styles.salesSectionInner}>
          <ProductPricingSection config={config} variant="embedded" suppressSectionWrapper />
        </div>
      </section>

      <section className={styles.salesSection} aria-labelledby="buildcore-faq-title">
        <div className={styles.salesSectionInner}>
          <h2 id="buildcore-faq-title" className={styles.salesSectionTitle}>
            Frequently Asked Questions
          </h2>
          <div className={styles.salesFaqList}>
            {BUILDCORE_SALES_FAQ.map((item, index) => {
              const isOpen = openFaqIndex === index;
              const panelId = `buildcore-faq-panel-${index}`;
              const buttonId = `buildcore-faq-button-${index}`;
              return (
                <article key={item.question} className={styles.salesFaqItem}>
                  <h3 className={styles.salesFaqQuestionWrap}>
                    <button
                      id={buttonId}
                      type="button"
                      className={styles.salesFaqQuestion}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{item.question}</span>
                      <span className={styles.salesFaqIcon} aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                  </h3>
                  {isOpen ? (
                    <div id={panelId} className={styles.salesFaqAnswer} role="region" aria-labelledby={buttonId}>
                      <p>{item.answer}</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.salesSection} ${styles.salesSectionFinal}`} aria-labelledby="buildcore-final-cta-title">
        <div className={styles.salesSectionInner}>
          <div className={styles.salesFinalCtaInner}>
            <h2 id="buildcore-final-cta-title" className={styles.salesFinalCtaTitle}>
              {BUILDCORE_SALES_FINAL_CTA.headline}
            </h2>
            <p className={styles.salesFinalCtaSupport}>{BUILDCORE_SALES_FINAL_CTA.supportText}</p>
            <div className={styles.salesHeroCtaRow}>
              <button type="button" className={styles.salesCtaPrimary} onClick={startFreeTrial}>
                Start Free Trial
              </button>
              <button type="button" className={styles.salesCtaSecondary} onClick={scrollToPricing}>
                Choose a Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {heroPreviewOpen && heroPreviewSlide?.imageSrc != null ? (
        <SalesScreenshotLightbox
          slide={{
            title: heroPreviewSlide.title,
            imageSrc: heroPreviewSlide.imageSrc,
            imageAlt: heroPreviewSlide.imageAlt,
          }}
          onClose={closeHeroPreview}
        />
      ) : null}
    </div>
  );
}
