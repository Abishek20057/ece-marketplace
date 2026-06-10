# ECE Component Hub 🔌

A department-exclusive marketplace for ECE project components.  
Students and faculty can browse, borrow (temporary) or purchase (permanent) reusable modules from senior projects.

---

## 📁 Project Structure

```
ece-marketplace/
├── index.html          → Homepage (hero, plans, featured components)
├── marketplace.html    → Full component listing with filters
├── about.html          → How it works + comparison table
├── contact.html        → Contact form
├── login.html          → Login page
├── register.html       → Registration page
│
├── css/
│   └── style.css       → Complete design system & all page styles
│
└── js/
    ├── data.js         → ⭐ Component data (EDIT THIS with your real components)
    ├── main.js         → Homepage featured grid + modal
    ├── marketplace.js  → Filter, sort, search, modal logic
    ├── circuit.js      → Animated circuit board canvas (hero background)
    ├── auth.js         → Login / Register form handling
    └── contact.js      → Contact form submission
```

---

## 🚀 Getting Started

1. Open `index.html` in a browser — no build step needed.
2. All pages are plain HTML/CSS/JS (no framework, no dependencies except Google Fonts).

---

## ✏️ How to Add Components

Edit `js/data.js`. Each component object looks like:

```js
{
  id: 13,                          // Unique number
  name: "Your Component Name",
  description: "What it does…",
  category: "sensor",              // sensor | microcontroller | power | communication | signal | embedded
  categoryLabel: "Sensor",         // Human-readable
  icon: "🔌",                      // Emoji shown on card
  type: ["temporary", "permanent"],// Which access types apply
  tempPrice: 0,                    // 0 = free; null = not available
  permPrice: 299,                  // Amount in ₹; null = not available
  project: "Project Name – Year",
  tech: ["Arduino", "C++"],        // Tech stack tags
  features: ["Feature 1", "Feature 2"]  // Bullet points in modal
}
```

---

## 💳 Payment Integration

Currently the "Buy" buttons redirect to `login.html`. To add real payments:

- **Razorpay** (recommended for India): add Razorpay checkout script, call on button click.
- **Instamojo / PayU**: alternatives for smaller volumes.

---

## 🔑 Backend / Auth

Right now auth is simulated (redirects after delay). To make it real:
- Connect to Firebase Auth, Supabase, or your college server.
- Replace the `setTimeout` in `js/auth.js` with your actual API call.

---

## 🎨 Customization

All colors, fonts, and spacing are in CSS variables at the top of `css/style.css`:

```css
:root {
  --navy:   #0A1628;
  --blue:   #3B82F6;
  --amber:  #F59E0B;
  /* ... */
}
```

---

## 📬 Contact Form

`js/contact.js` currently simulates a send. To make it real:
- Use **EmailJS** (free tier, no backend needed): https://www.emailjs.com
- Or connect to a simple PHP/Node.js backend endpoint.

---

Built for the ECE Department. © 2025
