import { getMailer, mailFrom } from '@/lib/mailer'

export async function sendVerificationEmail(to: string, confirmUrl: string) {
  const transporter = getMailer()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your Fear Insight account</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#0c0a09;padding:24px 32px;color:#fafaf9;font-size:22px;font-weight:800;letter-spacing:1px;">
              FEAR INSIGHT
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 12px;color:#1c1917;font-size:24px;">Confirm your email</h1>
              <p style="margin:0 0 28px;color:#57534e;font-size:15px;line-height:1.6;">
                Tap the button below to verify your account and start saving pieces to your wishlist.
              </p>
              <a href="${confirmUrl}" style="display:inline-block;background:#0c0a09;color:#ffffff;text-decoration:none;padding:14px 22px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                Verify email
              </a>
              <p style="margin:28px 0 0;color:#78716c;font-size:12px;line-height:1.6;">
                If you did not create this account, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  await transporter.sendMail({
    from: mailFrom(),
    replyTo: process.env.SMTP_USER || 'info@fearinsight.com',
    to,
    subject: 'Confirm your Fear Insight account',
    html,
  })
}
