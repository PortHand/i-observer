// Static content for the Sign in page.

import { checkoutLink } from "@/helper/route";
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
    usernameInvalid: "Enter the username from your login email. It's usually your email address.",
    passwordMissing: "Enter your password.",
  },
};

/** Above the form on arrival from a sign-in that was ended by a newer one (see sessionEndedLink). */
export const sessionEnded = "You were signed out because your account was signed in on another browser. Sign in again to continue here.";

/** "Don't have iOverlay?" block under the form. */
export const buy = {
  divider: "Don't have iOverlay?",
  text: "Pick a plan, pay by UPI and get your username and password by email within 24 hours.",
  /** {price} is the cheapest active plan, read from the database. */
  price: "Plans from {price}",
  cta: "Buy iOverlay",
  href: checkoutLink,
};
