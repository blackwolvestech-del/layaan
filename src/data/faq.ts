// Official FAQ content transcribed from the client-supplied Layaan FAQ.docx.
// Bracketed placeholders and original wording are intentionally preserved.

export type FaqAnswerBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "lines"; items: string[] };

export interface FaqItem {
  q: string;
  answer: FaqAnswerBlock[];
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

const paragraphs = (...text: string[]): FaqAnswerBlock[] => text.map((value) => ({ type: "paragraph", text: value }));

export const faqCategories: FaqCategory[] = [
  {
    id: "about-layaan",
    title: "About LAYAAN",
    items: [
      {
        q: "What is LAYAAN?",
        answer: paragraphs(
          "LAYAAN is a contemporary women's fashion label created for women who appreciate distinctive silhouettes, refined details and effortless sophistication.",
          "Our collections bring together modern cuts, considered tailoring and an elevated approach to everyday and occasion dressing.",
        ),
      },
      {
        q: "Where is LAYAAN based?",
        answer: paragraphs("LAYAAN is proudly based in Lahore, with orders currently available for delivery across Pakistan."),
      },
      {
        q: "What makes LAYAAN different?",
        answer: paragraphs(
          "LAYAAN is designed for women who don't want ordinary.",
          "Our collections explore distinctive silhouettes, modern interpretations of classic pieces and refined details—creating clothing that feels contemporary, confident and individual.",
        ),
      },
    ],
  },
  {
    id: "products-sizing",
    title: "Products & sizing",
    items: [
      {
        q: "Are LAYAAN pieces ready-to-wear?",
        answer: paragraphs(
          "Unless otherwise stated on the product page, LAYAAN pieces are ready-to-wear.",
          "Certain designs may be made-to-order or available with customization. This will always be clearly mentioned before you place your order.",
        ),
      },
      {
        q: "How do I choose my size?",
        answer: paragraphs(
          "Please refer to the size chart available on each product page before placing your order.",
          "As our silhouettes vary from structured and tailored to relaxed and fluid, we recommend checking the measurements of the specific design rather than relying only on your usual size.",
        ),
      },
      {
        q: "What if I am between two sizes?",
        answer: paragraphs("Our team will be happy to assist you in selecting the most suitable size. You may contact us via WhatsApp with your measurements and the name of the piece you are interested in."),
      },
      {
        q: "Do you offer custom measurements?",
        answer: paragraphs(
          "Selected LAYAAN designs may be available for custom measurements. Please contact our team before placing your order to confirm availability.",
          "Customized pieces may have different delivery and exchange conditions.",
        ),
      },
      {
        q: "Can I request a change in length or fit?",
        answer: paragraphs(
          "Alterations may be possible on cutomized designs. Please contact our team before placing your order.",
          "Once a garment has entered production or alteration, changes may no longer be possible.",
        ),
      },
    ],
  },
  {
    id: "fabrics-care",
    title: "Fabrics & care",
    items: [
      {
        q: "What fabrics does LAYAAN use?",
        answer: paragraphs(
          "We select fabrics according to the character, structure and movement of each design.",
          "The fabric composition and relevant details are provided on the individual product page whenever applicable.",
        ),
      },
      {
        q: "How should I care for my LAYAAN piece?",
        answer: paragraphs(
          "Care instructions vary according to fabric, construction and embellishment.",
          "Please follow the care instructions supplied with your garment. When in doubt, we recommend professional dry cleaning for delicate or structured pieces.",
        ),
      },
      {
        q: "Will the colour look exactly like the photographs?",
        answer: paragraphs(
          "We make every effort to represent our colours as accurately as possible.",
          "However, slight variations may occur due to studio lighting, photography and individual screen settings.",
        ),
      },
    ],
  },
  {
    id: "orders-payment",
    title: "Orders & payment",
    items: [
      {
        q: "How can I place an order?",
        answer: paragraphs(
          "Select your desired piece, choose your size and available options, add it to your bag and proceed to checkout.",
          "Once your order is successfully placed, you will receive an order confirmation.",
        ),
      },
      {
        q: "What payment methods do you accept?",
        answer: [
          { type: "paragraph", text: "LAYAAN accepts the payment methods displayed at checkout, which may include:" },
          { type: "list", items: ["Debit/Credit Card", "[JazzCash / Easypaisa]", "[Cash on Delivery, if applicable]"] },
        ],
      },
      {
        q: "Is Cash on Delivery available?",
        answer: paragraphs(
          "[Insert your final COD policy here.]",
          "For high-value orders, LAYAAN may require advance payment or order confirmation before dispatch.",
        ),
      },
      {
        q: "Can I change or cancel my order?",
        answer: paragraphs(
          "Please contact us as soon as possible after placing your order.",
          "Cancellation or modification is only possible before your order enters processing, production or dispatch.",
          "Once an order has entered these stages, it may no longer be possible to make changes.",
        ),
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    items: [
      {
        q: "Where do you deliver?",
        answer: paragraphs(
          "We currently deliver across Pakistan.",
          "International delivery may be available for selected destinations. Please contact our team for international orders.",
        ),
      },
      {
        q: "How long will my order take?",
        answer: paragraphs(
          "Delivery timelines vary depending on whether the piece is ready-to-ship, made-to-order or customized.",
          "The estimated timeline will be mentioned on the relevant product page.",
        ),
      },
      {
        q: "Will I receive tracking information?",
        answer: paragraphs("Yes. Once your order has been dispatched, tracking information will be shared through [WhatsApp/SMS/email]."),
      },
      {
        q: "What happens if I am unavailable when the courier arrives?",
        answer: paragraphs(
          "Our courier partner may attempt delivery again according to their delivery procedures.",
          "Please ensure that your contact number and delivery address are accurate when placing your order.",
        ),
      },
    ],
  },
  {
    id: "exchanges-returns",
    title: "Exchanges & returns",
    items: [
      {
        q: "Do you offer exchanges?",
        answer: paragraphs(
          "Yes, eligible items may be exchanged according to our Exchange & Return Policy.",
          "Items must meet all eligibility requirements and requests must be submitted within the specified timeframe.",
        ),
      },
      {
        q: "Do you offer refunds?",
        answer: paragraphs(
          "Refunds are available only in circumstances specified in our Refund & Exchange Policy.",
          "Please note that customized, altered, sale or promotional pieces may have different conditions.",
        ),
      },
      {
        q: "Can I exchange a customized piece?",
        answer: paragraphs("Customized or altered pieces are generally non-exchangeable unless they arrive damaged, defective or materially different from what was agreed."),
      },
      {
        q: "What if I receive the wrong or damaged item?",
        answer: paragraphs(
          "Please contact LAYAAN within [24/48 hours] of delivery and provide photographs/videos of the item and packaging.",
          "Our team will review the issue and guide you through the resolution.",
        ),
      },
    ],
  },
  {
    id: "customer-care",
    title: "Customer care",
    items: [
      {
        q: "How can I contact LAYAAN?",
        answer: [
          { type: "paragraph", text: "For styling assistance, sizing advice, order support or general enquiries, contact our customer-care team:" },
          { type: "lines", items: ["WhatsApp: [NUMBER]", "Email: [EMAIL]", "Instagram: [INSTAGRAM HANDLE]"] },
          { type: "paragraph", text: "Customer Care Hours: [Monday-Friday & 10am-7 pm ]" },
          { type: "paragraph", text: "We are here to make your LAYAAN experience effortless." },
        ],
      },
    ],
  },
];

export const faqAnswerText = (item: FaqItem) => item.answer.flatMap((block) => block.type === "paragraph" ? [block.text] : block.items).join(" ");
