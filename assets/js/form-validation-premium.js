/**
 * Premium Contact Form with Real-time Validation & Micro-interactions
 * Tillerstead.com - Professional Tile & Stone
 */

export class PremiumContactForm {
  constructor(formSelector = '[data-contact-form]') {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    this.fields = {
      name: this.form.querySelector('[name="name"]'),
      email: this.form.querySelector('[name="email"]'),
      phone: this.form.querySelector('[name="phone"]'),
      service: this.form.querySelector('[name="service"]'),
      message: this.form.querySelector('[name="message"]'),
    };

    this.errors = {};
    this.init();
  }

  init() {
    // Real-time validation on input
    Object.values(this.fields).forEach(field => {
      if (!field) return;
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearError(field));
    });

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field) {
    const name = field.getAttribute('name');
    const value = field.value.trim();
    let error = null;

    switch (name) {
      case 'name':
        if (!value) error = 'Name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;

      case 'email':
        if (!value) error = 'Email is required';
        else if (!this.isValidEmail(value)) error = 'Please enter a valid email';
        break;

      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!this.isValidPhone(value)) error = 'Please enter a valid phone number';
        break;

      case 'service':
        if (!value) error = 'Please select a service';
        break;

      case 'message':
        if (!value) error = 'Message is required';
        else if (value.length < 10) error = 'Message must be at least 10 characters';
        break;
    }

    if (error) {
      this.setError(field, error);
      return false;
    } else {
      this.clearError(field);
      return true;
    }
  }

  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isValidPhone(phone) {
    // Accept various phone formats
    const regex = /^[\d\-\+\(\)\s]{10,}$/;
    return regex.test(phone.replace(/\s/g, ''));
  }

  setError(field, message) {
    const fieldName = field.getAttribute('name');
    this.errors[fieldName] = message;

    field.classList.add('has-error');
    field.classList.remove('has-success');

    let errorEl = field.nextElementSibling;
    if (!errorEl?.classList.contains('field-error')) {
      errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      field.parentNode.insertBefore(errorEl, field.nextSibling);
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';

    // Shake animation
    field.animate(
      [
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(0)' }
      ],
      { duration: 300, easing: 'ease-in-out' }
    );
  }

  clearError(field) {
    const fieldName = field.getAttribute('name');
    delete this.errors[fieldName];

    field.classList.remove('has-error');

    const errorEl = field.nextElementSibling;
    if (errorEl?.classList.contains('field-error')) {
      errorEl.style.display = 'none';
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    Object.values(this.fields).forEach(field => {
      if (field && !this.validateField(field)) {
        isValid = false;
      }
    });

    if (!isValid) {
      this.showError('Please fix the errors above');
      return;
    }

    // Show loading state
    const submitBtn = this.form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Sending...';

    // Simulate submission (replace with actual API call)
    setTimeout(() => {
      this.showSuccess('Thank you! We'll be in touch shortly.');
      this.form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // Reset field states
      Object.values(this.fields).forEach(field => {
        if (field) {
          field.classList.remove('has-error', 'has-success');
        }
      });
    }, 2000);
  }

  showError(message) {
    const alert = document.createElement('div');
    alert.className = 'form-alert form-alert--error';
    alert.textContent = message;
    this.form.insertBefore(alert, this.form.firstChild);

    setTimeout(() => {
      alert.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 300 }
      );
      setTimeout(() => alert.remove(), 300);
    }, 4000);
  }

  showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'form-alert form-alert--success';
    alert.textContent = message;
    this.form.insertBefore(alert, this.form.firstChild);

    setTimeout(() => {
      alert.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 300 }
      );
      setTimeout(() => alert.remove(), 300);
    }, 4000);
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PremiumContactForm();
  });
} else {
  new PremiumContactForm();
}
