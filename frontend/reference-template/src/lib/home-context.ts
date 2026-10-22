interface HomeContext { sharedHeader?: boolean; locale: string; languages: Record<string, string>; enquiry?: { locale: string; siteId: number; basePath: string; formToken: string } }
declare global { var __FV_HOME__: HomeContext | undefined; }
export function homeContext(): HomeContext | undefined {
  if (globalThis.__FV_HOME__) return globalThis.__FV_HOME__;
  if (typeof document === 'undefined') return undefined;
  const source = document.getElementById('freightvanta-home-context')?.textContent;
  if (source) globalThis.__FV_HOME__ = JSON.parse(source) as HomeContext;
  return globalThis.__FV_HOME__;
}
