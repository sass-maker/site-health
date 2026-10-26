import { ArrowUpRight } from 'lucide-react';
import styles from './scoreboard-workbench.module.css';

const categoryGuidance = [
  {
    title: 'Product & feature parity',
    effort:
      'Complete the promised core workflow, useful result, and recovery against relevant alternatives.',
    result:
      'Observe whether the intended audience completes the task and receives the promised value.',
  },
  {
    title: 'Design & delight',
    effort:
      'Review the rendered journey, accessible states, comprehension, friction, and recovery.',
    result:
      'Use observed preference and task success; a screenshot or checklist alone is not an outcome.',
  },
  {
    title: 'SEO & growth',
    effort:
      'Research audience intent, maintain useful owned pages, and qualify third-party profiles and distribution.',
    result:
      'Measure indexing, unique owned URLs in top-20 results, and non-QA referral conversions.',
  },
  {
    title: 'GEO & AI visibility',
    effort:
      'Keep factual profiles and answer-ready evidence current; run a versioned set of real audience questions.',
    result:
      'Record observed citations, separating controlled placements from independent editorial citations, recommendation accuracy, and attributable useful referrals.',
  },
  {
    title: 'Measurement & learning',
    effort:
      'Collect reliable, privacy-appropriate signals and keep dates, coverage, and limits explicit.',
    result: 'Show a dated signal → decision → action → comparable follow-up result.',
  },
  {
    title: 'Engineering & operations',
    effort:
      'Verify correctness, performance, privacy, reliability, and recovery in intended runtimes.',
    result:
      'Measure shipped-runtime behavior and useful service outcomes; tooling presence alone proves neither.',
  },
] as const;

function EvidenceLink({ href, children }: { href: string; children: string }) {
  return (
    <a className={styles.checklistLink} href={href} target="_blank" rel="noopener noreferrer">
      {children} <ArrowUpRight size={13} aria-hidden="true" />
    </a>
  );
}

