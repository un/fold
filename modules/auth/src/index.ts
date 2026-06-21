export interface AuthSession {
  userId: string
}

export const auth = {
  async getSession(): Promise<AuthSession | null> {
    return null
  },
}
