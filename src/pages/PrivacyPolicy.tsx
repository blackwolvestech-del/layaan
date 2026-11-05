import { Link } from "react-router";
import { HelpLinks, PolicyLayout, PolicyPlaceholder } from "@/components/commerce/PolicyParts";
import { PageHeader } from "@/components/layout/PageHeader";
import { PendingNote } from "@/components/ui/misc";

// Structure only: the approved privacy policy must be supplied by the business. The one factual
// section ("What this website stores") describes what the site actually stores — keep it in sync
// with the storage keys used in src/hooks, src/context, src/lib and src/services.
const deviceStorage = [
  { key: "layaan-theme", purpose: "Your light / dark theme choice" },
  { key: "layaan-demo-wishlist", purpose: "Looks saved to your wishlist" },
  { key: "layaan_demo_cart_pkr", purpose: "Items in your shopping bag (product, size, quantity, measurements)" },
  { key: "layaan-auth", purpose: "Your sign-in session, when you sign in to your account" },
  { key: "layaan_address_book", purpose: "Extra delivery addresses you save to your address book" },
  { key: "layaan_customer_prefs", purpose: "Your communication preferences" },
  { key: "layaan-order-receipts", purpose: "Guest orders placed during this visit (cleared when the tab is closed)" },
];

export default function PrivacyPolicy() {
  return (
    <>
      <PageHeader docTitle="Privacy policy" eyebrow="Legal" title="Privacy policy" crumbs={[{ label: "Privacy policy" }]}>
        <PendingNote>Legal copy pending approval — last updated date to be confirmed</PendingNote>
      </PageHeader>
      <PolicyLayout
        aside={<HelpLinks />}
        sections={[
          {
            id: "introduction",
            title: "Introduction",
            body: (
              <>
                <p>This policy explains what information is collected when you use this website, how it is used and the choices you have.</p>
                <PolicyPlaceholder>Who the data controller is (business name and registered details), the scope of the policy, and applicable data-protection laws.</PolicyPlaceholder>
              </>
            ),
          },
          {
            id: "information-collected",
            title: "Information collected",
            body: <PolicyPlaceholder>Categories of personal information collected (e.g. contact, shipping, order and payment details, messages, device and usage data) and where it comes from.</PolicyPlaceholder>,
          },
          {
            id: "preview-site",
            title: "What this website stores",
            body: (
              <>
                <p>When you place an order or create an account, your contact, delivery and order details (and any measurements for made-to-measure pieces) are sent securely to LAYAAN Atelier and kept in our order system. No card payment is taken on this site. The following is also saved in your browser on this device:</p>
                <div className="my-4 overflow-hidden border border-line">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">Information stored in this browser</caption>
                    <thead className="bg-surface-2">
                      <tr>
                        <th scope="col" className="px-4 py-2.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase">
                          Stored item
                        </th>
                        <th scope="col" className="px-4 py-2.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase">
                          Purpose
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {deviceStorage.map((d) => (
                        <tr key={d.key}>
                          <td className="px-4 py-2.5 align-top font-mono text-xs break-all">{d.key}</td>
                          <td className="px-4 py-2.5">{d.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>Card details typed at checkout are checked for format only and are never stored. You can remove all of this at any time by clearing this site's data in your browser settings.</p>
              </>
            ),
          },
          {
            id: "how-used",
            title: "How information is used",
            body: <PolicyPlaceholder>Purposes of use (e.g. processing orders, delivery, customer service, marketing with consent, fraud prevention, legal obligations) and the legal basis for each.</PolicyPlaceholder>,
          },
          {
            id: "cookies",
            title: "Cookies",
            body: (
              <>
                <p>This site does not set cookies; it uses browser storage as described above.</p>
                <PolicyPlaceholder>Cookies and similar technologies used at launch (essential, analytics, marketing), their purposes and how to manage consent.</PolicyPlaceholder>
              </>
            ),
          },
          {
            id: "data-sharing",
            title: "Data sharing",
            body: <PolicyPlaceholder>Third parties information is shared with (e.g. payment provider, delivery partners, hosting, analytics), international transfers, and safeguards.</PolicyPlaceholder>,
          },
          {
            id: "data-security",
            title: "Data security",
            body: <PolicyPlaceholder>Security measures in place and how long each category of information is retained.</PolicyPlaceholder>,
          },
          {
            id: "your-rights",
            title: "Your rights",
            body: <PolicyPlaceholder>Rights available to customers (e.g. access, correction, deletion, objection, withdrawing consent, complaints to a regulator) and how to exercise them.</PolicyPlaceholder>,
          },
          {
            id: "contact",
            title: "Contact information",
            body: (
              <>
                <p>
                  Questions about this policy can be sent through the <Link to="/contact">contact page</Link>.
                </p>
                <PolicyPlaceholder>Official privacy contact (email and postal address) and, if applicable, the data protection officer.</PolicyPlaceholder>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
