import "server-only";
import { randomCode } from "@/server/core/randomCode";
import { HttpError } from "@/server/core/httpError";
import { isUniqueViolation, type UserRepository, type UserRow } from "../repository/userRepository";

const PASSWORD_LENGTH = 10;

const messages = {
  phoneTaken: "This phone number is already registered with another email. Use that email, or a different number.",
};

export interface CheckoutCustomer {
  /** Already verified by OTP and lower-cased. */
  email: string;
  phone: string;
  planId: string;
}

export class UserService {
  private readonly users: UserRepository;

  constructor(users: UserRepository) {
    this.users = users;
  }

  /**
   * Finds or creates the account for a verified email at checkout. A returning customer keeps their
   * password and gets the new phone and plan. Throws a 409 if the phone belongs to another account.
   */
  async ensure(customer: CheckoutCustomer, retried = false): Promise<UserRow> {
    const { email, phone, planId } = customer;
    const [byEmail, byPhone] = await Promise.all([this.users.findByEmail(email), this.users.findByPhone(phone)]);
    if (byPhone && byPhone.id !== byEmail?.id) throw this.phoneTaken();

    try {
      if (byEmail) return await this.users.update(byEmail.id, { phone, planId });
      // Readable random password, e.g. "K7MPQ2XRTA": no 0/O or 1/I, so it can be typed from an email.
      return await this.users.create({ email, username: email, phone, password: randomCode(PASSWORD_LENGTH), planId });
    } catch (error) {
      // Another checkout wrote the same email or phone between the lookups above and this write:
      // look again, so a returning customer is updated and a taken phone is reported.
      if (isUniqueViolation(error) && !retried) return this.ensure(customer, true);
      throw error;
    }
  }

  private phoneTaken() {
    return new HttpError(409, messages.phoneTaken, { phone: messages.phoneTaken });
  }
}
