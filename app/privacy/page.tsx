export const metadata = {
  title: "Privacy Policy - TechnicalMBC",
  description: "Privacy Policy of TechnicalMBC - Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Last Updated: {new Date().toLocaleDateString()}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This Privacy Policy describes how TechnicalMBC ("we," "our," or "us") collects, uses, and protects your personal information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>Personal Information:</strong> Name, email address, phone number, and billing information when you make a purchase or create an account.</p>
              <p><strong>Payment Information:</strong> Payment details are processed securely through Razorpay. We do not store your complete credit card or payment information.</p>
              <p><strong>Usage Data:</strong> Information about how you use our website, including IP address, browser type, and device information.</p>
              <p><strong>Download History:</strong> Records of your purchased and downloaded PDF materials.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Process your orders and deliver purchased PDF materials</li>
              <li>Send order confirmations and download links</li>
              <li>Provide customer support</li>
              <li>Improve our website and services</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement appropriate security measures to protect your personal information. Payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use third-party services to operate our website and process payments:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Razorpay:</strong> For secure payment processing</li>
              <li><strong>Cloudflare R2:</strong> For file storage and delivery</li>
              <li><strong>NextAuth:</strong> For authentication services</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use cookies to enhance your browsing experience, analyze site traffic, and for authentication. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} className="text-brand-500 hover:underline">
                {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
