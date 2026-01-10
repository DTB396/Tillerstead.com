/* build-calculators.js — placeholder for build guide calculators
   Kept intentionally minimal to avoid missing asset requests in production.
*/

(() => {
  const calculators = document.querySelectorAll('[data-build-calculator]');
  if (!calculators.length) return;

  calculators.forEach((calculator) => {
    calculator.dataset.ready = 'true';
  });
})();
