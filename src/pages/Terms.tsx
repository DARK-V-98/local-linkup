import LegalShell from "@/components/layout/LegalShell";
import { usePageTitle } from "@/lib/usePageTitle";

export default function Terms() {
  usePageTitle("Terms of Service");
  return (
    <LegalShell title="Terms of Service" lastUpdated="October 24, 2023">
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Needlyy, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
      </section>

      <section className="mt-10">
        <h2>2. Marketplace Services</h2>
        <p>Needlyy provides a platform that connects buyers with independent service providers (Sellers). Needlyy does not perform the services and is not an employer of any Seller.</p>
        <ul>
          <li>Buyers are responsible for vetting Sellers based on reviews and profiles.</li>
          <li>Sellers are responsible for the quality and delivery of their services.</li>
          <li>Needlyy provides a secure payment system to facilitate transactions.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2>3. User Accounts</h2>
        <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
      </section>

      <section className="mt-10">
        <h2>4. Payments & Fees</h2>
        <p>Payments are held in a secure escrow system. Funds are released to the Seller only after the Buyer confirms completion or after the dispute period has passed.</p>
      </section>

      <section className="mt-10">
        <h2>5. Prohibited Conduct</h2>
        <p>Users may not engage in fraudulent activities, bypass our payment system, or post inappropriate content.</p>
      </section>
    </LegalShell>
  );
}
