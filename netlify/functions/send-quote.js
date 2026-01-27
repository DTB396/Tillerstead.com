/**
 * TillerPro™ Email Delivery System
 * Netlify Function for sending quotes via email
 *
 * @version 1.0.0
 * @requires SendGrid API (npm install @sendgrid/mail)
 */

const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { quoteData, pdfBase64, customerEmail, contractorEmail } = JSON.parse(event.body);

    // Validate inputs
    if (!quoteData || !pdfBase64 || !customerEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Initialize SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('SendGrid API key not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Email service not configured' })
      };
    }

    sgMail.setApiKey(apiKey);

    // Email to customer
    const customerMsg = {
      to: customerEmail,
      from: process.env.FROM_EMAIL || 'quotes@tillerstead.com',
      subject: `Your Professional Quote #${quoteData.quoteNumber} from ${quoteData.createdBy}`,
      html: getCustomerEmailHTML(quoteData),
      text: getCustomerEmailText(quoteData),
      attachments: [
        {
          content: pdfBase64,
          filename: `Quote-${quoteData.quoteNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    // Email to contractor (CC)
    const contractorMsg = contractorEmail ? {
      to: contractorEmail,
      from: process.env.FROM_EMAIL || 'quotes@tillerstead.com',
      subject: `Quote #${quoteData.quoteNumber} sent to ${quoteData.customer.name}`,
      html: getContractorEmailHTML(quoteData),
      text: getContractorEmailText(quoteData),
      attachments: [
        {
          content: pdfBase64,
          filename: `Quote-${quoteData.quoteNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    } : null;

    // Send emails
    await sgMail.send(customerMsg);
    if (contractorMsg) await sgMail.send(contractorMsg);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Quote sent successfully',
        quoteNumber: quoteData.quoteNumber
      })
    };

  } catch (error) {
    console.error('Email send error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        message: error.message
      })
    };
  }
};

/**
 * Customer email HTML template
 */
function getCustomerEmailHTML(quote) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Quote #${quote.quoteNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Your Professional Quote</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Quote #${quote.quoteNumber}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #111827;">Hi ${quote.customer.name},</p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for requesting a quote from ${quote.createdBy}. We've prepared a detailed estimate for your ${quote.project.name} project.
              </p>

              <!-- Quote Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                    <strong style="color: #111827;">Project Summary</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                      <strong style="color: #111827;">Project:</strong> ${quote.project.name}
                    </p>
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                      <strong style="color: #111827;">Area:</strong> ${quote.project.totalArea} sq ft
                    </p>
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                      <strong style="color: #111827;">Estimated Duration:</strong> ${quote.timeline.estimatedDays} days
                    </p>
                    <p style="margin: 0; font-size: 18px; color: #059669;">
                      <strong>Total Investment: $${quote.totals.total.toFixed(2)}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Payment Terms -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef9c3; border-left: 4px solid #fbbf24; border-radius: 4px;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #92400e;">Payment Terms</p>
                <p style="margin: 0; font-size: 14px; color: #78350f;">
                  Deposit Required: <strong>$${quote.totals.deposit.toFixed(2)}</strong> (30%)<br>
                  Balance on Completion: <strong>$${quote.totals.balanceOnCompletion.toFixed(2)}</strong>
                </p>
              </div>

              <!-- Next Steps -->
              <p style="margin: 30px 0 10px; font-size: 16px; font-weight: 600; color: #111827;">Next Steps:</p>
              <ol style="margin: 0 0 20px; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #374151;">
                <li>Review the attached PDF for complete details and legal terms</li>
                <li>Sign and date the acceptance page</li>
                <li>Return the signed quote via email or schedule a call</li>
                <li>Submit the deposit to secure your project date</li>
              </ol>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://tillerstead.com/contact/" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Schedule a Call</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                Questions? Reply to this email or call us at ${quote.createdBy === 'Tillerstead LLC' ? '(856) 555-0100' : 'our office'}.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #6b7280;">
                This quote is valid for 30 days from the date of issuance.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © 2026 ${quote.createdBy}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Customer email plain text version
 */
function getCustomerEmailText(quote) {
  return `
Your Professional Quote #${quote.quoteNumber}

Hi ${quote.customer.name},

Thank you for requesting a quote from ${quote.createdBy}. We've prepared a detailed estimate for your ${quote.project.name} project.

PROJECT SUMMARY
Project: ${quote.project.name}
Area: ${quote.project.totalArea} sq ft
Estimated Duration: ${quote.timeline.estimatedDays} days
Total Investment: $${quote.totals.total.toFixed(2)}

PAYMENT TERMS
Deposit Required: $${quote.totals.deposit.toFixed(2)} (30%)
Balance on Completion: $${quote.totals.balanceOnCompletion.toFixed(2)}

NEXT STEPS
1. Review the attached PDF for complete details and legal terms
2. Sign and date the acceptance page
3. Return the signed quote via email or schedule a call
4. Submit the deposit to secure your project date

Questions? Reply to this email or call us.

This quote is valid for 30 days from the date of issuance.

© 2026 ${quote.createdBy}. All rights reserved.
  `;
}

/**
 * Contractor notification email HTML
 */
function getContractorEmailHTML(quote) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quote #${quote.quoteNumber} Sent</title>
</head>
<body style="margin: 0; padding: 20px; font-family: sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="margin: 0 0 20px; color: #111827;">Quote Sent: #${quote.quoteNumber}</h2>
    
    <p style="margin: 0 0 15px; color: #374151;">Quote successfully sent to <strong>${quote.customer.name}</strong> (${quote.customer.email}).</p>
    
    <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Project:</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600;">${quote.project.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Total:</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #059669; font-weight: 700;">$${quote.totals.total.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Sent:</td>
        <td style="padding: 8px 0; color: #111827;">${new Date().toLocaleString()}</td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0; font-size: 12px; color: #9ca3af;">Follow up with customer within 24-48 hours.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Contractor notification email plain text
 */
function getContractorEmailText(quote) {
  return `
Quote Sent: #${quote.quoteNumber}

Quote successfully sent to ${quote.customer.name} (${quote.customer.email}).

Project: ${quote.project.name}
Total: $${quote.totals.total.toFixed(2)}
Sent: ${new Date().toLocaleString()}

Follow up with customer within 24-48 hours.
  `;
}
