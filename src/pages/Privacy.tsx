import LegalShell from "@/components/layout/LegalShell";
import { LEGAL } from "@/lib/legal";
import { usePageTitle } from "@/lib/usePageTitle";

export default function Privacy() {
  usePageTitle("Privacy Policy");
  const owner = LEGAL.legalName || LEGAL.brandName;
  return (
    <LegalShell title="Privacy Policy" summary="What personal data we collect, why we use it, who we share it with and the rights you have under Sri Lanka's Personal Data Protection Act.">
      <h2>1. Who we are</h2>
      <p>
        {owner} ("{LEGAL.brandName}", "we", "us") operates {LEGAL.website}. We are the <strong>controller</strong> of the personal data
        described in this policy. We process personal data in line with the <strong>Personal Data Protection Act, No. 9 of 2022</strong> of
        Sri Lanka ("PDPA") and other applicable laws.
      </p>

      <h2>2. Data we collect</h2>
      <table>
        <thead><tr><th>Category</th><th>Examples</th><th>Source</th></tr></thead>
        <tbody>
          <tr><td>Account & contact</td><td>Name, email, phone number, district/address, password (stored hashed by our authentication provider)</td><td>You</td></tr>
          <tr><td>Seller verification</td><td>NIC/passport/driving licence images, business registration documents, qualifications, bank account details for payouts</td><td>Sellers</td></tr>
          <tr><td>Bookings & messages</td><td>Job details, location, dates, quotes, messages, photos, reviews, disputes</td><td>You and the other party</td></tr>
          <tr><td>Payment records</td><td>Amount, booking reference, payment method type, status, gateway transaction ID, last digits/brand of card where provided by the gateway</td><td>Payment gateway</td></tr>
          <tr><td>Technical & usage</td><td>IP address, device and browser type, pages visited, error logs</td><td>Automatically</td></tr>
        </tbody>
      </table>
      <p><strong>We never receive or store your full card number, CVV, PIN or online banking password.</strong> These are entered directly on our payment gateway's secure page.</p>

      <h2>3. Why we use your data (purpose and legal basis)</h2>
      <ul>
        <li><strong>To provide the Platform</strong> — create accounts, show listings, process bookings, messages and reviews (performance of a contract).</li>
        <li><strong>To process payments, refunds and payouts</strong> and keep financial records (contract and legal obligation).</li>
        <li><strong>To verify Sellers and prevent fraud</strong>, money laundering and misuse (legitimate interest and legal obligation).</li>
        <li><strong>To resolve disputes and provide support</strong> (contract and legitimate interest).</li>
        <li><strong>To send service notifications</strong> such as booking updates and security alerts (contract).</li>
        <li><strong>To send marketing or newsletters</strong> — only with your consent; you can unsubscribe at any time.</li>
        <li><strong>To improve and secure the Platform</strong> through aggregated analytics and error monitoring (legitimate interest).</li>
      </ul>

      <h2>4. Who we share data with</h2>
      <p>We do not sell your personal data. We share it only where needed:</p>
      <ul>
        <li><strong>The other party to your booking</strong> — e.g. a Seller sees the Buyer's name, job details, location and phone number needed to perform the work.</li>
        <li><strong>Payment partners</strong> — PayHere (PayHere (Private) Limited) and/or our acquiring bank's Internet Payment Gateway, card networks and banks, to process payments, refunds and chargebacks.</li>
        <li><strong>Service providers</strong> who host and run the Platform for us, such as Google Firebase/Google Cloud (authentication, database, file storage) and our hosting provider. They process data only on our instructions.</li>
        <li><strong>Authorities</strong> — the police, courts, the Central Bank of Sri Lanka, the Data Protection Authority or other regulators where required by law.</li>
        <li><strong>A buyer of our business</strong>, if {LEGAL.brandName} is merged or sold, under the same protections.</li>
      </ul>

      <h2>5. International transfers</h2>
      <p>
        Some of our service providers (for example Google Cloud) may store data on servers outside Sri Lanka. Where this happens we rely on
        providers that apply recognised security standards and contractual safeguards, as permitted under the PDPA.
      </p>

      <h2>6. How long we keep data</h2>
      <ul>
        <li>Account data: while your account is active, and up to 2 years after closure for support and fraud prevention.</li>
        <li>Booking, payment and payout records: at least 6 years, to meet tax, accounting and anti-money-laundering obligations.</li>
        <li>Seller identity documents: while the Seller account is active and up to 2 years after, unless a longer period is required by law.</li>
        <li>Marketing preferences: until you withdraw consent.</li>
      </ul>

      <h2>7. How we protect data</h2>
      <ul>
        <li>All traffic is encrypted with HTTPS/TLS.</li>
        <li>Access to private records and identity documents is restricted by role-based security rules; document links expire after a few minutes.</li>
        <li>Payments are handled on PCI DSS-compliant gateway pages.</li>
        <li>Staff access is limited to those who need it to perform their duties.</li>
      </ul>
      <p>No system is completely secure. If a data breach is likely to put you at risk, we will notify you and the Data Protection Authority as required by law.</p>

      <h2>8. Cookies and local storage</h2>
      <p>
        We use essential cookies and browser storage to keep you signed in, remember preferences and protect against fraud. We may use
        analytics to understand how the site is used. You can clear or block cookies in your browser, but some features may stop working.
      </p>

      <h2>9. Your rights</h2>
      <p>Under the PDPA you have the right to:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>correct inaccurate or incomplete data;</li>
        <li>withdraw consent and object to processing (for example marketing);</li>
        <li>request erasure of your data where we no longer have a lawful reason to keep it;</li>
        <li>request a review of decisions made solely by automated processing;</li>
        <li>complain to the Data Protection Authority of Sri Lanka.</li>
      </ul>
      <p>
        You can update most details in your account settings. For other requests email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
        We may need to verify your identity, and will respond within 21 working days.
      </p>

      <h2>10. Children</h2>
      <p>The Platform is not intended for anyone under 18. Tuition bookings for children must be made by a parent or guardian, who is responsible for any information they provide about the child.</p>

      <h2>11. Changes to this policy</h2>
      <p>We may update this policy. The effective date at the top shows the current version. Material changes will be notified by email or in the app.</p>
    </LegalShell>
  );
}
