export interface EmailMessage {
  to: string
  subject: string
  text: string
}

export async function sendEmail(_message: EmailMessage) {
  return { sent: false, provider: 'noop' as const }
}
