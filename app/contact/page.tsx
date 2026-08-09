"use client";

import { useState } from "react";

export const metadata = {
  title: "Contact Us - TechnicalMBC",
  description: "Get in touch with TechnicalMBC for any queries or support regarding PDF study materials.",
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, you would send this to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const supportWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "918135052007";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
          
          {submitted && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field"
                placeholder="How can we help?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message *</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field"
                placeholder="Your message..."
              />
            </div>
            
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
        
        <div className="space-y-6">
          <div className="card p-8">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Email</h3>
                <a href={`mailto:${supportEmail}`} className="text-brand-500 hover:underline">
                  {supportEmail}
                </a>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">WhatsApp</h3>
                <a 
                  href={`https://wa.me/${supportWhatsApp}?text=Hi%2C%20I%20need%20help%20with%20my%20order%20on%20PDF%20Store.`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-500 hover:underline"
                >
                  +91 {supportWhatsApp.slice(-10, -8)} {supportWhatsApp.slice(-8, -5)} {supportWhatsApp.slice(-5)}
                </a>
              </div>
            </div>
          </div>
          
          <div className="card p-8">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-brand-500 hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-brand-500 hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/disclaimer" className="text-brand-500 hover:underline">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
