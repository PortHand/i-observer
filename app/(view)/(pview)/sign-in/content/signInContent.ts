// Static content for the Sign in page.

import { checkoutLink } from "@/helper/route";
import { pricePlans } from "../../get-ioverlay/content/getContent";
import { formatAmount } from "../../get-ioverlay/helper/getHelper";
import { contactLink } from "../../contact/helper/contactHelper";
import { appInfo } from "../../home/content/homeContent";

export const intro = {
  eyebrow: "Sign in",
  title: "Welcome back.",
  lead: "Sign in with the username and password we emailed you after your purchase.",
};

/** Help next to the form: where the login comes from and what to do if it's missing. */
export const loginHelp = {
  title: "About your login",
  items: [
    {
      title: "Where is my login?",
      text: "We email your username and password to the address you gave at checkout, within 24 hours of sharing your UPI transaction.",
    },
    {
      title: "Can't find the email?",
      text: "Check your spam and promotions folders, then contact support with your order reference (IOV-XXXXXX).",
      link: { href: contactLink({ topic: "login" }), label: "Contact support" },
    },
    {
      title: "Forgot your password?",
      text: `Write to ${appInfo.supportEmail} from the email you used at checkout and we'll send you a new one.`,
      link: { href: contactLink({ topic: "password" }), label: "Forgot password" },
    },
  ],
};

export const form = {
  label: "Account",
  title: "Sign in",
  description: "Enter the username and password from your login email.",
  usernameLabel: "Username",
  usernamePlaceholder: "Your username",
  passwordLabel: "Password",
  passwordPlaceholder: "Your password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  submit: "Sign in",
  errors: {
    usernameMissing: "Enter your username.",
    usernameInvalid: "Usernames are 3–32 characters: letters, numbers, dots, dashes or underscores.",
    passwordMissing: "Enter your password.",
  },
};

const lowestPrice = Math.min(...pricePlans.map((plan) => plan.amount));

/** "Don't have iOverlay?" block under the form. */
export const buy = {
  divider: "Don't have iOverlay?",
  text: "Pick a plan, pay by UPI and get your username and password by email within 24 hours.",
  price: `Plans from ${formatAmount(lowestPrice)}`,
  cta: "Buy iOverlay",
  href: checkoutLink,
};
