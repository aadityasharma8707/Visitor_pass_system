import { useState, useEffect } from "react";
import api from "../services/api";

export default function VisitorRequest() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    idProof: "",
    hostId: "",
    purpose: "",
    visitDate: ""
  });

  const [hosts,    setHosts]    = useState([]);
  const [msg,      setMsg]      = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    async function fetchHosts() {
      try {
        const data = await api.get("/visitor/hosts");
        setHosts(data);
      } catch (err) {
        console.error("Failed to load hosts", err);
      }
    }
    fetchHosts();
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const data = await api.post("/visitor/request", form);
      setMsg("✅ Request submitted! Your ID: " + data.requestId);
    } catch (err) {
      setMsg(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <h3>Submit a Visitor Request</h3>

      <form
        onSubmit={handleSubmit}
        aria-label="Visitor request form"
        style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 4 }}
        noValidate
      >
        {/* Name */}
        <label htmlFor="vr-name">Full name</label>
        <input
          id="vr-name"
          name="name"
          type="text"
          placeholder="Your full name"
          value={form.name}
          onChange={handleChange}
          required
          aria-required="true"
          autoComplete="name"
        />

        {/* Phone */}
        <label htmlFor="vr-phone">Phone number</label>
        <input
          id="vr-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="10-digit phone number"
          value={form.phone}
          onChange={handleChange}
          required
          aria-required="true"
          autoComplete="tel"
          pattern="\d{10}"
        />

        {/* ID Proof */}
        <label htmlFor="vr-idProof">ID proof (optional)</label>
        <input
          id="vr-idProof"
          name="idProof"
          type="text"
          placeholder="e.g. Aadhaar / PAN / Passport"
          value={form.idProof}
          onChange={handleChange}
        />

        {/* Host */}
        <label htmlFor="vr-host">Select host</label>
        <select
          id="vr-host"
          name="hostId"
          value={form.hostId}
          onChange={handleChange}
          required
          aria-required="true"
        >
          <option value="">-- Select a Host --</option>
          {hosts.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name} ({h.email})
            </option>
          ))}
        </select>

        {/* Purpose */}
        <label htmlFor="vr-purpose">Purpose of visit</label>
        <input
          id="vr-purpose"
          name="purpose"
          type="text"
          placeholder="Reason for your visit"
          value={form.purpose}
          onChange={handleChange}
          required
          aria-required="true"
        />

        {/* Visit Date */}
        <label htmlFor="vr-visitDate">Visit date</label>
        <input
          id="vr-visitDate"
          name="visitDate"
          type="date"
          value={form.visitDate}
          onChange={handleChange}
          required
          aria-required="true"
        />

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          style={{ marginTop: 12 }}
        >
          {loading ? "Submitting…" : "Submit request"}
        </button>
      </form>

      {msg && (
        <p role="status" aria-live="polite" style={{ marginTop: 12 }}>
          {msg}
        </p>
      )}
    </main>
  );
}
