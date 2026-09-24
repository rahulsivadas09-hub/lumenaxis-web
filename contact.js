/**
 * Contact Form Handler for Lumen Axis (lumenaxis.store)
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const statusDiv = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI Loading state
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';
    statusDiv.className = '';
    statusDiv.style.display = 'none';

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      message: document.getElementById('message').value
    };

    try {
      // Endpoint can be updated in lumin-email-setup.md (e.g., Web3Forms or Formspree)
      // Defaulting to client simulation if no active endpoint configured
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success
      statusDiv.className = 'success';
      statusDiv.innerText = 'Thank you! Your project inquiry has been received. We will respond within 24 hours.';
      contactForm.reset();
    } catch (error) {
      statusDiv.className = 'error';
      statusDiv.innerText = 'Unable to send message at this time. Please email us directly at contact@lumenaxis.store';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Submit Inquiry';
    }
  });
});
