import nodemailer from 'nodemailer'

export function getMailer() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export function mailFrom() {
  const user = process.env.SMTP_USER || 'info@fearinsight.com'
  return `"Fear Insight" <${user}>`
}
