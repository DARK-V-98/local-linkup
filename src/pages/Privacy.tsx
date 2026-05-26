import LegalShell from "@/components/layout/LegalShell";
import { usePageTitle } from "@/lib/usePageTitle";

export default function Privacy() {
  usePageTitle("Privacy Policy");
  return (
    <LegalShell title="Privacy Policy" lastUpdated="October 24, 2023">
      <section>
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with other users.</p>
        <ul>
          <li><strong>Personal Data:</strong> Name, email address, phone number, and location.</li>
          <li><strong>Payment Info:</strong> Processed through secure third-party providers.</li>
          <li><strong>Usage Data:</strong> How you interact with our platform.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2>2. How We Use Information</h2>
        <p>We use your data to provide, maintain, and improve our services, and to protect our community from fraud.</p>
      </section>

      <section className="mt-10">
        <h2>3. Data Security</h2>
        <p>We use industry-standard encryption and security measures to protect your personal information.</p>
      </section>

      <section className="mt-10">
        <h2>4. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data at any time through your account settings.</p>
      </section>
    </LegalShell>
  );
}
