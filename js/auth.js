import { loginUser, signupUser, googleSignIn, redirectToDashboard, getCurrentUser } from './firebase-config.js';

/* ===================================================
   AUTH — Login & Signup Logic
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const user = getCurrentUser();
  if (user) {
    redirectToDashboard(user);
    return;
  }

  // ---- Google Sign In ----
  const googleBtn = document.getElementById('googleSignIn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      // Check if we are on the signup page with role selection
      const roleEl = document.querySelector('input[name="role"]:checked');
      const selectedRole = roleEl ? roleEl.value : null;
      
      const phoneEl = document.getElementById('whatsappNumber');
      const whatsappNumber = phoneEl ? phoneEl.value.trim() : null;

      googleBtn.disabled = true;
      const originalHtml = googleBtn.innerHTML;
      googleBtn.innerHTML = '<span>Signing in...</span>';
      hideError();

      try {
        const user = await googleSignIn(selectedRole, whatsappNumber);
        redirectToDashboard(user);
      } catch (err) {
        showError(err.message || 'Google sign-in failed. Please try again.');
        googleBtn.disabled = false;
        googleBtn.innerHTML = originalHtml;
      }
    });
  }
});

// ---- Helper Functions ----
function showError(message) {
  const el = document.getElementById('authError');
  if (el) {
    el.textContent = message;
    el.classList.add('visible');
  }
}

function hideError() {
  const el = document.getElementById('authError');
  if (el) {
    el.classList.remove('visible');
  }
}

// Make togglePassword globally available
window.togglePassword = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i data-lucide="eye-off" style="width:16px;height:16px;"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i data-lucide="eye" style="width:16px;height:16px;"></i>';
  }
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
};
