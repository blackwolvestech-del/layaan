import { Link } from "react-router";
import { HelpLinks, PolicyLayout, PolicyPlaceholder } from "@/components/commerce/PolicyParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { PendingNote } from "@/components/ui/misc";

// Structure only: the legal text must be written and approved by the business. Each section
// states what it will cover and holds a visible placeholder until then.
export default function Terms() {
  return (
    <>
      <PageHeader docTitle="Terms & conditions" eyebrow="Legal" title="Terms & conditions" crumbs={[{ label: "Terms & conditions" }]}>
        <PendingNote>Legal copy pending approval — last updated date to be confirmed</PendingNote>
      </PageHeader>
      <PolicyLayout
        aside={<HelpLinks />}
        sections={[
          {
            id: "general",
            title: "General terms",
            body: (
              <>
                <p>These terms apply to the use of this website and to orders placed through it.</p>
                <PolicyPlaceholder>Business name and registered details, who the terms apply to, and how they may change.</PolicyPlaceholder>
              </>
            ),
          },
          {
            id: "orders",
            title: "Orders",
            body: <PolicyPlaceholder>How an order is placed and accepted, order confirmation, availability, and cancellation by either party.</PolicyPlaceholder>,
          },
          {
            id: "payments",
            title: "Payments",
            body: <PolicyPlaceholder>Accepted payment methods, currency, when payment is taken, taxes, and pricing errors.</PolicyPlaceholder>,
          },
          {
            id: "shipping",
            title: "Shipping",
            body: (
              <>
                <p>
                  See <Link to="/shipping">shipping &amp; delivery</Link> for how orders are delivered.
                </p>
                <PolicyPlaceholder>Delivery obligations, risk and ownership transfer, and delays.</PolicyPlaceholder>
              </>
            ),
          },
          {
            id: "returns",
            title: "Returns",
            body: (
              <>
                <p>
                  See <Link to="/returns">returns &amp; exchanges</Link> for how to request a return.
                </p>
                <PolicyPlaceholder>Return rights, refund timing and method, and exclusions.</PolicyPlaceholder>
              </>
            ),
          },
          {
            id: "product-information",
            title: "Product information",
            body: <PolicyPlaceholder>Accuracy of descriptions, colours shown on screen, sizing, and product care.</PolicyPlaceholder>,
          },
          {
            id: "website-usage",
            title: "Website usage",
            body: (
              <>
                <PolicyPlaceholder>Acceptable use, intellectual property, accounts, liability, and governing law.</PolicyPlaceholder>
                <p>
                  How personal information is handled is described in the <Link to="/privacy-policy">privacy policy</Link>.
                </p>
              </>
            ),
          },
          {
            id: "contact",
            title: "Contact",
            body: (
              <>
                <p>
                  Questions about these terms can be sent through the <Link to="/contact">contact page</Link>.
                </p>
                <PolicyPlaceholder>Official contact email, phone and postal address for legal notices.</PolicyPlaceholder>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
