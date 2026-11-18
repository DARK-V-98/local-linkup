import LegalShell from "@/components/layout/LegalShell";
import { LEGAL } from "@/lib/legal";
import { usePageTitle } from "@/lib/usePageTitle";
import { Link } from "react-router-dom";

export default function RefundPolicy() {
  usePageTitle("Refund & Cancellation Policy");
  return (
    <LegalShell title="Refund & Cancellation Policy" summary="When you can cancel, when you get your money back, how much, and how long it takes.">
      <h2>1. Summary</h2>
      <ul>
        <li>Online payments are <strong>held by {LEGAL.brandName}</strong> and are not released to the Seller until you confirm the job is complete.</li>
        <li>Cancel <strong>before the Seller accepts</strong> or <strong>24 hours or more before</strong> the scheduled time: <strong>100% refund</strong>.</li>
        <li>If the Seller cancels, does not show up, or the service cannot be delivered: <strong>100% refund</strong>.</li>
        <li>Problems with completed work: open a dispute within <strong>{LEGAL.disputeWindowDays} days</strong>; we decide on a full, partial or no refund based on the evidence.</li>
        <li>Approved refunds go back to the <strong>original payment method</strong> within <strong>{LEGAL.refundProcessingDays} working days</strong>.</li>
      </ul>
      <p>Because {LEGAL.brandName} is a services marketplace, we do not ship physical goods. Where a Seller supplies parts or materials as part of a service, section 6 applies.</p>

      <h2>2. Cancellations by the Buyer</h2>
      <table>
        <thead><tr><th>When you cancel</th><th>Refund of the amount paid</th></tr></thead>
        <tbody>
          <tr><td>Before the Seller accepts the booking</td><td>100%</td></tr>
          <tr><td>24 hours or more before the scheduled start</td><td>100%</td></tr>
          <tr><td>Less than 24 hours before the scheduled start</td><td>Up to 80% — the Seller may keep up to 20% (or a call-out fee shown on the listing, whichever is lower) to cover their time</td></tr>
          <tr><td>After the Seller has arrived or work has started</td><td>Refund for work not yet done, as agreed between the parties or decided by our team</td></tr>
          <tr><td>Urgent / same-day services after the Seller is on the way</td><td>Refund minus any call-out fee shown on the listing</td></tr>
        </tbody>
      </table>
      <p>
        A Seller's listing may show a more generous cancellation policy; if so, the Seller's policy applies. A Seller may not apply a
        stricter policy than this one to online payments made through the Platform.
      </p>

      <h2>3. Cancellations by the Seller or {LEGAL.brandName}</h2>
      <p>You receive a <strong>100% refund</strong> if:</p>
      <ul>
        <li>the Seller cancels or declines the booking, or fails to attend without agreeing a new time with you;</li>
        <li>we cancel the booking because the Seller's account is suspended, unverified or in breach of our Terms;</li>
        <li>the service cannot be performed for reasons outside your control.</li>
      </ul>

      <h2>4. Unsatisfactory or incomplete work</h2>
      <p>If the work is not delivered as described or agreed:</p>
      <ol>
        <li><strong>Do not confirm completion.</strong> Your payment stays on hold.</li>
        <li>Message the Seller on the Platform and give them a reasonable chance to fix the problem.</li>
        <li>If it is not resolved, open a <strong>dispute</strong> from your booking page within {LEGAL.disputeWindowDays} days of the Seller marking the job complete. Include photos, messages and a description.</li>
        <li>Our team will review both sides and respond within {LEGAL.responseDays} business days. Outcomes may be a re-do by the Seller, a <strong>partial refund</strong> or a <strong>full refund</strong>.</li>
      </ol>
      <p>Once you confirm the job is complete and the payment is released to the Seller, refunds are only possible with the Seller's agreement, or where required by law or by a card-network chargeback decision.</p>

      <h2>5. Non-refundable situations</h2>
      <ul>
        <li>Work that was completed as described and confirmed by you.</li>
        <li>Change of mind after the work has been completed.</li>
        <li>Bookings cancelled because you gave incorrect information or did not provide access or a safe working environment (a call-out fee may be kept).</li>
        <li>Payments made in cash or directly to a Seller outside the Platform — {LEGAL.brandName} never held these funds. We will still help mediate cash disputes where we can.</li>
        <li>Bank or card-issuer fees charged by your own bank.</li>
      </ul>

      <h2>6. Parts and materials</h2>
      <p>
        If a Seller supplies parts or materials as part of a booked service, faulty or incorrect items are covered by the dispute process above.
        Items must not be damaged by misuse. Any manufacturer warranty passes to you, and the Seller should give you the details. Unused materials
        that were bought specifically for your job may be non-refundable if the Seller can show the cost.
      </p>

      <h2>7. Subscriptions and overseas property care</h2>
      <p>
        Monthly plans (such as Overseas property care) can be cancelled at any time and will not renew for the next period. Fees for the current month
        are non-refundable once the month's service has started, unless the service was not delivered.
      </p>

      <h2>8. Hotels and accommodation</h2>
      <p>
        Hotel enquiries and proposals on {LEGAL.brandName} are not paid reservations. If online payment for stays is introduced, the property's
        cancellation policy shown in the accepted proposal will apply, and will always be displayed before payment.
      </p>

      <h2>9. How refunds are paid and how long they take</h2>
      <ul>
        <li>Refunds are paid to the <strong>same card or account used for payment</strong>. We cannot refund to a different card, account or person.</li>
        <li>We process approved refunds within {LEGAL.responseDays} business days. Your bank then usually takes <strong>{LEGAL.refundProcessingDays} working days</strong> to show the credit on your statement; foreign-issued cards may take longer.</li>
        <li>Refunds are made in Sri Lankan Rupees (LKR). If your card is in another currency, the final amount may differ due to your bank's exchange rate.</li>
        <li>Partial refunds show the refunded amount and reason on your booking page.</li>
      </ul>

      <h2>10. How to request a cancellation or refund</h2>
      <ol>
        <li>Go to <Link to="/dashboard/buyer/orders">My Orders</Link> and open the booking.</li>
        <li>Choose <strong>Cancel booking</strong> or <strong>Open a dispute</strong>, and give the reason.</li>
        <li>Or contact us at <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> with your booking reference.</li>
      </ol>

      <h2>11. Chargebacks</h2>
      <p>
        Please contact us before raising a chargeback with your bank — most issues are solved faster through our dispute process. If a chargeback is
        raised, we will provide the booking records to the bank and the payment gateway. Fraudulent chargebacks may lead to account suspension.
      </p>

      <h2>12. Your legal rights</h2>
      <p>This policy does not affect your statutory rights under Sri Lankan consumer protection law, including the Consumer Affairs Authority Act No. 9 of 2003.</p>
    </LegalShell>
  );
}
