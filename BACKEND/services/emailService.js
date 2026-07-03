const getFrontendUrl = () => process.env.FRONTEND_URL || '';

const buildEmailShell = ({ title, heading, body, ctaLabel, ctaUrl }) => {
  const safeBody = Array.isArray(body) ? body : [body];
  const paragraphs = safeBody.map((line) => `<p style="margin:0 0 12px;line-height:1.7;color:#334155;">${line}</p>`).join('');
  const cta = ctaLabel && ctaUrl
    ? `<p style="margin:28px 0 0;"><a href="${ctaUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;">${ctaLabel}</a></p>`
    : '';

  return `<!doctype html>
  <html>
    <body style="margin:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
        <div style="background:#fff;border-radius:24px;padding:32px;border:1px solid #e2e8f0;box-shadow:0 20px 60px rgba(15,23,42,.08);">
          <p style="margin:0 0 12px;text-transform:uppercase;letter-spacing:.24em;color:#64748b;font-size:12px;">AIMERN</p>
          <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;color:#0f172a;">${heading}</h1>
          ${paragraphs}
          ${cta}
          <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;">If you did not request this email, you can safely ignore it.</p>
        </div>
      </div>
    </body>
  </html>`;
};

const sendViaResend = async ({ to, subject, html, text }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Email provider rejected message: ${response.status} ${details}`);
  }

  return true;
};

const logFallback = ({ to, subject, text }) => {
  console.info('[email-service] Fallback email', { to, subject, text });
};

export const emailService = {
  async send({ to, subject, html, text }) {
    try {
      const sent = await sendViaResend({ to, subject, html, text });
      if (!sent) {
        logFallback({ to, subject, text });
      }
    } catch (error) {
      logFallback({ to, subject, text });
      console.warn('[email-service] provider error:', error.message);
    }
  },

  async sendVerificationEmail({ user, token }) {
    const url = `${getFrontendUrl()}/verify-email/${token}`;
    const subject = 'Verify your AIMERN account';
    const html = buildEmailShell({
      heading: 'Verify your email address',
      body: [
        `Hi ${user.name},`,
        'Thanks for creating an account. Finish setting up your profile by verifying your email address.',
        'This verification link expires soon, so please use it as soon as you can.'
      ],
      ctaLabel: 'Verify email',
      ctaUrl: url
    });
    const text = `Verify your email: ${url}`;
    await this.send({ to: user.email, subject, html, text });
  },

  async sendPasswordResetEmail({ user, token }) {
    const url = `${getFrontendUrl()}/reset-password/${token}`;
    const subject = 'Reset your AIMERN password';
    const html = buildEmailShell({
      heading: 'Reset your password',
      body: [
        `Hi ${user.name},`,
        'We received a request to reset your password. Use the secure link below to choose a new one.',
        'If you did not request a password reset, you can ignore this email.'
      ],
      ctaLabel: 'Reset password',
      ctaUrl: url
    });
    const text = `Reset your password: ${url}`;
    await this.send({ to: user.email, subject, html, text });
  },

  async sendWelcomeEmail({ user }) {
    const subject = 'Welcome to AIMERN';
    const html = buildEmailShell({
      heading: 'Welcome aboard',
      body: [
        `Hi ${user.name},`,
        'Your account is now verified and ready to use.',
        'You can browse products, manage your cart, and continue checkout with your new account.'
      ]
    });
    await this.send({ to: user.email, subject, html, text: 'Welcome to AIMERN' });
  }
};

