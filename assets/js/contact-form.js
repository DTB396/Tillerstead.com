(function () {
  'use strict';

  /**
   * Build a mailto: URL with encoded subject and body, omitting internal fields.
   * Ensures CRLF line breaks for RFC 5322 compliance.
   */
  const buildMailto = (formData) => {
    const subject = encodeURIComponent(
      'Tillerstead Project Inquiry – TCNA/New Jersey HIC Compliant',
    );
    const bodyLines = [];
    formData.forEach((value, key) => {
      // Exclude internal/anti-spam fields
      if (
        key === 'form-name' ||
        key === 'bot-field' ||
        key === '_trap' ||
        /^_|trap/i.test(key)
      )
        return;
      // Normalize line breaks for email clients
      const cleanValue = String(value)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n/g, '\r\n');
      bodyLines.push(`${key}: ${cleanValue}`);
    });
    // Double CRLF for readability
    const body = encodeURIComponent(bodyLines.join('\r\n\r\n'));
    return `mailto:info@tillerstead.com?subject=${subject}&body=${body}`;
  };

  /**
   * Display a status message with appropriate styling and ARIA attributes.
   */
  const showStatus = (el, message, state = 'success') => {
    if (!el) return;
    el.textContent = message;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.classList.remove(
      'sr-only',
      'has-error',
      'ts-form-error',
      'ts-form-success',
    );
    if (state === 'error') {
      el.classList.add('ts-form-error');
    } else {
      el.classList.add('ts-form-success');
    }
  };

  /**
   * Encode form data for x-www-form-urlencoded POST.
   */
  const encodeForm = (form) => {
    const data = new FormData(form);
    if (!data.get('form-name') && form.getAttribute('name')) {
      data.append('form-name', form.getAttribute('name'));
    }
    return { data, encoded: new URLSearchParams(data).toString() };
  };

  /**
   * Validate required fields for accessibility and compliance.
   * Returns an array of error messages.
   */
  const validateForm = (form) => {
    const errors = [];
    form.querySelectorAll('[required]').forEach((field) => {
      if (!field.value.trim()) {
        const label =
          form.querySelector(`label[for="${field.id}"]`)?.textContent ||
          field.getAttribute('aria-label') ||
          field.name ||
          'This field';
        errors.push(`${label} is required.`);
      }
    });
    return errors;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-contact-form]');
    if (!forms.length) return;

    forms.forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector(
          'button[type="submit"], input[type="submit"]',
        );
        submitBtn?.setAttribute('disabled', 'true');

        const statusEl =
          form.querySelector('[data-form-status]') ||
          document.getElementById('form-status');

        // Validate required fields
        const errors = validateForm(form);
        if (errors.length) {
          showStatus(statusEl, errors.join(' '), 'error');
          submitBtn?.removeAttribute('disabled');
          return;
        }

        const { data, encoded } = encodeForm(form);
        const fallbackHref = buildMailto(data);
        const action = (form.getAttribute('action') || '').trim();
        const hasEndpoint =
          action && action !== '#' && !action.startsWith('mailto:');

        let submitted = false;

        if (hasEndpoint) {
          try {
            const response = await fetch(action, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: encoded,
            });

            if (!response.ok) {
              throw new Error(`Status ${response.status}`);
            }

            submitted = true;
            showStatus(
              statusEl,
              'Your request has been received. Tillerstead adheres to TCNA and New Jersey HIC standards—expect a detailed, expert reply within 1 business day.',
              'success',
            );
            form.reset();
            // Redirect if _next is provided
            const nextUrl = new FormData(form).get('_next');
            if (nextUrl) {
              setTimeout(() => {
                window.location.href = nextUrl;
              }, 250);
            }
          } catch (error) {
            console.error(
              'Form submission failed; falling back to mailto:',
              error,
            );
          }
        }

        if (!submitted) {
          showStatus(
            statusEl,
            'We’ve opened your email app with your project details. If your email client did not open, please contact info@tillerstead.com directly. All inquiries are handled per TCNA and New Jersey HIC requirements.',
            'success',
          );
          setTimeout(() => {
            window.location.href = fallbackHref;
          }, 500);
        }

        submitBtn?.removeAttribute('disabled');
      });
    });
  });
})();
