"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { sendOrderNotificationWhatsApp } from "@/lib/whatsapp";
import { useToast } from "@/components/Toast";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
  config?: {
    display: {
      blocks: {
        banks: {
          name: string;
          instruments: string[];
        };
      };
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { 
      open: () => void; 
      close: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

type BuyButtonProps = {
  productId: string;
  price: number;
  title: string;
};

export default function BuyButton({ productId, price, title }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const router = useRouter();
  const { showToast } = useToast();

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    
    script.onload = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
      } else {
        console.error("Razorpay script loaded but window.Razorpay not available");
        setRazorpayLoaded(false);
      }
    };
    
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      setRazorpayLoaded(false);
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  async function createOrder() {
    const body: Record<string, unknown> = { productIds: [productId] };

    // Add guest details if not logged in
    if (!isLoggedIn) {
      body.guestEmail = guestEmail;
      body.guestPhone = guestPhone;
      body.guestName = guestName;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      router.push("/login");
      return null;
    }

    const text = await res.text();
    if (!text) {
      throw new Error("Empty response from server");
    }

    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || "Failed to create order");
    return data;
  }

  async function handleRazorpayPayment() {
    setLoading(true);
    try {
      if (!razorpayLoaded || !window.Razorpay) {
        showToast("Payment gateway is loading. Please try again in a moment.", "error");
        setLoading(false);
        return;
      }

      const data = await createOrder();
      if (!data) return;

      const options: RazorpayOptions = {
        key: data.razorpayKey,
        amount: Math.round(data.amount * 100),
        currency: "INR",
        name: "TechnicalMBC",
        description: title,
        order_id: data.razorpayOrderId,
        notes: {
          orderId: data.orderId,
          productName: title,
          customerName: session?.user?.name || guestName || "Guest",
        },
        handler: async function (response: RazorpayResponse) {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          
          if (verifyRes.ok) {
            const orderRes = await fetch(`/api/orders/${data.orderId}`);
            if (orderRes.ok) {
              const orderData = await orderRes.json();
              sendOrderNotificationWhatsApp({
                orderNumber: orderData.orderNumber,
                guestName: orderData.guestName,
                guestEmail: orderData.guestEmail,
                guestPhone: orderData.guestPhone,
                amount: orderData.amount,
                items: orderData.items.map((item: any) => ({ title: item.title, price: item.price })),
              });
            }

            showToast("Payment successful! Your downloads are ready.", "success");
            setTimeout(() => {
              window.location.href = `/download/${data.orderId}`;
            }, 1000);
          } else {
            showToast(verifyData.error || "Payment verification failed", "error");
          }
        },
        prefill: {
          name: session?.user?.name || guestName,
          email: session?.user?.email || guestEmail,
          contact: guestPhone,
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            showToast("Payment cancelled", "info");
          },
          escape: true,
          backdropclose: false,
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: {
        error: { code: string; description: string; source: string; step: string };
      }) {
        showToast(`Payment failed: ${response.error.description}`, "error");
        setLoading(false);
      });
      rzp.open();
      setShowGuestForm(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong", "error");
      setLoading(false);
    }
  }

  function handleGuestCheckout() {
    setShowGuestForm(true);
  }

  async function submitGuestDetails() {
    if (!guestEmail || !guestName || !guestPhone) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    await handleRazorpayPayment();
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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


  return (
    <>
      <div className="flex-1 space-y-2">
        <button
          onClick={isLoggedIn ? handleRazorpayPayment : handleGuestCheckout}
          disabled={loading}
          className="btn-primary w-full"
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Buy Now
            </>
          )}
        </button>
      </div>
    </>
  );
}