export function ScoreboardChecklist() {
  return (
    <section className={styles.checklist} aria-labelledby="scoreboard-checklist-title">
      <nav className="section-jumps" aria-label="Checklist sections">
        <a href="#scoreboard-checklist-title">Six areas</a><a href="#ai-native-title">AI-native workflows</a><a href="#distribution-title">Distribution & indexing</a>
      </nav>
      <header className={styles.checklistHeader}>
        <div>
          <p className={styles.eyebrow}>Guidance · no automatic scoring</p>
          <h2 id="scoreboard-checklist-title">Six areas</h2>
          <p>
            Keep Effort and Result separate in all six categories. This reference does not tick
            readiness, change imported scores, or turn missing evidence into zero.
          </p>
        </div>
        <EvidenceLink href="https://github.com/sass-maker/site-health/blob/main/docs/product-readiness-checklist.md">
          Full Fleet checklist
        </EvidenceLink>
      </header>

      <div className={styles.checklistGrid}>
        {categoryGuidance.map((category) => (
          <article className={styles.checklistCard} key={category.title}>
            <h3>{category.title}</h3>
            <dl>
              <div>
                <dt>Effort</dt>
                <dd>{category.effort}</dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd>{category.result}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <section className={`${styles.distributionChecklist} ${styles.aiNativeChecklist}`} aria-labelledby="ai-native-title">
        <header>
          <p className={styles.eyebrow}>Every current application · public, private and native</p>
          <h3 id="ai-native-title">AI-native workflows</h3>
          <p>
            An agent should be able to discover, complete and recover the core job through an
            appropriate interface. Review every current application, including internal tools and
            native apps. Choose interfaces that serve the job; record a reason for each exemption.
          </p>
        </header>
        <div className={styles.distributionColumns}>
          <div>
            <h4>1. An appropriate entry point</h4>
            <p>
              Declare the core task and intended operator. Choose the CLI, API, MCP, agent workflow
              or native automation the task benefits from, including platform permissions. A
              missing promised interface remains a gap; every app does not need every interface.
            </p>
            <h4>2. Discoverable instructions</h4>
            <p>
              Keep capability discovery, installed help, setup, scoped authentication, skills and
              runnable examples aligned with the shipped version. A fresh agent should find the
              starting point and know the limits without hidden owner context.
            </p>
            <h4>3. A dependable contract</h4>
            <p>
              Verify structured inputs and outputs, schema/version expectations, errors and exit
              codes, timeouts and cancellation. Exercise actual API or MCP discovery and calls;
              document the result and recovery contract for native or browser workflows.
            </p>
          </div>
          <div>
            <h4>4. Safe, scoped actions</h4>
            <p>
              Use least privilege and revocable access; separate reads from writes. Verify previews
              or confirmation where appropriate, idempotence, bounded retries, private-data handling,
              untrusted-input defenses and recovery from interrupted mutations.
            </p>
            <h4>5. Shipped workflow proof</h4>
            <p>
              Have a fresh agent complete a core task plus a negative or recovery case in the actual
              shipped runtime. Retain replayable steps, version, date, permission scope, useful
              output and failure behavior. Interface presence or a passing source test is insufficient.
            </p>
            <h4>6. Useful use and follow-up</h4>
            <p>
              Record successful core completions and recovery over a stated window. Separate QA and
              background activity from real agent-assisted use. Keep tracking gaps unknown, then
              compare the observed result after the next bounded improvement.
            </p>
          </div>
        </div>
        <p className={styles.checklistBoundary}>
          Record applicable checks, dated evidence, remaining gaps and justified exemptions for each
          current application. These checks inform Product, Engineering and Measurement; they do not
          add a score category or change imported ratings. Unassessed products still need coverage.
        </p>
        <div className={styles.checklistResources}>
          <EvidenceLink href="https://github.com/sass-maker/site-health/blob/main/docs/product-readiness-checklist.md#ai-native-workflows">
            Canonical AI-native checklist
          </EvidenceLink>
        </div>
      </section>

      <section className={styles.distributionChecklist} aria-labelledby="distribution-title">
        <header>
          <p className={styles.eyebrow}>Public growth where intended</p>
          <h3 id="distribution-title">Third-party profiles & content distribution</h3>
          <p>
            Choose relevant, legitimate platforms for the audience and the product. Keep public
            profiles accurate, make each contribution useful on its destination, and record a
            publication or indexing receipt as evidence of work—not proof of traffic or ranking.
          </p>
        </header>
        <div className={styles.distributionColumns}>
          <div>
            <h4>SEO & growth · effort</h4>
            <ul>
              <li>
                Qualify platforms by audience fit, editorial standards, cost, and submission terms.
              </li>
              <li>
                Keep brand, product, canonical URL, description, and category accurate on selected
                profiles.
              </li>
              <li>
                Publish original or meaningfully adapted material on relevant channels; log each
                destination, URL, date, and submission/index receipt.
              </li>
              <li>
                Before every public post, run the Humanizer skill. If it is not listed with
                advertised skills, check the managed install at
                ~/.local/share/agent-config/skills/humanizer/SKILL.md. Check factual claims, links,
                and disclosures, and retain the final copy revision. If the skill cannot be loaded,
                hold that post and report the missing step.
              </li>
            </ul>
            <h4>SEO & growth · result</h4>
            <ul>
              <li>
                Check changed owned URLs in Search Console and record first-observed index state,
                selected canonical, and evidence time; this is not the exact index event time. For
                external profiles, use evidence available from the relevant engine or destination.
              </li>
              <li>
                Count unique owned URLs appearing in the top 20 for a fixed query set; keep query,
                engine, date, and position.
              </li>
              <li>
                Measure non-QA referral visits that complete a useful conversion over a stated
                window.
              </li>
            </ul>
          </div>
          <div>
            <h4>GEO & AI visibility · effort</h4>
            <ul>
              <li>
                Keep brand-controlled third-party profiles and contributed facts consistent with
                verifiable owned evidence and known product limits; these placements are effort, not
                independent citation outcomes.
              </li>
              <li>
                Run the same versioned audience questions across named answer engines; retain date,
                query, and citation URLs.
              </li>
              <li>
                Inspect any cited third-party page when the product is absent or misrepresented
                before choosing an edit.
              </li>
            </ul>
            <h4>GEO & AI visibility · result</h4>
            <ul>
              <li>
                Record citations to brand-authored URLs as distribution results, separately from
                independent editorial citations and accurate recommendations. A placement alone is
                effort.
              </li>
              <li>
                Track attributable AI referrals and useful conversions; absence of referral tracking
                remains unknown.
              </li>
              <li>
                Repeat a comparable observation after a stated window. A 24-hour check is one
                timestamp, never an indexing or citation guarantee.
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.checklistBoundary}>
          Internal, private, and local products may mark public distribution not applicable with a
          reason. Do not expose their URLs or force a public listing. Missing observations stay
          unknown; publishing and submission are effort. Impressions and screenshots can document
          discovery or a visible result, but do not establish qualified use or growth on their own.
        </p>
        <div className={styles.checklistResources}>
          <EvidenceLink href="https://github.com/sass-maker/saas-maker/blob/main/tooling/skills/distributed-brand-search/SKILL.md">
            Third-party brand discovery & distribution
          </EvidenceLink>
          <EvidenceLink href="https://github.com/sass-maker/saas-maker/blob/main/tooling/skills/distributed-brand-search/references/platform-study.md">
            Platform study
          </EvidenceLink>
          <EvidenceLink href="https://github.com/sass-maker/saas-maker/blob/main/tooling/skills/seo-research/SKILL.md">
            SEO research workflow
          </EvidenceLink>
          <EvidenceLink href="https://github.com/sass-maker/saas-maker/blob/main/tooling/skills/agent-ready/SKILL.md">
            AI discovery and indexing
          </EvidenceLink>
        </div>
      </section>
    </section>
  );
}
