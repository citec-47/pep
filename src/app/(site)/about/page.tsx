import type { Metadata } from "next";
import { ButtonLink, ResearchNotice, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About & terms",
  description:
    "How ordering works, what we ship, and the research-use terms that apply to every product in the catalogue.",
};

const STORE_EMAIL = process.env.NEXT_PUBLIC_STORE_EMAIL ?? "orders@example.com";
const STORE_WHATSAPP = process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <p className="eyebrow mb-3">About</p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        How this catalogue works
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        We publish the full specification for every peptide we stock, photograph
        each batch ourselves, and confirm availability with you before any money
        changes hands.
      </p>

      <ResearchNotice className="mt-8" />

      <section className="mt-12">
        <SectionHeading eyebrow="Ordering" title="From request to dispatch" />
        <ol className="mt-6 space-y-4">
          {[
            [
              "You place an order request",
              "Add products to your order, submit your shipping details, and you'll get a reference code like PEP-7QK3M2 straight away. No card details are collected and nothing is charged.",
            ],
            [
              "We confirm stock and quote payment",
              "We check the batch against your request and reply by email, usually inside one business day, with confirmation and payment instructions.",
            ],
            [
              "Payment clears",
              "Once we've received payment, your order moves to Paid and goes into the packing queue.",
            ],
            [
              "Cold-chain dispatch",
              "Lyophilized material ships with ice packs and tracking. Track progress any time from the reference code on the Track order page.",
            ],
          ].map(([title, body], i) => (
            <li key={title} className="card flex gap-4 p-5">
              <span className="font-mono text-sm text-signal-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="Quality" title="What ships with your order" />
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink-soft">
          <li className="card p-4">
            <strong className="font-semibold text-ink">Certificate of analysis.</strong>{" "}
            HPLC purity and mass spectrometry data for the batch you receive.
            Where a COA is already published, it&apos;s linked on the product page.
          </li>
          <li className="card p-4">
            <strong className="font-semibold text-ink">Batch photography.</strong>{" "}
            The images and video on each product page are of our own stock, not
            stock photography.
          </li>
          <li className="card p-4">
            <strong className="font-semibold text-ink">Storage guidance.</strong>{" "}
            Handling and reconstitution notes are printed on every product page
            under Specification.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="Terms" title="Research use only" />
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Every product in this catalogue is supplied strictly for in-vitro
            laboratory research. Nothing here is a drug, supplement, food or
            cosmetic, and none of it is approved for human or veterinary use,
            diagnosis, treatment or prevention of any condition.
          </p>
          <p>
            By placing an order you confirm that you are a qualified researcher
            or purchasing on behalf of a research institution, that the materials
            will be handled by trained personnel, and that you are responsible
            for compliance with the import, possession and handling rules of your
            jurisdiction. We may decline or cancel any order at our discretion.
          </p>
          <p>
            We do not provide dosing guidance, protocols for human use, or
            medical advice of any kind, and we cannot answer questions framed
            around personal use.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="Contact" title="Talk to a human" />
        <div className="card mt-6 space-y-2 p-5 text-sm">
          <p>
            <span className="text-muted">Email: </span>
            <a
              href={`mailto:${STORE_EMAIL}`}
              className="font-medium text-signal-deep hover:underline"
            >
              {STORE_EMAIL}
            </a>
          </p>
          {STORE_WHATSAPP && (
            <p>
              <span className="text-muted">Phone / WhatsApp: </span>
              <span className="font-medium text-ink">{STORE_WHATSAPP}</span>
            </p>
          )}
          <p className="text-muted">
            Quote your reference code and we&apos;ll pick up the thread.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/products">Browse the catalogue</ButtonLink>
          <ButtonLink href="/orders" variant="outline">
            Track an order
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
