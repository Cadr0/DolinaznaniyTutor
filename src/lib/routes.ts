export function localePath(locale: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return locale === "ru" ? normalizedPath : `/${locale}${normalizedPath}`;
}
