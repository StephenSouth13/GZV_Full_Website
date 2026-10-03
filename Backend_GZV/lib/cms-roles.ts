export const CMS_ROLES = ['admin', 'editor', 'collab'] as const

export type CmsRole = (typeof CMS_ROLES)[number]

export function isCmsRole(value: unknown): value is CmsRole {
  return typeof value === 'string' && CMS_ROLES.includes(value as CmsRole)
}
