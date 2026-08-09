import Link from "next/link";

export const metadata = {
  title: "About Us - TechnicalMBC",
  description: "Learn about TechnicalMBC - your trusted source for premium PDF study materials for competitive exams in India.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div className="card p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              TechnicalMBC is a leading platform providing high-quality PDF study materials for competitive exams in India. 
              We specialize in creating comprehensive notes and resources for RRB, SSC, Banking, UPSC, State PSC, and other 
              competitive examinations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our mission is to make quality education accessible and affordable for every aspirant. We believe that 
              with the right resources and guidance, anyone can achieve their dream of cracking competitive exams.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Premium PDF notes for various competitive exams</li>
              <li>Instant download after payment</li>
              <li>Regularly updated content</li>
              <li>Expert-curated study materials</li>
              <li>Affordable pricing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              With years of experience in the education sector, we understand the needs of aspirants. Our materials are 
              designed by subject matter experts and are regularly updated to match the latest exam patterns and syllabus.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Have questions? We're here to help! Reach out to us via email at{" "}
              <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} className="text-brand-500 hover:underline">
                {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
              </a>{" "}
              or connect with us on WhatsApp at{" "}
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                +91 {process.env.NEXT_PUBLIC_ADMIN_WHATSAPP?.slice(-10, -8)} {process.env.NEXT_PUBLIC_ADMIN_WHATSAPP?.slice(-8, -5)} {process.env.NEXT_PUBLIC_ADMIN_WHATSAPP?.slice(-5)}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
