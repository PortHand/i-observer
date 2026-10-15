import "server-only";
import { randomCode } from "@/server/core/randomCode";
import { HttpError } from "@/server/core/httpError";
import { isUniqueViolation, type UserRepository, type UserRow } from "../repository/userRepository";

const PASSWORD_LENGTH = 10;

const messages = {
  // One message for both cases, so it doesn't reveal which of the two is registered.
  mismatch: "This email or phone number is already registered with different details. Use the same email and phone number as before.",
};

export interface CheckoutCustomer {
  /** Lower-cased. Verified by OTP for a new customer. */
  email: string;
  phone: string;
}

/** "returning": an account has exactly this email and phone. "new": neither is registered. */
export type CustomerMatch = "returning" | "new";

export class UserService {
  private readonly users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  /**
   * Checks an email and phone against the accounts. A registered email or phone must come with the
   * other half of the same account; a mix of two accounts, or a known email with a new phone (or
   * the other way round), is a 409 with a generic message. Returning customers can skip the OTP:
   * their email was verified when the account was created.
   */
  async match(email: string, phone: string): Promise<CustomerMatch> {
    const [byEmail, byPhone] = await Promise.all([this.users.findByEmail(email), this.users.findByPhone(phone)]);
    if ((byEmail && byEmail.phone !== phone) || (byPhone && byPhone.email !== email)) throw this.mismatch();
    return byEmail ? "returning" : "new";
  }

  /**
   * Finds or creates the account at checkout, after match() and, for a new customer, the OTP. A
   * returning customer keeps their password. Access is only given once the payment is verified
   * (see EntitlementService). Throws match()'s 409s.
   */
  async ensure(customer: CheckoutCustomer, retried = false): Promise<UserRow> {
    const { email, phone } = customer;
    try {
      if ((await this.match(email, phone)) === "returning") return (await this.users.findByEmail(email))!;
      // Readable random password, e.g. "K7MPQ2XRTA": no 0/O or 1/I, so it can be typed from an email.
      return await this.users.create({ email, username: email, phone, password: randomCode(PASSWORD_LENGTH) });
    } catch (error) {
      // Another checkout registered the same email or phone between match() and this write: check
      // again, so the customer is treated as returning or gets the right conflict.
      if (isUniqueViolation(error) && !retried) return this.ensure(customer, true);
      throw error;
    }
  }

  private mismatch() {
    return HttpError.conflict(messages.mismatch);
  }
}
