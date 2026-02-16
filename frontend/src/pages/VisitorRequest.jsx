import { useState } from "react";

export default function VisitorRequest() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    idProof: "",
    hostId: "",
    purpose: "",
    visitDate: ""
  });

  const [msg, setMsg] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/visitor/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "Error");
      } else {
        setMsg("Request created. ID: " + data.requestId);
      }
    } catch (err) {
      setMsg("Server error");
    }
  }

  return (
    <div>
      <h3>Visitor Request</h3>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Visitor name"
          value={form.name}
          onChange={handleChange}
        /><br />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        /><br />

        <input
          name="idProof"
          placeholder="ID proof"
          value={form.idProof}
          onChange={handleChange}
        /><br />

        <input
          name="hostId"
          placeholder="Host ID"
          value={form.hostId}
          onChange={handleChange}
        /><br />

        <input
          name="purpose"
          placeholder="Purpose"
          value={form.purpose}
          onChange={handleChange}
        /><br />

        <input
          type="date"
          name="visitDate"
          value={form.visitDate}
          onChange={handleChange}
        /><br /><br />

        <button type="submit">Submit request</button>
      </form>

      <p>{msg}</p>
    </div>
  );
}
