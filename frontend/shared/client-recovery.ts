/** Keep server-rendered content readable if a locale chunk cannot be downloaded. */
export function withClientRecovery(start: () => Promise<unknown>, locale: string) {
  const words = {
    en: ['Interactive controls could not load. Please try again.', 'Try again'],
    de: ['Die Bedienelemente konnten nicht geladen werden. Bitte versuchen Sie es erneut.', 'Erneut versuchen'],
    fr: ['Les commandes n’ont pas pu être chargées. Veuillez réessayer.', 'Réessayer'],
    es: ['No se pudieron cargar los controles. Inténtalo de nuevo.', 'Reintentar'],
    it: ['Impossibile caricare i controlli. Riprova.', 'Riprova'],
    nl: ['De bediening kon niet worden geladen. Probeer het opnieuw.', 'Opnieuw proberen'],
  }[locale] ?? ['Interactive controls could not load. Please try again.', 'Try again'];
  const run = () => start().catch(error => {
    console.error('Client initialization failed', error);
    if (document.getElementById('fv-client-recovery')) return;
    const notice = document.createElement('div');
    notice.id = 'fv-client-recovery';
    notice.className = 'fv-client-recovery';
    notice.setAttribute('role', 'alert');
    const message = document.createElement('p');
    message.textContent = words[0];
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = words[1];
    retry.addEventListener('click', () => location.reload());
    notice.append(message, retry);
    document.getElementById('root')?.before(notice);
  });
  void run();
}
