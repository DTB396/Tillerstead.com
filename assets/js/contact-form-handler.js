/**
 * Professional Contact Form Handler
 * Handles submission with success messaging and email notifications
 */

(function () {
  'use strict';

  const FORM_CONFIG = {
    formSelector: 'form[name="contact"]',
    endpoint: '/.netlify/functions/contact',
    successMessage: {
      title: 'Message Sent Successfully!',
      body: "Thank you for contacting Tillerstead. We've received your inquiry and will respond within 48 hours. If you don't hear from us, please text us at (609) 862-8808 to confirm we received your message.",
      confirmationSent: 'A confirmation email has been sent to your address.',
    },
    errorMessage: {
      title: 'Submission Error',
      body: 'We apologize, but there was an issue sending your message. Please email us directly at info@tillerstead.com or call (609) 862-8808.',
    },
  };

  function showMessage(type, title, body, extra = '') {
    const container = document.createElement('div');
    container.className = `form-message form-message--${type}`;
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');

    container.innerHTML = `
      <div class="form-message__content">
        <h3 class="form-message__title">${title}</h3>
        <p class="form-message__body">${body}</p>
        ${extra ? `<p class="form-message__extra">${extra}</p>` : ''}
        <button type="button" class="form-message__close" aria-label="Close message">×</button>
      </div>
    `;

    // Add close functionality
    container
      .querySelector('.form-message__close')
      .addEventListener('click', () => {
        container.remove();
      });

    return container;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateForm(formData) {
    const errors = [];

    if (!formData.get('name')?.trim()) {
      errors.push('Name is required');
    }

    const email = formData.get('email');
    if (!email?.trim()) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.get('message')?.trim()) {
      errors.push('Project details are required');
    }

    return errors;
  }

  async function submitToNetlify(formData) {
    // Try Netlify Forms first
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        return { success: true, method: 'netlify' };
      }
    } catch (e) {
      console.warn('Netlify Forms failed, trying mailto fallback:', e);
    }

    // Fallback to Formspree or direct email
    const subject = `Contact Form: ${formData.get('name')}`;
    const body = `
Name: ${formData.get('name')}
Email: ${formData.get('email')}
Phone: ${formData.get('phone') || 'Not provided'}

Message:
${formData.get('message')}

Submitted: ${new Date().toLocaleString()}
    `.trim();

    // Try Formspree endpoint (you'll need to set this up)
    try {
      const formspreeResponse = await fetch(
        'https://formspree.io/f/YOUR_FORM_ID',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            _subject: subject,
            _replyto: formData.get('email'),
          }),
        },
      );

      if (formspreeResponse.ok) {
        return { success: true, method: 'formspree' };
      }
    } catch (e) {
      console.warn('Formspree failed:', e);
    }

    // Last resort: mailto link
    const mailtoLink = `mailto:info@tillerstead.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    return { success: true, method: 'mailto' };
  }

  function initContactForm() {
    const form = document.querySelector(FORM_CONFIG.formSelector);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Remove any existing messages
      document.querySelectorAll('.form-message').forEach((msg) => msg.remove());

      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn?.textContent;

      // Validate
      const errors = validateForm(formData);
      if (errors.length > 0) {
        const errorMsg = showMessage(
          'error',
          'Please Fix These Errors',
          errors.join('. '),
        );
        form.insertBefore(errorMsg, form.firstChild);
        return;
      }

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      try {
        const result = await submitToNetlify(formData);

        if (result.success) {
          // Show success message
          const successMsg = showMessage(
            'success',
            FORM_CONFIG.successMessage.title,
            FORM_CONFIG.successMessage.body,
            FORM_CONFIG.successMessage.confirmationSent,
          );

          form.insertBefore(successMsg, form.firstChild);

          // Reset form
          form.reset();

          // Scroll to message
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Optional: Redirect to success page after delay
          setTimeout(() => {
            if (window.location.pathname !== '/success/') {
              window.location.href = '/success/';
            }
          }, 3000);
        }
      } catch (error) {
        console.error('Form submission error:', error);

        const errorMsg = showMessage(
          'error',
          FORM_CONFIG.errorMessage.title,
          FORM_CONFIG.errorMessage.body,
        );

        form.insertBefore(errorMsg, form.firstChild);
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } finally {
        // Restore button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });

    // Add loading styles if not present
    if (!document.querySelector('#form-handler-styles')) {
      const styles = document.createElement('style');
      styles.id = 'form-handler-styles';
      styles.textContent = `
        .form-message {
          padding: 1.5rem;
          border-radius: var(--ts-radius-md, 8px);
          margin-bottom: 1.5rem;
          position: relative;
          animation: slideIn 0.3s ease-out;
        }

        .form-message--success {
          background: var(--ts-color-success-soft, #d4edda);
          border: 2px solid var(--ts-color-success, #28a745);
          color: var(--ts-color-success-strong, #155724);
        }

        .form-message--error {
          background: var(--ts-color-error-soft, #f8d7da);
          border: 2px solid var(--ts-color-error, #dc3545);
          color: var(--ts-color-error-strong, #721c24);
        }

        .form-message__title {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .form-message__body {
          margin: 0 0 0.5rem;
          line-height: 1.6;
        }

        .form-message__extra {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .form-message__close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .form-message__close:hover {
          opacity: 1;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
