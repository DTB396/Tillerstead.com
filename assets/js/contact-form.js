(function () {
  'use strict';

  const buildMailto = (formData) => {
    const subject = encodeURIComponent('New Tillerstead project inquiry');
    const bodyLines = [];
    formData.forEach((value, key) => {
<<<<<<< HEAD
      // Skip internal fields like form-name, honeypots, and hidden control fields
      if (key === 'form-name' || key === 'bot-field' || key === '_trap' || /^_|trap/i.test(key)) return;
=======
      // Skip internal fields like form-name, honeypot, etc.
      if (key === 'form-name' || key === 'bot-field' || key === '_trap') return;
>>>>>>> cd94431d4595c868507e3ce0fccbb2a3869edcde
      // Normalize line breaks to CRLF for email clients
      const cleanValue = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');
      bodyLines.push(`${key}: ${cleanValue}`);
    });
    // Use double CRLF between fields for readability
    const body = encodeURIComponent(bodyLines.join('\r\n\r\n'));
    return `mailto:info@tillerstead.com?subject=${subject}&body=${body}`;
  };

  const showStatus = (el, message, state = 'success') => {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('sr-only', 'has-error', 'ts-form-error', 'ts-form-success');
    if (state === 'error') {
      el.classList.add('ts-form-error');
    } else {
      el.classList.add('ts-form-success');
    }
  };

  const encodeForm = (form) => {
    const data = new FormData(form);
    if (!data.get('form-name') && form.getAttribute('name')) {
      data.append('form-name', form.getAttribute('name'));
    }
    return { data, encoded: new URLSearchParams(data).toString() };
  };

  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-contact-form]');
    if (!forms.length) return;

    forms.forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        submitBtn?.setAttribute('disabled', 'true');

        const statusEl = form.querySelector('[data-form-status]') || document.getElementById('form-status');
        const { data, encoded } = encodeForm(form);
        const fallbackHref = buildMailto(data);
        const action = (form.getAttribute('action') || '').trim();
        const hasEndpoint = action && action !== '#' && !action.startsWith('mailto:');

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
              'Request received. I’ll review and reply shortly (usually within 1 business day).',
              'success',
            );
            form.reset();
<<<<<<< HEAD
            // If a success redirect is provided, navigate there via GET to avoid 405s
            const nextUrl = (new FormData(form)).get('_next');
            if (nextUrl) {
              setTimeout(() => { window.location.href = nextUrl; }, 250);
            }
=======
>>>>>>> cd94431d4595c868507e3ce0fccbb2a3869edcde
          } catch (error) {
            console.error('Form submission failed; falling back to mailto:', error);
          }
        }

        if (!submitted) {
          showStatus(
            statusEl,
            'We’ve opened your email app with your project details. If it did not open, please email info@tillerstead.com directly.',
            'success',
          );
          // Brief delay to allow message to display before navigation
          setTimeout(() => {
            window.location.href = fallbackHref;
          }, 500);
        }

        submitBtn?.removeAttribute('disabled');
      });
    });
  });
})();
