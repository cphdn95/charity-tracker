// Server-side passcode check for the destructive developer actions
// (edit / delete / clear). The passcode lives in the ADMIN_CODE environment
// variable — never in the source — so it stays secret even though the repo is
// public. If ADMIN_CODE isn't set, these actions stay open (e.g. local dev).
export function checkAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_CODE;
  if (!expected) return true;
  return request.headers.get("x-admin-code") === expected;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_CODE);
}
