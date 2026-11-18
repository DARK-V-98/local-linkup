import LegalShell from "@/components/layout/LegalShell";
import { LEGAL } from "@/lib/legal";
import { usePageTitle } from "@/lib/usePageTitle";
import { Link } from "react-router-dom";

export default function ServiceDelivery() {
  usePageTitle("Service Delivery Policy");
  return (
    <LegalShell title="Service Delivery Policy" summary={`How and when services booked on ${LEGAL.brandName} are delivered. We sell services, not shipped goods.`}>
      <h2>1. What is delivered</h2>
      <p>
        {LEGAL.brandName} is a services marketplace. We do not sell or ship physical products. "Delivery" means the Seller performing the booked
        service — on-site at your location, at the Seller's premises, or online (for example tuition or remote tech support), as stated on the listing.
      </p>

      <h2>2. Service area</h2>
      <p>
        Services are available across Sri Lanka. Each Seller chooses the districts they cover, shown on their listing. Overseas property-care services
        are purchased by customers living abroad but performed in Sri Lanka.
      </p>

      <h2>3. Delivery timeframes</h2>
      <table>
        <thead><tr><th>Service type</th><th>Typical timeframe</th></tr></thead>
        <tbody>
          <tr><td>Scheduled bookings</td><td>On the date and time you select and the Seller accepts</td></tr>
          <tr><td>Urgent / emergency services</td><td>As agreed with the Seller when they accept — usually the same day</td></tr>
          <tr><td>Quote-based jobs</td><td>As stated in the accepted quotation</td></tr>
          <tr><td>Online services</td><td>At the scheduled session time, by video call or remote access link</td></tr>
          <tr><td>Monthly plans (e.g. overseas property care)</td><td>Throughout the paid month, with reports shared on the Platform or WhatsApp</td></tr>
        </tbody>
      </table>
      <p>A Seller must accept or decline a booking within 24 hours. If they do not, you may cancel for a full refund.</p>

      <h2>4. Booking confirmation</h2>
      <ul>
        <li>After payment you see a confirmation page and the booking appears in <Link to="/dashboard/buyer/orders">My Orders</Link>.</li>
        <li>You receive in-app notifications as the Seller accepts, starts and completes the job.</li>
        <li>Your payment receipt includes the booking reference, service, amount in LKR, date and payment status.</li>
      </ul>

      <h2>5. Delays and rescheduling</h2>
      <ul>
        <li>If a Seller needs to reschedule, they must ask you on the Platform. You can accept the new time or cancel for a full refund.</li>
        <li>If the Seller is more than 2 hours late without notice, you can cancel for a full refund.</li>
        <li>Delays caused by weather, strikes, curfews or other events outside anyone's control will be rescheduled without penalty to either side.</li>
      </ul>

      <h2>6. Completion and confirmation</h2>
      <p>
        When the work is done the Seller marks the booking complete. Please check the work and confirm completion on the booking page. Your online
        payment is released to the Seller only after you confirm. If there is a problem, open a dispute within {LEGAL.disputeWindowDays} days instead —
        see the <Link to="/refund-policy">Refund & Cancellation Policy</Link>.
      </p>

      <h2>7. Delivery charges</h2>
      <p>There are no shipping charges. Any call-out, travel or materials charge must be shown on the listing or quotation before you pay.</p>
    </LegalShell>
  );
}
