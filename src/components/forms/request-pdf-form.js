"use client";

import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  details: "",
};

export function RequestPdfForm() {
  const [formState, setFormState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSubmitted(false);

    try {
      const response = await fetch("/api/request-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit request right now.");
      }

      setSubmitted(true);
      setFormState(initialState);
    } catch (error) {
      setErrorMessage(error.message || "Unable to submit request right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <label htmlFor="request-name">Your name</label>
      <input
        id="request-name"
        name="name"
        type="text"
        autoComplete="name"
        required
        value={formState.name}
        onChange={handleChange}
        placeholder="Enter your full name"
      />

      <label htmlFor="request-email">Email</label>
      <input
        id="request-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={formState.email}
        onChange={handleChange}
        placeholder="you@example.com"
      />

      <label htmlFor="request-details">Book or PDF details</label>
      <textarea
        id="request-details"
        name="details"
        rows={6}
        required
        value={formState.details}
        onChange={handleChange}
        placeholder="Title, author, topic, or any details to help us find it"
      />

      <button className="button-solid" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Send Request"}
      </button>

      {errorMessage ? <p className="request-error">{errorMessage}</p> : null}

      {submitted ? (
        <p className="request-success">Thanks, your request was submitted successfully.</p>
      ) : null}
    </form>
  );
}
