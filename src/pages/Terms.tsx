import LegalShell from "@/components/layout/LegalShell";
import { LEGAL } from "@/lib/legal";
import { usePageTitle } from "@/lib/usePageTitle";
import { Link } from "react-router-dom";

export default function Terms() {
  usePageTitle("Terms & Conditions");
  const owner = LEGAL.legalName || LEGAL.brandName;
  return (
    <LegalShell title="Terms & Conditions" summary={`The rules for using ${LEGAL.brandName}, booking services and paying through the platform.`}>
      <h2>1. About these terms</h2>
      <p>
        These Terms & Conditions ("Terms") govern your use of the {LEGAL.brandName} website at {LEGAL.website}, our mobile
        experience and related services (together, the "Platform"), operated by <strong>{owner}</strong>
        {LEGAL.registrationNo && <>, a business registered in Sri Lanka under registration number {LEGAL.registrationNo}</>}
        {" "}("{LEGAL.brandName}", "we", "us").
      </p>
      <p>
        By creating an account, browsing, booking a service or making a payment, you agree to these Terms, our{" "}
        <Link to="/privacy">Privacy Policy</Link>, <Link to="/refund-policy">Refund & Cancellation Policy</Link>,{" "}
        <Link to="/service-delivery">Service Delivery Policy</Link> and <Link to="/payment-security">Payment & Security Policy</Link>.
        If you do not agree, please do not use the Platform.
      </p>

      <h2>2. What {LEGAL.brandName} does</h2>
      <p>
        {LEGAL.brandName} is an online marketplace that connects customers ("Buyers") with independent service providers and
        businesses ("Sellers") in Sri Lanka — for example home repairs, tech support, tuition, cleaning, overseas property care
        and accommodation enquiries.
      </p>
      <ul>
        <li>Sellers are independent. They are not our employees, agents or partners, and they are responsible for the services they deliver.</li>
        <li>{LEGAL.brandName} provides the listing, messaging, booking, review and payment tools, and a dispute process to help resolve problems.</li>
        <li>Where a Buyer pays online, {LEGAL.brandName} collects the payment through our payment gateway partner and holds it until the job is confirmed complete (see section 6).</li>
      </ul>

      <h2>3. Eligibility and accounts</h2>
      <ul>
        <li>You must be at least 18 years old and able to enter a binding contract under Sri Lankan law.</li>
        <li>You must give accurate, current information and keep it up to date. One person or business may not hold multiple accounts to avoid restrictions.</li>
        <li>You are responsible for keeping your password secure and for all activity on your account. Tell us immediately at <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> if you suspect unauthorised use.</li>
        <li>Sellers must complete identity verification (and, where applicable, business verification) before receiving payouts or appearing in certain listings such as urgent services or hotels.</li>
      </ul>

      <h2>4. Listings, prices and quotations</h2>
      <ul>
        <li>All prices on the Platform are in <strong>Sri Lankan Rupees (LKR)</strong> and include any taxes the Seller is required to charge, unless stated otherwise.</li>
        <li>Sellers must describe services honestly, including what is and is not included, the expected timeframe and any materials or call-out charges.</li>
        <li>Some services are priced after inspection or by quotation. The price agreed on the Platform before work starts is the price the Buyer pays. Any change must be agreed by both parties in writing on the Platform.</li>
        <li>We may remove listings that are misleading, unsafe, illegal or that breach these Terms.</li>
      </ul>

      <h2>5. Bookings</h2>
      <ul>
        <li>A booking is a contract for services between the Buyer and the Seller. It is formed when the Seller accepts the booking on the Platform.</li>
        <li>Buyers must give accurate job details, location and contact information, and provide safe and reasonable access for the Seller to perform the work.</li>
        <li>Sellers must attend at the agreed time, perform the work with reasonable care and skill, and update the booking status honestly.</li>
        <li>Hotel and accommodation enquiries and proposals are not confirmed reservations unless the Platform clearly shows them as confirmed and paid.</li>
      </ul>

      <h2>6. Payments</h2>
      <ul>
        <li><strong>Online payments</strong> are processed by our licensed payment gateway partner (PayHere, and/or a Sri Lankan bank Internet Payment Gateway). Accepted methods may include Visa, Mastercard, American Express, local bank cards, LankaQR, eZ Cash, mCash, Genie and internet banking, as shown at checkout.</li>
        <li>{LEGAL.brandName} does not see or store your full card number, CVV or banking passwords. See our <Link to="/payment-security">Payment & Security Policy</Link>.</li>
        <li><strong>Payment holding:</strong> online payments are held by {LEGAL.brandName} and released to the Seller only after the Buyer confirms the job is complete. If the Buyer neither confirms nor opens a dispute within {LEGAL.disputeWindowDays} days of the Seller marking the job complete, our team reviews the booking records and may release the payment to the Seller.</li>
        <li><strong>Cash payments:</strong> where a Seller offers cash on completion, the Buyer pays the Seller directly. {LEGAL.brandName} does not collect or hold cash payments and can only assist with cash disputes on a best-effort basis.</li>
        <li>Your card issuer may charge foreign-transaction or other fees. These are not controlled by {LEGAL.brandName}.</li>
        <li>Refunds are handled under our <Link to="/refund-policy">Refund & Cancellation Policy</Link>.</li>
      </ul>

      <h2>7. Fees for Sellers</h2>
      <p>
        Sellers may be charged a platform service fee on completed online orders. The applicable fee is shown in the Seller dashboard
        before the Seller accepts a booking. Fee changes apply only to bookings made after we give at least 14 days' notice.
        Payouts are made by bank transfer to a verified account in the Seller's own name, net of fees, refunds and chargebacks.
      </p>

      <h2>8. Prohibited conduct</h2>
      <p>You must not:</p>
      <ul>
        <li>ask for or make payment outside the Platform for a job found on {LEGAL.brandName} in order to avoid fees or our protections;</li>
        <li>post false, misleading, defamatory, offensive or illegal content, or fake reviews;</li>
        <li>use stolen cards or payment details, attempt fraud, money laundering or unauthorised chargebacks;</li>
        <li>offer services that are illegal in Sri Lanka or that require a licence you do not hold;</li>
        <li>harass, threaten or discriminate against other users;</li>
        <li>scrape, reverse engineer, overload or interfere with the Platform's security.</li>
      </ul>

      <h2>9. Reviews</h2>
      <p>Only Buyers with a completed booking can review a Seller. Reviews must be honest and relevant. We may remove reviews that breach these Terms but we do not edit them to favour any party.</p>

      <h2>10. Disputes between Buyers and Sellers</h2>
      <p>
        If something goes wrong, first contact the other party through Platform messages. If it is not resolved, open a dispute from the
        booking page within {LEGAL.disputeWindowDays} days of the job being marked complete. Our team will review messages, photos and
        booking records from both sides and decide how any held payment is released or refunded. Our decision on held funds is final
        for the Platform, but does not limit your legal rights.
      </p>

      <h2>11. Suspension and termination</h2>
      <p>
        You may close your account at any time from your settings or by contacting support; open bookings, payouts and disputes must be
        completed first. We may suspend or close accounts, hold payouts or remove listings where we reasonably suspect fraud, safety risk,
        a breach of these Terms or where required by law, a bank or a payment gateway.
      </p>

      <h2>12. Intellectual property</h2>
      <p>
        The {LEGAL.brandName} name, logo, design and software belong to us. By uploading content (photos, descriptions, reviews) you grant us a
        non-exclusive, royalty-free licence to display it on the Platform and in our marketing of your listing. You confirm you have the right to upload it.
      </p>

      <h2>13. Liability</h2>
      <ul>
        <li>Sellers are responsible for the services they provide. To the extent permitted by law, {LEGAL.brandName} is not liable for the quality, safety or legality of services, or for loss or damage caused by a Seller or Buyer.</li>
        <li>Our total liability to you for any claim related to a booking is limited to the amount paid through the Platform for that booking.</li>
        <li>Nothing in these Terms limits liability that cannot be limited under Sri Lankan law, including rights under the Consumer Affairs Authority Act No. 9 of 2003.</li>
      </ul>

      <h2>14. Changes to these Terms</h2>
      <p>We may update these Terms. We will show the new effective date on this page and, for material changes, notify registered users by email or in the app. Continued use after the effective date means you accept the updated Terms.</p>

      <h2>15. Governing law</h2>
      <p>These Terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka. Disputes that cannot be resolved with our support team are subject to the exclusive jurisdiction of the courts of Colombo, Sri Lanka.</p>
    </LegalShell>
  );
}
