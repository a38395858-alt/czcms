      /* Keep the browser-rendered localized homepages aligned with the approved copy documents. */
      (function () {
        var lang = document.documentElement.lang.slice(0, 2);
        var text = function (selector, value) { var node = document.querySelector(selector); if (node) node.textContent = value; };
        var all = function (selector, values) { document.querySelectorAll(selector).forEach(function (node, index) { if (values[index] !== undefined) node.textContent = values[index]; }); };
        if (lang === 'fr') {
          text('#solutions .fv-fr-section-head h2', 'Des savoir-faire qui se complètent.');
          text('#solutions .fv-fr-section-head > p', 'Une bonne livraison est une suite de petites décisions bien prises. Nous les rassemblons pour que votre équipe puisse avancer sereinement.');
          all('#solutions .fv-fr-service-panels article h3', ['Partir du bon produit.', 'Donner du rythme au volume.', 'Protéger une échéance importante.', 'Préparer les documents avant le départ.', 'Contrôler avant de remettre en mouvement.', 'Faire arriver votre marque avec le produit.']);
          all('#solutions .fv-fr-service-panels article .fv-fr-panel-copy > div > p', ['Envoyez un lien, une photo ou une fiche. Notre équipe peut rechercher des fournisseurs adaptés en Chine, comparer les options et préparer les questions d’échantillonnage ou d’achat.', 'Pour le groupage ou le conteneur, nous alignons disponibilité, préparation, informations d’expédition et relais jusqu’à la destination prévue.', 'Pour une relance, un lancement ou une commande urgente, nous étudions un chemin aérien cohérent avec le produit et les documents disponibles.', 'Facture, colisage et données produit sont rassemblés au même endroit. La classification et le dédouanement restent soumis à votre courtier et aux autorités compétentes.', 'Réception, contrôle, regroupement, emballage et expédition peuvent suivre une seule consigne. Les commandes multi-articles et les colis neutres sont traités selon le brief approuvé.', 'Cartes, stickers, étiquettes, sacs ou boîtes personnalisés sont préparés après validation du visuel, de la quantité et de la séquence de production.']);
          text('#operation h2', 'La maîtrise se voit dans les transitions.');
          all('#operation ol li h3', ['Un fil de conversation', 'Un contrôle avant départ', 'Une information lisible', 'Une alerte utile']);
          all('#operation ol li p', ['Les questions fournisseur et les décisions de transport restent rattachées au même dossier.', 'État, quantité et présentation sont revus avant le prochain relais.', 'Le statut explique ce qui est fait, ce qui manque et qui agit.', 'Lorsqu’un point change, votre équipe le voit assez tôt pour choisir.']);
          text('#methode h2', 'De la première question à la bonne réception.');
          all('#methode ol li h3', ['Comprendre', 'Proposer', 'Coordonner', 'Accompagner']);
          all('#methode ol li p', ['Produit, volume, origine, destination, date cible et contraintes.', 'Chemin de service, documents à réunir, responsabilités et questions ouvertes.', 'Fournisseur, contrôle, emballage, transport, stockage et remise au dernier relais.', 'Tracking et notes d’exception pour préparer la suite avec vos clients ou vos équipes.']);
          text('#secteurs h2', 'Une attention adaptée à chaque activité.');
          all('#secteurs ul li p', ['Réassorts, bundles et expérience colis cohérente.', 'Qualité, présentation et informations produit alignées.', 'Spécifications, documents et réception maîtrisés.', 'Décision rapide, scénario lisible et risques explicités.']);
          text('#guides h2', 'Des ressources pour décider avec justesse.');
          text('#guides .fv-fr-resources-head > div > p:last-child', 'Guides pratiques sur l’import, les Incoterms, le brief fournisseur, la différence entre maritime et aérien, et les contrôles à prévoir avant expédition.');
          text('#demande h2', 'Votre prochaine expédition mérite mieux qu’une suite d’e-mails. Parlons-en et construisons un plan lisible.');
        } else if (lang === 'es') {
          all('#soluciones .fv-es-service-panels article h3', ['Encuentra una opción viable.', 'Mueve volumen con un plan.', 'Cuando la fecha importa.', 'Menos sorpresas en el siguiente control.', 'Recibir, revisar y preparar.', 'Que el paquete también hable de tu marca.']);
          all('#soluciones .fv-es-service-panels article .fv-es-panel-copy > div > p', ['Comparte un enlace, una foto o una ficha. Ayudamos a buscar proveedores en China, comparar alternativas y preparar muestras o preguntas de compra.', 'Alineamos disponibilidad de la mercancía, preparación, datos de bultos, salida y entrega para carga consolidada o contenedor, según el caso.', 'Para reposiciones, lanzamientos o pedidos urgentes, revisamos una alternativa aérea práctica y los datos que deben acompañarla.', 'Organizamos factura, packing list y datos del producto antes de la salida. La clasificación y el despacho dependen del agente y de las autoridades correspondientes.', 'Gestiona recepción, control, consolidación y preparación de pedidos con una instrucción única. Podemos mantener paquetes neutros y pedidos con varios artículos según el brief.', 'Coordina tarjetas, pegatinas, etiquetas, bolsas o cajas personalizadas tras aprobar diseño, cantidad y orden de producción.']);
          text('#guias h2', 'Información para tomar mejores decisiones.');
          text('#guias .fv-es-resources-head > div > p:last-child', 'Guías prácticas sobre importación, Incoterms, brief de proveedores, transporte marítimo frente a aéreo y control de embalaje.');
          text('#solicitud h2', 'Dinos qué necesitas mover. Convertimos cada paso en una ruta que puedas seguir.');
        } else if (lang === 'it') {
          text('#fv-it-hero-title', 'Una filiera che lavora bene, dall’origine alla consegna.');
          text('.fv-it-hero-lead', 'FreightVanta unisce ricerca prodotto, acquisto, controllo, preparazione, trasporto, magazzino e consegna in un percorso leggibile. Il tuo team sa cosa è stato fatto, cosa manca e quale decisione viene dopo.');
          text('.fv-it-hero-note', 'Raccontaci il prodotto, il punto di partenza e la destinazione. Costruiamo il primo passaggio insieme.');
          text('#servizi .fv-it-section-head h2', 'Una catena pensata con cura.');
          text('#servizi .fv-it-section-head > p', 'Una consegna ben fatta nasce prima della partenza. Mettiamo in ordine le informazioni che servono a ogni passaggio.');
          all('#servizi .fv-it-service-panels article h3', ['Iniziare dal prodotto giusto.', 'Dare struttura al volume.', 'Proteggere un momento importante.', 'Preparare prima di spedire.', 'Ricevere, controllare, preparare.', 'Portare la tua identità nel pacco.']);
          all('#servizi .fv-it-service-panels article > p', ['Invia link, foto o specifiche. Possiamo cercare fornitori in Cina, confrontare alternative e preparare campioni o domande d’acquisto.', 'Per groupage o container coordiniamo disponibilità, preparazione, dati di imballo, partenza e consegna prevista.', 'Per lanci, riassortimenti o urgenze valutiamo un percorso aereo coerente con prodotto, documenti e priorità.', 'Fattura, packing list e informazioni prodotto restano raccolte in modo ordinato. Classificazione e sdoganamento dipendono dal broker e dalle autorità competenti.', 'Ricezione, verifica, consolidamento, imballo e invio seguono una stessa istruzione approvata. Gli ordini con più articoli e i pacchi neutri rientrano nel brief.', 'Cartoline, adesivi, etichette, buste o scatole personalizzate vengono gestiti dopo l’approvazione di grafica, quantità e sequenza produttiva.']);
          text('#operazione h2', 'La qualità si riconosce nei dettagli.');
          all('#operazione ol li h3', ['Un riferimento personale', 'Controllo prima del movimento', 'Ordine nelle informazioni', 'Eccezioni raccontate bene']);
          all('#operazione ol li p', ['Domande, risposte dei fornitori e note di spedizione non si disperdono.', 'Stato, quantità e presentazione vengono verificati prima del passaggio successivo.', 'Ogni aggiornamento dice cosa è pronto e cosa va deciso.', 'Una variazione diventa una scelta, non una sorpresa.']);
          text('#metodo h2', 'Quattro gesti, un flusso continuo.');
          all('#metodo ol li h3', ['Capire la merce', 'Costruire il piano', 'Coordinare i passaggi', 'Restare aggiornati']);
          all('#metodo ol li p', ['Prodotto, quantità, origine, destinazione, data e vincoli.', 'Percorso, documenti, responsabilità e domande aperte.', 'Fornitore, controllo, packaging, trasporto, magazzino e ultimo miglio.', 'Tracking e note di eccezione per organizzare clienti e stock.']);
          text('#settori h2', 'Ritmi diversi, stessa cura.');
          all('#settori ul li p', ['Riassortimenti, bundle e presentazione coerente.', 'Qualità, packaging e consegna come parte della marca.', 'Specifiche, documenti e ricezione controllata.', 'Priorità chiara e scenario realistico.']);
          text('#guide h2', 'Conoscenze per muoversi meglio.');
          text('#guide .fv-it-resources-head > div > p:last-child', 'Guide pratiche su importazione, Incoterms, brief ai fornitori, scelta tra mare e aereo e controllo dell’imballo.');
          text('#richiesta h2', 'La tua prossima spedizione merita un flusso comprensibile.');
        }
      }());
