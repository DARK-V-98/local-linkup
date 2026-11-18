import LegalShell from "@/components/layout/LegalShell";
import { LEGAL } from "@/lib/legal";
import { usePageTitle } from "@/lib/usePageTitle";
import { Link } from "react-router-dom";

export default function PaymentSecurity() {
  usePageTitle("Payment & Security Policy");
  return (
    <LegalShell title="Payment & Security Policy" summary="Accepted payment methods, currency, and how your payment information is kept safe.">
      <h2>1. Accepted payment methods</h2>
      <p>Online payments on {LEGAL.brandName} are processed by our payment gateway partner. Depending on the gateway enabled at checkout you can pay with:</p>
      <ul>
        <li>Visa, Mastercard and American Express credit/debit cards (local and foreign-issued)</li>
        <li>LankaQR and mobile wallets such as eZ Cash, mCash and Genie</li>
        <li>Internet banking from participating Sri Lankan banks</li>
        <li>Cash on completion, where the Seller offers it (paid directly to the Seller)</li>
      </ul>

      <h2>2. Currency</h2>
      <p>All prices and charges are in <strong>Sri Lankan Rupees (LKR)</strong>. If you pay with a card issued in another currency, your bank converts the amount at its own rate and may add a fee.</p>

      <h2>3. How your card details are protected</h2>
      <ul>
        <li>Card details are entered on the payment gateway's secure, <strong>PCI DSS-compliant</strong> page — not on {LEGAL.brandName}'s servers.</li>
        <li>We never see or store your full card number, expiry date, CVV, PIN or OTP.</li>
        <li>Card payments may require <strong>3-D Secure</strong> authentication (Visa Secure, Mastercard Identity Check, American Express SafeKey) by your bank.</li>
        <li>Every page on {LEGAL.website} is served over HTTPS with TLS encryption.</li>
        <li>Payments are confirmed only by a digitally signed notification from the gateway that matches the exact booking amount — never by the browser alone.</li>
      </ul>

      <h2>4. Payment confirmation and receipts</h2>
      <p>
        After a successful payment you are returned to the booking confirmation page and the payment status is shown in{" "}
        <Link to="/dashboard/buyer/payments">Payments</Link>. If money was deducted but the booking shows unpaid, do not pay again — contact us
        with the booking reference and we will reconcile it with the gateway within {LEGAL.responseDays} business days.
      </p>

      <h2>5. Failed or duplicate payments</h2>
      <p>If a payment fails, your bank may temporarily hold the amount; it is normally released automatically by your bank. Duplicate charges for the same booking are refunded in full once confirmed.</p>

      <h2>6. Fraud prevention</h2>
      <p>We may decline, hold or cancel payments that look fraudulent, and may ask for verification. Using a card you are not authorised to use is a criminal offence and will be reported to the authorities.</p>

      <h2>7. Stay safe</h2>
      <ul>
        <li>{LEGAL.brandName} staff will never ask for your card number, OTP or password by phone, email or WhatsApp.</li>
        <li>Never pay a Seller outside the Platform for a job found on {LEGAL.brandName} — you lose our payment holding and dispute protection.</li>
        <li>Report suspicious messages to <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.</li>
      </ul>
    </LegalShell>
  );
}
