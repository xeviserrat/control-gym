export const invitationPath = "/invite";
const referencePattern = /^[a-f0-9]{24}$/;

export function invitationDestination(reference: unknown) {
  return typeof reference === "string" && referencePattern.test(reference)
    ? `${invitationPath}?ref=${reference}`
    : null;
}

export function invitationAuthHref(path: "/login" | "/register", reference: unknown) {
  return invitationDestination(reference) ? `${path}?invite=${reference}` : path;
}

export function invitationCookieName(reference: string) {
  return `cg-invite-${reference}`;
}
