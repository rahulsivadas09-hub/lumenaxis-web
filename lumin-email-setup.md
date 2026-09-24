# Email & Form Setup Guide — Lumen Axis

This guide explains how to connect custom domain routing for `lumenaxis.store` and enable live contact form submissions for `contact.js`.

---

## 1. Domain & DNS Configuration for `lumenaxis.store`

Point your domain registrar (e.g., Namecheap, Cloudflare, or Porkbun) to your GitHub Pages or hosting deployment:

### GitHub Pages CNAME Setup
1. In your GitHub repository (`lumenaxis-web-main`), go to **Settings > Pages**.
2. Set Source to `main` branch / `root` folder.
3. Under **Custom Domain**, enter `lumenaxis.store` and click **Save**.
4. Check **Enforce HTTPS**.

### DNS Records (At Domain Registrar)
* **A Records** (Point to GitHub Pages IPs):
  * `185.199.108.153`
  * `185.199.109.153`
  * `185.199.110.153`
  * `185.199.111.153`
* **CNAME Record**:
  * `www` -> `<your-github-username>.github.io`

---

## 2. Enabling Live Form Submissions (`contact.js`)

To receive form submissions from `index.html` directly in your inbox without running a custom backend:

### Option A: Web3Forms (Recommended — Free)
1. Go to [web3forms.com](https://web3forms.com) and enter your target email (`contact@lumenaxis.store` or your personal email).
2. Copy your generated **Access Key**.
3. In `contact.js`, replace the `try` block with:

```javascript
const response = await fetch('[https://api.web3forms.com/submit](https://api.web3forms.com/submit)', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_key: 'YOUR_ACCESS_KEY_HERE',
    name: formData.name,
    email: formData.email,
    message: formData.message,
    subject: 'New Web Design Inquiry — Lumen Axis'
  })
});
