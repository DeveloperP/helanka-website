const WRAPPER_START = `<div style="max-width:520px;margin:0 auto;font-family:sans-serif;color:#1e293b;">`;
const WRAPPER_END = `
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
  <p style="color:#94a3b8;font-size:12px;">Helanka Vacations &middot; Colombo, Sri Lanka</p>
</div>`;

function cta(href: string, label: string): string {
  return `
    <div style="text-align:center;margin:32px 0;">
      <a href="${href}" style="display:inline-block;background:#1e293b;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;">
        ${label}
      </a>
    </div>`;
}

export function buildGuestConfirmationEmail(
  name: string,
  tripSummary: string,
): string {
  return `${WRAPPER_START}
    <h2>We received your trip request!</h2>
    <p style="color:#475569;">Hi ${name},</p>
    <p style="color:#475569;">
      Thank you for choosing Helanka Vacations. One of our travel specialists is now
      reviewing your request and will put together a personalized quote for you.
    </p>
    <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Your request</p>
      <p style="margin:8px 0 0;color:#334155;font-size:15px;">${tripSummary}</p>
    </div>
    <p style="color:#475569;">
      You should receive your quote within 24 hours. We will email you a link to
      view and respond to the quote when it is ready.
    </p>
    <p style="color:#94a3b8;font-size:14px;">
      If you have any questions in the meantime, reply to this email or reach out
      at <a href="mailto:bookings@helanka.co" style="color:#1e293b;">bookings@helanka.co</a>.
    </p>
  ${WRAPPER_END}`;
}

export function buildQuoteDeliveryEmail(
  customerName: string,
  quoteUrl: string,
  totalPrice: number,
  depositAmount: number,
  validUntil: Date,
  tripSummary: string,
): string {
  const formattedTotal = `$${totalPrice.toLocaleString()}`;
  const formattedDeposit = `$${depositAmount.toLocaleString()}`;
  const formattedExpiry = validUntil.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${WRAPPER_START}
    <h2>Your personalized quote is ready!</h2>
    <p style="color:#475569;">Hi ${customerName},</p>
    <p style="color:#475569;">
      Great news! Your travel specialist has prepared a personalized quote for your trip to Sri Lanka.
    </p>
    <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Trip summary</p>
      <p style="margin:8px 0 0;color:#334155;font-size:15px;">${tripSummary}</p>
    </div>
    <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr>
          <td style="color:#334155;padding:4px 0;">Total price</td>
          <td style="color:#334155;padding:4px 0;text-align:right;font-weight:600;">${formattedTotal}</td>
        </tr>
        <tr>
          <td style="color:#334155;padding:4px 0;">Deposit to confirm</td>
          <td style="color:#334155;padding:4px 0;text-align:right;font-weight:600;">${formattedDeposit}</td>
        </tr>
        <tr>
          <td style="color:#64748b;padding:4px 0;font-size:13px;">Valid until</td>
          <td style="color:#64748b;padding:4px 0;text-align:right;font-size:13px;">${formattedExpiry}</td>
        </tr>
      </table>
    </div>
    ${cta(quoteUrl, "View Your Quote")}
    <p style="color:#475569;font-size:14px;">
      Click the button above to view the full breakdown and accept, request changes, or ask questions.
    </p>
    <p style="color:#94a3b8;font-size:14px;">
      This quote is valid until ${formattedExpiry}. If you need more time, just let us know.
    </p>
  ${WRAPPER_END}`;
}
