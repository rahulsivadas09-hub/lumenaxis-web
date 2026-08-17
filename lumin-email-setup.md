# Lumin Store — replace formsubmit.co with Cloudflare Email Routing

Two changes to make in the `lumenaxis-web` repo, plus one-time Cloudflare setup.

## 1. New file: `functions/api/contact.js`

Create the folders `functions/api/` at the repo root (next to `index.html`) and add `contact.js` there — full content is in `contact.js` in this same output. This is a Cloudflare Pages Function; it deploys automatically with the rest of the static site, no build step needed.

## 2. Edit `index.html` — the contact form

Find your `<form>` in the Contact section. It currently looks like this:

```html
<form action="https://formsubmit.co/rahul19979ht@gmail.com" method="POST" class="...">
    <input type="hidden" name="_subject" id="contact-form-subject" value="New Contact Inquiry - Lumin Website">
    <input type="hidden" name="_captcha" value="false">
    <input type="text" name="_honey" style="display:none">
    ...
    <input type="text" name="name" ...>
    <input type="email" name="email" ...>
    <textarea name="message" id="contact-form-message" ...></textarea>
    <button type="submit">Send Message</button>
</form>
```

Replace the `<form ...>` opening tag and the hidden fields with:

```html
<form id="contact-form" class="...">
    <div id="contact-success-msg" class="hidden rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-3 mb-4">
        ✅ Message sent! We'll get back to you within 1–2 hours.
    </div>
    <div id="contact-error-msg" class="hidden rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 mb-4">
        Something went wrong. Please try again or message us on WhatsApp.
    </div>
    <input type="hidden" name="subject" id="contact-form-subject" value="New Contact Inquiry - Lumin Website">
```

Keep the rest (name/email/message fields) exactly as-is — just make sure your submit button has an id:

```html
<button type="submit" id="contact-submit-btn" class="...">Send Message</button>
```

Everything else in the form (labels, styling, layout) stays untouched.

## 3. Edit `index.html` — the `<script>` block

Add this near the end of your existing `<script>...</script>` (anywhere after `fillContactForm` is defined, e.g. right after `DOMContentLoaded` setup):

```js
const contactForm = document.getElementById('contact-form');
const contactSuccessMsg = document.getElementById('contact-success-msg');
const contactErrorMsg = document.getElementById('contact-error-msg');
const contactSubmitBtn = document.getElementById('contact-submit-btn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        contactSuccessMsg.classList.add('hidden');
        contactErrorMsg.classList.add('hidden');
        contactSubmitBtn.disabled = true;
        const originalText = contactSubmitBtn.textContent;
        contactSubmitBtn.textContent = 'Sending...';

        try {
            const formData = new FormData(contactForm);
            const res = await fetch('/api/contact', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to send');
            contactForm.reset();
            contactSuccessMsg.classList.remove('hidden');
        } catch (err) {
            contactErrorMsg.classList.remove('hidden');
        } finally {
            contactSubmitBtn.disabled = false;
            contactSubmitBtn.textContent = originalText;
        }
    });
}
```

`fillContactForm()` (used by the order modal's "Email" button) doesn't need any changes — it just fills `#contact-form-subject` / `#contact-form-message`, which still exist under the same ids.

## 4. One-time Cloudflare dashboard setup (required for emails to actually send)

1. **Email Routing** — Cloudflare dashboard → `lumenaxis.store` → Email → Email Routing → Enable. Add `rahul19979ht@gmail.com` as a destination address and click the verification link Cloudflare emails you.
2. **Send Email binding** — Cloudflare dashboard → Workers & Pages → `lumenaxis-web` → Settings → Functions → "Send email" bindings → Add binding:
   - Variable name: `EMAIL`
   - Destination address: `rahul19979ht@gmail.com` (the one verified above)
3. Save and trigger a new deployment (or wait for the next push) so the binding takes effect.

Once that's done, `rahul19979ht@gmail.com` never appears anywhere in your page source — the form posts to your own `/api/contact` endpoint, which sends the email server-side via Cloudflare, same as getstreamnow.
