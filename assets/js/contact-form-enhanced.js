/**
 * Enhanced Contact Form with Real-Time Validation
 * TCNA-compliant, accessible, with success animations
 */

(function () {
  'use strict';

  const form = document.querySelector('.contact-form, form[action*="contact"]');
  if (!form) {
    return;
  }

  // Validation rules
  const validators = {
    required: (value) => value.trim().length > 0,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length >= 10;
    },
    minLength: (value, min) => value.trim().length >= min,
    maxLength: (value, max) => value.trim().length <= max,
  };

  // Error messages
  const messages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number (10+ digits)',
    minLength: (min) => `Please enter at least ${min} characters`,
    maxLength: (max) => `Please enter no more than ${max} characters`,
  };

  // Validate single field
  function validateField(input) {
    const value = input.value;
    const rules = input.dataset.validate
      ? input.dataset.validate.split(',')
      : [];
    let isValid = true;
    let errorMessage = '';

    // Check required
    if (input.required && !validators.required(value)) {
      isValid = false;
      errorMessage = messages.required;
    }

    // Check type-specific validation
    if (isValid && value.trim()) {
      const type = input.type;

      if (type === 'email' && !validators.email(value)) {
        isValid = false;
        errorMessage = messages.email;
      } else if (type === 'tel' && !validators.phone(value)) {
        isValid = false;
        errorMessage = messages.phone;
      }

      // Custom rules
      rules.forEach((rule) => {
        const [ruleName, param] = rule.split(':');
        if (validators[ruleName] && !validators[ruleName](value, param)) {
          isValid = false;
          errorMessage = messages[ruleName](param);
        }
      });
    }

    // Update UI
    updateFieldUI(input, isValid, errorMessage);
    return isValid;
  }

  // Update field UI with validation state
  function updateFieldUI(input, isValid, errorMessage) {
    const formGroup = input.closest('.form-group, .form-field');

    if (isValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      formGroup?.classList.remove('has-error');
      formGroup?.classList.add('has-success');
      removeError(input);
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      formGroup?.classList.remove('has-success');
      formGroup?.classList.add('has-error');
      showError(input, errorMessage);
    }
  }

  // Show error message
  function showError(input, message) {
    removeError(input);

    const error = document.createElement('span');
    error.className = 'field-error';
    error.setAttribute('role', 'alert');
    error.textContent = message;
    error.id = 'error-' + (input.id || input.name);

    const formGroup = input.closest('.form-group, .form-field');
    if (formGroup) {
      formGroup.appendChild(error);
    } else {
      input.parentNode.appendChild(error);
    }

    // Announce to screen readers
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', error.id);
  }

  // Remove error message
  function removeError(input) {
    const formGroup = input.closest('.form-group, .form-field');
    const error =
      formGroup?.querySelector('.field-error') ||
      input.parentNode.querySelector('.field-error');

    if (error) {
      error.remove();
    }

    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  // Character counter
  function addCharacterCounter(textarea) {
    const maxLength = textarea.maxLength;
    if (maxLength === -1) return;

    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.setAttribute('aria-live', 'polite');

    const updateCounter = () => {
      const remaining = maxLength - textarea.value.length;
      counter.textContent = `${remaining} characters remaining`;
      counter.classList.toggle('warning', remaining < 50);
    };

    textarea.addEventListener('input', updateCounter);
    textarea.parentNode.appendChild(counter);
    updateCounter();
  }

  // Success notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');

    const content = document.createElement('p');
    content.textContent = message;
    notification.appendChild(content);

    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('is-visible');
    });

    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('is-visible');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // Initialize form
  const inputs = form.querySelectorAll('input, textarea, select');

  inputs.forEach((input) => {
    // Real-time validation on blur
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        validateField(input);
      }
    });

    // Clear error on input
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateField(input);
      }
    });

    // Add character counter to textareas
    if (input.tagName === 'TEXTAREA') {
      addCharacterCounter(input);
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    inputs.forEach((input) => {
      if (input.required || input.value.trim()) {
        if (!validateField(input)) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.textContent = 'Sending...';

    try {
      // Submit form (adjust endpoint as needed)
      const _formData = new FormData(form);

      // For now, simulate success (replace with actual submission)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success
      submitBtn.classList.remove('btn-loading');
      submitBtn.classList.add('btn-success');
      submitBtn.textContent = 'Sent!';

      showNotification(
        "Message sent successfully! We'll get back to you soon.",
        'success',
      );

      // Reset form after delay
      setTimeout(() => {
        form.reset();
        inputs.forEach((input) => {
          input.classList.remove('is-valid', 'is-invalid');
          input
            .closest('.form-group, .field')
            ?.classList.remove('has-success', 'has-error');
        });
        submitBtn.classList.remove('btn-success');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 2000);
    } catch (error) {
      // Show error
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      showNotification(
        'Failed to send message. Please try again or call us directly.',
        'error',
      );
      console.error('Form submission error:', error);
    }
  });
})();
