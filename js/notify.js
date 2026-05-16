/* ===================================================
   NOTIFICATION SERVICE — Centralized notification hub
   Uses EmailJS for automatic email delivery
   + WhatsApp wa.me for manual WhatsApp messaging
   + Browser toast notifications
   =================================================== */

// ============ CONFIGURATION ============
// Set these after creating your EmailJS account (free at https://emailjs.com)
const EMAILJS_CONFIG = {
  publicKey: 'g4UuL05_W9O4ii8Mr',      // Your EmailJS Public Key
  serviceId: 'service_sd885q1',      // Your EmailJS Service ID (e.g., 'service_gmail')
  templateId: 'template_30wp8i',     // Your EmailJS Template ID (e.g., 'template_notify')
};

// Check if EmailJS is configured
function isEmailConfigured() {
  return EMAILJS_CONFIG.publicKey !== '' &&
         EMAILJS_CONFIG.serviceId !== '' &&
         EMAILJS_CONFIG.templateId !== '';
}

// ============ EMAIL VIA EMAILJS ============
/**
 * Send email notification via EmailJS
 * @param {string} toName - Recipient name
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email body message
 * @returns {Promise<boolean>} success
 */
async function sendEmail(toName, toEmail, subject, message) {
  if (!isEmailConfigured()) {
    console.warn('[Notify] EmailJS not configured — skipping email.');
    return false;
  }

  if (!toEmail || toEmail.trim() === '') {
    console.warn('[Notify] No email address provided — skipping.');
    return false;
  }

  try {
    const params = {
      to_name: toName,
      to_email: toEmail,
      subject: subject,
      message: message,
      from_name: 'Panchakarma Clinic',
    };

    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, params, EMAILJS_CONFIG.publicKey);
    console.log(`[Notify] Email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('[Notify] Email failed:', err);
    return false;
  }
}

// ============ WHATSAPP VIA WA.ME ============
/**
 * Open WhatsApp with a pre-filled message
 * @param {string} phone - Phone number with country code (e.g., '919876543210')
 * @param {string} message - Pre-filled message
 */
function sendWhatsApp(phone, message) {
  const encodedMsg = encodeURIComponent(message);
  const url = phone && phone.trim() !== ''
    ? `https://wa.me/${phone}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`;
  window.open(url, '_blank');
}

// ============ BROWSER TOAST NOTIFICATION ============
/**
 * Show a toast notification on screen
 * @param {string} message - Toast message
 * @param {string} type - 'success' | 'info' | 'warning' | 'error'
 */
function showToast(message, type = 'success') {
  // Create container if it doesn't exist
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;max-width:380px;';
    document.body.appendChild(container);
  }

  const colors = {
    success: { bg: '#E8F5E9', border: '#4CAF50', icon: '✅' },
    info:    { bg: '#E3F2FD', border: '#2196F3', icon: 'ℹ️' },
    warning: { bg: '#FFF8E1', border: '#FF9800', icon: '⚠️' },
    error:   { bg: '#FFEBEE', border: '#f44336', icon: '❌' },
  };

  const c = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    background:${c.bg};border-left:4px solid ${c.border};padding:14px 18px;
    border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.12);
    font-size:14px;line-height:1.5;color:#333;
    animation:slideInRight 0.3s ease-out;
    display:flex;align-items:flex-start;gap:10px;
  `;
  toast.innerHTML = `<span style="font-size:18px;flex-shrink:0;">${c.icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Inject animation keyframes once
if (!document.getElementById('toastAnimations')) {
  const style = document.createElement('style');
  style.id = 'toastAnimations';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ============ HIGH-LEVEL NOTIFICATION FUNCTIONS ============

/**
 * Notify when a patient requests a booking
 */
async function notifyBookingRequest({ patientName, patientEmail, patientPhone, practitionerName, practitionerEmail, practitionerPhone, therapy }) {
  // 1. Email to practitioner (automatic)
  await sendEmail(
    practitionerName,
    practitionerEmail,
    `New Booking Request — ${therapy}`,
    `Hello ${practitionerName},\n\n${patientName} has requested a ${therapy} therapy session.\n\nPlease log in to your Panchakarma dashboard to review and schedule the session.\n\nBest regards,\nPanchakarma Clinic`
  );

  // 2. Confirmation email to patient (automatic)
  await sendEmail(
    patientName,
    patientEmail,
    `Booking Request Sent — ${therapy}`,
    `Hello ${patientName},\n\nYour request for ${therapy} therapy has been sent to ${practitionerName}.\n\nThe practitioner will review your request and schedule your session shortly. You'll receive another notification when it's confirmed.\n\nBest regards,\nPanchakarma Clinic`
  );

  // 3. WhatsApp to practitioner
  sendWhatsApp(practitionerPhone, `Hello ${practitionerName}! I am ${patientName} and I would like to request a booking for ${therapy} therapy. Please check your Panchakarma dashboard to schedule my session.`);

  // 4. Toast
  showToast(`Booking request for ${therapy} sent to ${practitionerName}`, 'success');
}

/**
 * Notify when a practitioner schedules a session
 */
async function notifySessionScheduled({ patientName, patientEmail, patientPhone, practitionerName, practitionerEmail, practitionerPhone, therapy, startDate, time, duration }) {
  // 1. Email to patient (automatic)
  await sendEmail(
    patientName,
    patientEmail,
    `Session Scheduled — ${therapy}`,
    `Hello ${patientName},\n\nYour ${therapy} therapy session has been scheduled:\n\n📅 Start Date: ${startDate}\n🕐 Time: ${time}\n📆 Duration: ${duration} days\n👨‍⚕️ Practitioner: ${practitionerName}\n\nPlease log in to your Panchakarma patient dashboard for full details.\n\nBest regards,\nPanchakarma Clinic`
  );

  // 2. Confirmation email to practitioner (automatic)
  await sendEmail(
    practitionerName,
    practitionerEmail,
    `Booking Confirmed — ${therapy} for ${patientName}`,
    `Hello ${practitionerName},\n\nYou have successfully scheduled a session:\n\n👤 Patient: ${patientName}\n💆 Therapy: ${therapy}\n📅 Start: ${startDate}\n🕐 Time: ${time}\n📆 Duration: ${duration} days\n\nBest regards,\nPanchakarma Clinic`
  );

  // 3. WhatsApp to patient
  sendWhatsApp(patientPhone, `Hello ${patientName}, your ${therapy} therapy has been scheduled by Dr. ${practitionerName} starting ${startDate} at ${time} for ${duration} days. Check your Panchakarma dashboard for details.`);

  // 4. Toast
  showToast(`Session scheduled: ${therapy} for ${patientName}`, 'success');
}

/**
 * Notify when a session is cancelled
 */
async function notifySessionCancelled({ cancelledBy, recipientName, recipientEmail, recipientPhone, therapy, startDate, time, cancellerName }) {
  // 1. Email to recipient (automatic)
  await sendEmail(
    recipientName,
    recipientEmail,
    `Session Cancelled — ${therapy}`,
    `Hello ${recipientName},\n\n${cancellerName} has cancelled the ${therapy} therapy session that was scheduled for ${startDate} at ${time}.\n\nPlease log in to your Panchakarma dashboard for more details.\n\nBest regards,\nPanchakarma Clinic`
  );

  // 2. WhatsApp to recipient
  sendWhatsApp(recipientPhone, `Hello ${recipientName}, the ${therapy} session scheduled for ${startDate} at ${time} has been cancelled by ${cancellerName}. Please check your Panchakarma dashboard.`);

  // 3. Toast
  showToast(`Session cancelled: ${therapy} on ${startDate}`, 'warning');
}

/**
 * Notify when a session is marked as completed
 */
async function notifySessionCompleted({ patientName, patientEmail, patientPhone, practitionerName, therapy }) {
  // 1. Email to patient (automatic)
  await sendEmail(
    patientName,
    patientEmail,
    `Session Completed — ${therapy} ✅`,
    `Hello ${patientName},\n\nGreat news! Your ${therapy} therapy session has been marked as completed by ${practitionerName}.\n\nKeep up the great progress on your wellness journey! Log in to your dashboard to see your updated recovery stats.\n\nBest regards,\nPanchakarma Clinic`
  );

  // 2. WhatsApp to patient
  sendWhatsApp(patientPhone, `Hello ${patientName}, your ${therapy} session has been marked as completed by Dr. ${practitionerName}. Great progress! Check your dashboard for recovery stats.`);

  // 3. Toast
  showToast(`Session completed: ${therapy} for ${patientName}`, 'success');
}

// ============ EXPORT FOR USE ============
// Make available globally since both dashboards use inline scripts
window.PKNotify = {
  sendEmail,
  sendWhatsApp,
  showToast,
  notifyBookingRequest,
  notifySessionScheduled,
  notifySessionCancelled,
  notifySessionCompleted,
  isEmailConfigured,
};
