// Contact form model and validation (pure). There is no submission endpoint yet: a backend only
// needs to accept ContactMessage.
export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  subject: string;
  orderNumber: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactMessage, string>>;

export const contactSubjects = ["General enquiry", "An order", "Returns & exchanges", "Sizing & fit", "Press & collaborations", "Something else"] as const;

export const emptyContact: ContactMessage = { name: "", email: "", phone: "", subject: "", orderNumber: "", message: "" };

export const MESSAGE_MAX = 2000;

export function validateContact(v: ContactMessage): ContactErrors {
  const e: ContactErrors = {};
  if (v.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid email address, like name@example.com.";
  if (v.phone.trim() && (v.phone.replace(/\D/g, "").length < 7 || !/^[+\d\s()-]+$/.test(v.phone.trim()))) e.phone = "Enter a valid phone number, or leave it blank.";
  if (!v.subject) e.subject = "Choose a subject.";
  if (v.message.trim().length < 10) e.message = "Write a message of at least 10 characters.";
  else if (v.message.length > MESSAGE_MAX) e.message = `Keep your message under ${MESSAGE_MAX} characters.`;
  return e;
}
