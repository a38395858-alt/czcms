/** Shared related-page labels, kept outside the topic registry to avoid circular imports. */
export const DE_RELATED_RAIL: Record<string, { label: string; href: string; note: string }> = {
  'product-sourcing': {
    label: 'Beschaffung aus China',
    href: '/de/product-sourcing',
    note: 'Produkt- und Lieferantenbrief vor der nächsten Einkaufsentscheidung aufbauen.',
  },
  'bulk-procurement': {
    label: 'Großeinkauf',
    href: '/de/services/bulk-procurement',
    note: 'Menge, Bestandszweck und nächste Freigabe vor einem größeren Kauf planen.',
  },
  'packaging-branding': {
    label: 'Verpackung & Branding',
    href: '/de/services/packaging-branding',
    note: 'Freigegebene Verpackungs- und Markenregeln in den physischen Packablauf überführen.',
  },
  'inventory-storage': {
    label: 'Lagerhaltung',
    href: '/de/services/inventory-storage',
    note: 'Wareneingang, Identifikation, Lagerung und Freigabe sichtbar machen.',
  },
  'private-white-label': {
    label: 'Eigenmarke & White Label',
    href: '/de/services/private-white-label',
    note: 'Produkt, Markenversion und Freigabeverantwortung aufeinander abstimmen.',
  },
  'worldwide-fulfillment': {
    label: 'Fulfillment',
    href: '/de/services/worldwide-fulfillment',
    note: 'Bereiten Bestand in kundenfertige Auftragsanweisungen überführen.',
  },
};

export const DE_INDUSTRY_RAIL: Record<string, { label: string; href: string; note: string }> = {
  'cross-border-ecommerce': {
    label: 'Grenzüberschreitender E-Commerce',
    href: '/de/industries/cross-border-ecommerce',
    note: 'Produkt-, Pack- und Freigabekontext über Kanäle hinweg verbinden.',
  },
  'consumer-goods': {
    label: 'Konsumgüter',
    href: '/de/industries/consumer-goods',
    note: 'Produktversion, Verpackung und Kanalfreigabe abstimmen.',
  },
  'industrial-components': {
    label: 'Industriekomponenten',
    href: '/de/industries/industrial-components',
    note: 'Spezifikation, Schutz und Empfang kontrolliert übergeben.',
  },
  'time-critical-cargo': {
    label: 'Zeitkritische Fracht',
    href: '/de/industries/time-critical-cargo',
    note: 'Bereitstellung, Route und Eskalation als Entscheidungsset prüfen.',
  },
};