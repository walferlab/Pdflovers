"use client";

import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  message: "",
};

export function ContactForm() {
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
      const response = await fetch("/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to send message right now.");
      }

      setSubmitted(true);
      setFormState(initialState);
    } catch (error) {
      setErrorMessage(error.message || "Unable to send message right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <label htmlFor="contact-name">Your name</label>
      <input
        id="contact-name"
        name="name"
        type="text"
        autoComplete="name"
        required
        value={formState.name}
        onChange={handleChange}
        placeholder="Enter your full name"
      />

      <label htmlFor="contact-email">Email</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={formState.email}
        onChange={handleChange}
        placeholder="you@example.com"
      />

      <label htmlFor="contact-message">Message</label>
      <textarea
        id="contact-message"
        name="message"
        rows={6}
        required
        value={formState.message}
        onChange={handleChange}
        placeholder="How can we help you?"
      />

      <button className="button-solid" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      {errorMessage ? <p className="request-error">{errorMessage}</p> : null}

      {submitted ? (
        <p className="request-success">Thanks, your message has been received.</p>
      ) : null}
    </form>
  );
}
