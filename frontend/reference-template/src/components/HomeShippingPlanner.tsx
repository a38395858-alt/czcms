// The CMS supplies the same escaped HTML to prerendering and hydration.
// Form state is owned by the small standalone calculator module.
interface ShippingContext { shippingMarkup?: string; shippingURL?: string; shippingTitle?: string }
function context(): ShippingContext {
  const existing = (globalThis as typeof globalThis & { __FV_HOME__?: ShippingContext }).__FV_HOME__;
  if (existing) return existing;
  if (typeof document === 'undefined') return {};
  const source = document.getElementById('freightvanta-home-context')?.textContent;
  return source ? JSON.parse(source) as ShippingContext : {};
}
export function HomeShippingPlanner() {
  return <div data-shipping-home-slot dangerouslySetInnerHTML={{ __html: context().shippingMarkup ?? '__FV_SHIPPING_PLANNER__' }} />;
}
export function HomeShippingLink() {
  return <a className="sp-home-footer-link" href={context().shippingURL ?? '__FV_SHIPPING_URL__'}>{context().shippingTitle ?? '__FV_SHIPPING_TITLE__'}</a>;
}
