/**
 * Cloudflare Pages Function: /api/contact
 *
 * Save this file at: functions/api/contact.js  (create the `functions/api/` folders
 * at the root of the lumenaxis-web repo, next to index.html).
 *
 * Sends the Lumin contact/order form via Cloudflare Email Routing instead of the
 * third-party formsubmit.co service — same approach getstreamnow-web uses, minus
 * the mimetext dependency (built by hand here so no package.json/build step is
 * needed for this static Pages project).
 *
 * One-time setup required in the Cloudflare dashboard (see bottom of this file):
 *   1. Enable Email Routing on the lumenaxis.store zone and verify your real
 *      destination inbox.
 *   2. Add a "Send email" binding named EMAIL to the lumenaxis-web Pages project.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The "from" address — any address @lumenaxis.store works once Email Routing is
// enabled on the zone; it does not need to be individually verified.
const SENDER_EMAIL = 'orders@lumenaxis.store';
const SENDER_NAME = 'Lumin Website';

// Where the message actually lands — must be a destination address you've
// verified under Cloudflare > lumenaxis.store > Email > Email Routing.
const DESTINATION_EMAIL = 'rahul19979ht@gmail.com';

function json(data, init) {
	return new Response(JSON.stringify(data), {
		...init,
		headers: { 'Content-Type': 'application/json', ...(init && init.headers) },
	});
}

function escapeHtml(str) {
	return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Hand-rolled multipart/alternative MIME message — avoids needing the `mimetext`
// npm package (and therefore a package.json/build step) for a single-endpoint
// static Pages project.
function buildRawEmail({ from, to, subject, text, html }) {
	const boundary = 'lumin-' + crypto.randomUUID().replace(/-/g, '');
	return [
		`From: ${from}`,
		`To: ${to}`,
		`Subject: ${subject}`,
		`MIME-Version: 1.0`,
		`Content-Type: multipart/alternative; boundary="${boundary}"`,
		'',
		`--${boundary}`,
		`Content-Type: text/plain; charset="UTF-8"`,
		'',
		text,
		'',
		`--${boundary}`,
		`Content-Type: text/html; charset="UTF-8"`,
		'',
		html,
		'',
		`--${boundary}--`,
		'',
	].join('\r\n');
}

export async function onRequestPost(context) {
	const { request, env } = context;

	// Basic same-origin check (defense in depth — this endpoint has no cookies/session).
	const origin = request.headers.get('Origin');
	if (origin) {
		try {
			if (new URL(origin).host !== new URL(request.url).host) {
				return json({ status: 'error', message: 'Invalid request origin' }, { status: 403 });
			}
		} catch {
			return json({ status: 'error', message: 'Invalid request origin' }, { status: 403 });
		}
	}

	let form;
	try {
		form = await request.formData();
	} catch {
		return json({ status: 'error', message: 'Invalid form submission' }, { status: 400 });
	}

	const name = String(form.get('name') || '').trim().slice(0, 200);
	const email = String(form.get('email') || '').trim().slice(0, 200);
	const message = String(form.get('message') || '').trim().slice(0, 3000);
	const subject = String(form.get('subject') || 'New Contact Inquiry - Lumin Website').trim().slice(0, 200);

	if (!name || !email || !message) {
		return json({ status: 'error', message: 'Please fill in all fields.' }, { status: 400 });
	}
	if (!EMAIL_RE.test(email)) {
		return json({ status: 'error', message: 'Please enter a valid email address.' }, { status: 400 });
	}

	try {
		if (!env.EMAIL) {
			throw new Error('EMAIL binding not configured on this Pages project');
		}

		const { EmailMessage } = await import('cloudflare:email');

		const raw = buildRawEmail({
			from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
			to: DESTINATION_EMAIL,
			subject,
			text: `From: ${name} <${email}>\n\n${message}`,
			html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
		});

		const emailMessage = new EmailMessage(SENDER_EMAIL, DESTINATION_EMAIL, raw);
		await env.EMAIL.send(emailMessage);
	} catch (err) {
		console.error('Lumin contact email failed', err && err.message);
		return json({ status: 'error', message: 'Could not send your message. Please try WhatsApp instead.' }, { status: 500 });
	}

	return json({ status: 'success' });
}

/**
 * ── One-time Cloudflare dashboard setup ────────────────────────────────────
 *
 * 1. Email Routing:
 *    Cloudflare dashboard → lumenaxis.store → Email → Email Routing → Enable.
 *    Add rahul19979ht@gmail.com (or whichever inbox you want these in) as a
 *    destination address and verify it via the confirmation email Cloudflare sends.
 *
 * 2. Send Email binding on the Pages project:
 *    Cloudflare dashboard → Workers & Pages → lumenaxis-web → Settings → Functions
 *    → "Send email" bindings → Add binding
 *       Variable name: EMAIL
 *       Destination address: rahul19979ht@gmail.com (the one you verified above)
 *    Save, then re-deploy (or it applies to the next build) for the binding to
 *    take effect.
 */
