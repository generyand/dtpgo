import nodemailer, { Transporter } from 'nodemailer'

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  replyTo?: string
}

const getEnv = (key: string, required = true): string | undefined => {
  const value = process.env[key]
  if (required && (!value || value.length === 0)) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function createSmtpConfig(): SmtpConfig {
  const host = getEnv('SMTP_HOST') as string
  const port = Number(getEnv('SMTP_PORT') || 587)
  const secure = String(getEnv('SMTP_SECURE') || 'false').toLowerCase() === 'true'
  const user = getEnv('SMTP_USER') as string
  const pass = getEnv('SMTP_PASS') as string
  const from = getEnv('EMAIL_FROM') as string
  const replyTo = getEnv('EMAIL_REPLY_TO', false)

  return { host, port, secure, user, pass, from, replyTo }
}

export function createTransporter(config: SmtpConfig): Transporter {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  return transporter
}

export function getEmailDefaults() {
  const { from, replyTo } = createSmtpConfig()
  return { from, replyTo }
}


