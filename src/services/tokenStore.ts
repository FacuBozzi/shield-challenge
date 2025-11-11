class TokenStore {
  private revoked = new Map<string, number>();

  revoke(token: string, exp: number) {
    this.revoked.set(token, exp);
  }

  isRevoked(token: string) {
    this.removeExpired();
    return this.revoked.has(token);
  }

  private removeExpired() {
    const now = Math.floor(Date.now() / 1000);
    for (const [token, exp] of this.revoked.entries()) {
      if (exp <= now) {
        this.revoked.delete(token);
      }
    }
  }
}

export const tokenStore = new TokenStore();
