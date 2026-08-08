"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RazorpayAccount = {
  id: string;
  name: string;
  keyId: string;
  keySecret: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
};

export default function RazorpayAccountsPage() {
  const [accounts, setAccounts] = useState<RazorpayAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    keyId: "",
    keySecret: "",
    isActive: true,
    isDefault: false,
  });
  const [error, setError] = useState<string | null>(null);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/razorpay-accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/admin/razorpay-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create account");
      await fetchAccounts();
      setShowForm(false);
      setFormData({ name: "", keyId: "", keySecret: "", isActive: true, isDefault: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/razorpay-accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  }

  async function setDefault(id: string) {
    try {
      const res = await fetch(`/api/admin/razorpay-accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteAccount(id: string) {
    if (!confirm("Delete this Razorpay account? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/razorpay-accounts/${id}`, { method: "DELETE" });
      if (res.ok) fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Razorpay Accounts</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-brand-500">
          ← Back to Admin
        </Link>
      </div>

      {showForm ? (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add New Razorpay Account</h2>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Business Account 1"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Key ID</label>
              <input
                type="text"
                value={formData.keyId}
                onChange={(e) => setFormData({ ...formData, keyId: e.target.value })}
                placeholder="rzp_test_..."
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Key Secret</label>
              <input
                type="password"
                value={formData.keySecret}
                onChange={(e) => setFormData({ ...formData, keySecret: e.target.value })}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm">Active</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isDefault" className="text-sm">Set as Default</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", keyId: "", keySecret: "", isActive: true, isDefault: false });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary text-sm"
        >
          + Add Razorpay Account
        </button>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          Loading accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-1">No Razorpay accounts configured.</p>
          <p className="text-sm">Add your first Razorpay account to start accepting payments.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Name</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Key ID</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Status</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Default</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Created</th>
                <th className="px-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-4 font-medium">{acc.name}</td>
                  <td className="px-3 font-mono text-xs">{acc.keyId}</td>
                  <td className="px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        acc.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {acc.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3">
                    {acc.isDefault ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Default
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefault(acc.id)}
                        className="text-brand-500 hover:text-brand-600 text-xs font-medium"
                      >
                        Set Default
                      </button>
                    )}
                  </td>
                  <td className="px-3 text-gray-500 dark:text-gray-400">
                    {new Date(acc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleActive(acc.id, acc.isActive)}
                        className="text-brand-500 hover:text-brand-600 text-xs font-medium"
                      >
                        {acc.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
