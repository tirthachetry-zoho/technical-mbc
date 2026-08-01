"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { sendOrderNotificationWhatsApp } from "@/lib/whatsapp";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type BuyButtonProps = {
  productId: string;
  price: number;
  title: string;
};

export default function BuyButton({ productId, price, title }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [upiId] = useState(process.env.NEXT_PUBLIC_UPI_ID || "toppersnotes@upi");
  const [payeeName] = useState(process.env.NEXT_PUBLIC_PAYEE_NAME || "ToppersNotes");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const router = useRouter();

  async function createOrder() {
    const body: any = { productIds: [productId] };
    
    // Add guest details if not logged in
    if (!isLoggedIn) {
      body.guestEmail = guestEmail;
      body.guestPhone = guestPhone;
      body.guestName = guestName;
    }

    console.log("Creating order with body:", body);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", res.headers);

    if (res.status === 401) {
      router.push("/login");
      return null;
    }

    const text = await res.text();
    console.log("Response text:", text);

    if (!text) {
      throw new Error("Empty response from server");
    }

    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || "Failed to create order");
    return data;
  }

  async function handleQRPay() {
    setLoading(true);
    try {
      const data = await createOrder();
      if (!data) return;
      setOrderId(data.orderId);
      setShowQR(true);
      setShowGuestForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleGuestCheckout() {
    setShowGuestForm(true);
  }

  async function submitGuestDetails() {
    if (!guestEmail || !guestName || !guestPhone) {
      alert("Please fill in all required fields");
      return;
    }
    // Create order and show QR code directly
    await handleQRPay();
  }

  // UPI deep link for the QR code
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${price}&cu=INR&tn=${encodeURIComponent(title)}`;
  
  // Use static QR code image from public folder
  const qrCodeImageUrl = "/qr-code.jpeg";

  async function confirmManualPayment() {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payments/verify-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      
      const text = await res.text();
      if (!text) {
        throw new Error("Empty response from server");
      }
      
      const data = JSON.parse(text);
      if (res.ok) {
        // Fetch order details for WhatsApp notification
        const orderRes = await fetch(`/api/orders/${orderId}`);
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          sendOrderNotificationWhatsApp(orderData);
        }
        
        alert("Payment confirmed! Your downloads are ready. Check your email for details.");
        // Redirect to public download page (works for both guests and logged-in users)
        window.location.href = `/download/${orderId}`;
      } else {
        alert(data.error || "Payment not confirmed yet. Please contact support.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to verify payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  }

  if (showGuestForm) {
    return (
      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">Guest Checkout</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="input"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="input"
                placeholder="+91 98765 43210"
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={submitGuestDetails}
                className="btn-primary flex-1"
              >
                Continue to Payment
              </button>
              <button
                onClick={() => setShowGuestForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showQR && orderId) {
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Scan & Pay with UPI</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Scan this QR with any UPI app (GPay, PhonePe, Paytm, etc.)
          </p>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl">
              <img
                src={qrCodeImageUrl}
                alt="UPI QR Code"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Amount: ₹{price}</p>
            <p className="text-gray-500 dark:text-gray-400">UPI ID: {upiId}</p>
          </div>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-xs text-amber-700 dark:text-amber-300">
            ⚠️ After paying, click "I've Paid" below. Your order will be verified manually.
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={confirmManualPayment}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Verifying..." : "✓ I've Paid"}
            </button>
            <button
              onClick={() => { setShowQR(false); setOrderId(null); }}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-2">
        <button
          onClick={handleGuestCheckout}
          disabled={loading}
          className="w-full bg-brand-500 text-white py-3 rounded-lg font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0-1h9m-9 0H3m6.5 7.5L12 21l2.5-2.5M3 12h3m12 0h3M12 3v3m0 0h3m-3 0H9m6 6h.01M9 12h.01M12 9h.01" />
              </svg>
              Buy Now with UPI
            </>
          )}
        </button>
      </div>
    </>
  );
}
