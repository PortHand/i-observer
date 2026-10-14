// FAQ section of the Contact page. Facts mirror the other pages: plans and prices come from the
// checkout content, systems and limits from the "What is iOverlay?" page.

import { appInfo } from "../../home/content/homeContent";
import { pricePlans } from "../../get-ioverlay/content/getContent";
import { formatAmount } from "../../get-ioverlay/helper/getHelper";
import { checkoutLink, routes } from "@/helper/route";
import { sectionIds } from "./contactContent";

const messageLink = { href: `#${sectionIds.message}`, label: "Send us a message" };

export const faqSection = {
  eyebrow: "FAQ",
  title: "Common questions.",
  lead: "Most questions are answered here: hiding from screen shares, paying by UPI, getting your login and using the app.",
};

export const search = {
  label: "Search the FAQ",
  placeholder: "Search, e.g. UTR, Linux, shortcuts",
  clear: "Clear search",
  results: "{count} of {total} questions",
  empty: "No answers match “{query}”.",
  emptyCta: "Ask us directly",
  emptyHref: `#${sectionIds.message}`,
};

export const categoriesLabel = "Categories";
export const allLabel = "All questions";

export type CategoryId = "basics" | "privacy" | "payment" | "login" | "app";

export const categories: { id: CategoryId; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "privacy", label: "Screen sharing & privacy" },
  { id: "payment", label: "Plans & payment" },
  { id: "login", label: "Login & access" },
  { id: "app", label: "Using the app" },
];

export interface Faq {
  id: string;
  category: CategoryId;
  question: string;
  answer: string;
  link?: { href: string; label: string };
}

const planList = pricePlans.map((plan) => `${plan.name} (${formatAmount(plan.amount)}, ${plan.period.toLowerCase()})`).join(", ");

export const faqs: Faq[] = [
  {
    id: "what-is-it",
    category: "basics",
    question: "What is iOverlay?",
    answer:
      "A desktop app that puts a private window on top of your screen. You can read it while you present, but screen shares, recordings and screenshots leave it out.",
    link: { href: routes.whatIsIOverlay, label: "Read the overview" },
  },
  {
    id: "who-for",
    category: "basics",
    question: "Who is it for?",
    answer:
      "Anyone who shares a screen and wants their own material in view: presenters with talking points, sales demos with pricing notes, teachers with lesson plans and support teams with runbooks.",
  },
  {
    id: "what-inside",
    category: "basics",
    question: "What can I put in the overlay?",
    answer:
      "It has a built-in browser, so you can open any site: your notes, a doc, a script or a dashboard. Chatting with your preferred AI model inside the overlay is coming soon.",
  },
  {
    id: "which-apps",
    category: "privacy",
    question: "Which apps is the overlay hidden from?",
    answer:
      "Zoom, Google Meet, Microsoft Teams, screen recordings and screenshots. iOverlay asks your operating system to leave the window out of every capture, so it works with any app that captures the screen the normal way.",
  },
  {
    id: "linux",
    category: "privacy",
    question: "Is it hidden on Linux?",
    answer:
      "No. The overlay and shortcuts work on Linux, but Linux can't hide windows from screen capture, so the overlay shows up in shares there.",
  },
  {
    id: "black-box",
    category: "privacy",
    question: "Why do viewers see a black box on Windows?",
    answer:
      "Windows 10 before version 2004 can't exclude a window from capture, so it shows the overlay as a black box instead. Update to Windows 10 version 2004 or later, or Windows 11.",
  },
  {
    id: "macos-15",
    category: "privacy",
    question: "Is it fully hidden on macOS 15 and later?",
    answer:
      "Usually, but some capture tools on macOS 15 and later have been reported to record it anyway. Do a quick test share with the tools you use before an important call.",
  },
  {
    id: "camera",
    category: "privacy",
    question: "Can someone still see it?",
    answer:
      "Only through something that isn't screen capture: nothing can hide it from a camera pointed at your screen, or from someone looking over your shoulder.",
  },
  {
    id: "plans",
    category: "payment",
    question: "Which plans are there?",
    answer: `${planList}. Pick one at checkout; you can see the full price before you pay.`,
    link: { href: routes.getIOverlay, label: "Compare plans" },
  },
  {
    id: "how-pay",
    category: "payment",
    question: "How do I pay?",
    answer:
      "By UPI. Enter your email and phone, then scan the QR code with GPay, PhonePe, Paytm, BHIM or any UPI app; the amount is filled in for you. On a phone you can open your UPI app directly instead of scanning.",
    link: { href: checkoutLink, label: "Go to checkout" },
  },
  {
    id: "utr",
    category: "payment",
    question: "What is the UTR and where do I find it?",
    answer:
      "The UTR (or UPI transaction ID) is a 12-digit number your bank gives every UPI payment. Open the payment in your UPI app's history and look under its details. You share it after paying so we can match the payment to your order.",
  },
  {
    id: "screenshot",
    category: "payment",
    question: "Do I have to upload a payment screenshot?",
    answer:
      "No, it's optional. The UTR is enough to find your payment, but a screenshot (PNG or JPG, up to 5 MB) can speed things up.",
  },
  {
    id: "receipt",
    category: "payment",
    question: "Do I get a receipt?",
    answer:
      "Yes. After you share the transaction, download the PDF receipt. It has your plan, amount, reference, UTR, the submission time and your screenshot if you added one.",
  },
  {
    id: "reference",
    category: "payment",
    question: "What is the order reference?",
    answer:
      "A short code like IOV-AB12CD that we create for your order. It's added to the UPI payment note and printed on your receipt. Quote it whenever you contact us about a payment.",
  },
  {
    id: "when-login",
    category: "login",
    question: "When do I get my login?",
    answer:
      "Within 24 hours of sharing your transaction. We verify the payment and email your login credentials to the address you entered at checkout.",
  },
  {
    id: "no-login",
    category: "login",
    question: "It's been more than 24 hours and I have no login. What now?",
    answer:
      "Check your spam or promotions folder first. If it isn't there, contact us with your order reference and UTR and we'll sort it out.",
    link: messageLink,
  },
  {
    id: "wrong-email",
    category: "login",
    question: "I entered the wrong email at checkout.",
    answer: `Write to ${appInfo.supportEmail} with your order reference and the correct email, and we'll send your login there.`,
    link: messageLink,
  },
  {
    id: "systems",
    category: "app",
    question: "Which systems does it run on?",
    answer:
      "Windows 10 or 11 (64-bit), macOS 12 or later on Apple Silicon and Intel, and 64-bit Linux including Ubuntu, Debian and most distros. Hiding from capture works on Windows and macOS only.",
  },
  {
    id: "shortcuts",
    category: "app",
    question: "What are the keyboard shortcuts?",
    answer:
      "Show or hide the overlay with ⌥ ⇧ G on macOS or Ctrl+Shift+Space on Windows and Linux. Toggle click-through with ⌘/Ctrl+Shift+X, and quit with ⌘/Ctrl+Shift+Q. They work while any app has focus.",
  },
  {
    id: "click-through",
    category: "app",
    question: "Can I click through the overlay?",
    answer:
      "Yes. Turn on click-through and your clicks pass to the window underneath, so the overlay never gets in the way. You can also fade it from 30 to 100% opacity.",
  },
];
