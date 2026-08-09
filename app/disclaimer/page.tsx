export const metadata = {
  title: "Disclaimer - TechnicalMBC",
  description: "Disclaimer of TechnicalMBC - Important information about our PDF study materials and services.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">General Disclaimer</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The information provided on TechnicalMBC website is for general educational purposes only. While we strive to provide accurate and up-to-date study materials, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained in the PDF materials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Study Materials</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our PDF study materials are designed to supplement your exam preparation. They are based on publicly available information and standard syllabus for various competitive exams. However:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>We do not guarantee that our materials will ensure success in any examination</li>
              <li>Exam patterns and syllabus may change without notice</li>
              <li>Users should verify information from official sources</li>
              <li>These materials are not a substitute for official study materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">No Professional Advice</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The content provided on our website and in our PDF materials is not intended to be a substitute for professional advice. Always seek the advice of qualified professionals regarding specific exam requirements, eligibility criteria, and career guidance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Accuracy of Information</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              While we make every effort to ensure the accuracy of our study materials, we cannot guarantee that all information is current, complete, or error-free. We are not responsible for any errors or omissions, or for the results obtained from the use of this information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Links</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our website may contain links to third-party websites. These links are provided for your convenience and do not signify our endorsement of those websites. We have no responsibility for the content of the linked websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              In no event shall TechnicalMBC be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with the use of our website or PDF materials. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Exam Results</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              TechnicalMBC is not affiliated with any examination conducting authority. Success in competitive exams depends on various factors including individual effort, preparation, and exam conditions. We do not guarantee any specific results or outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Disclaimer</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify this disclaimer at any time. Changes will be effective immediately upon posting on our website. Your continued use of our website and materials after such changes constitutes your acceptance of the revised disclaimer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about this disclaimer, please contact us at{" "}
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
