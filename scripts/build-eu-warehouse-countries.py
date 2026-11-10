"""Build country-owned directories from reviewed addresses and public postal data.

Run prepare-eu-warehouse-data.py and import-eu-fba-reference.py first.
The curated German and 3PL references below deliberately omit uncertain entries.
"""
import json, pathlib, unicodedata, re
ROOT=pathlib.Path(__file__).resolve().parents[1]; DATA=ROOT/'frontend/assets/data'; CACHE=ROOT/'.tmp/eu-warehouses'
languages=['de','fr','es','it','nl']
copies={k:{} for k in languages}
def tr(key,*values):
 for lang,value in zip(languages,values):copies[lang][key]=value
tr('name','Deutschland','France','España','Italia','Nederland')
tr('title','Lagerkarte & Lagersuche in Deutschland','Carte et recherche d’entrepôts en France','Mapa y buscador de almacenes en España','Mappa e ricerca magazzini in Italia','Magazijnkaart en magazijnen zoeken in Nederland')
tr('intro','Amazon-FBA-Adressen und Drittanbieter-Lager finden. Bundesland wählen oder Lager in der Nähe einer deutschen Adresse suchen.','Trouvez des adresses Amazon FBA et des entrepôts de prestataires logistiques. Choisissez une région ou recherchez près d’une adresse en France.','Encuentra direcciones de Amazon FBA y almacenes de operadores logísticos. Elige una comunidad o busca cerca de una dirección en España.','Trova indirizzi Amazon FBA e magazzini di operatori logistici. Scegli una regione o cerca vicino a un indirizzo in Italia.','Zoek magazijnen van logistieke dienstverleners per provincie of in de buurt van een Nederlands adres. Deze selectie bevat geen bevestigde FBA-ontvangstlocaties.')
tr('footer','Lager in Deutschland suchen','Rechercher un entrepôt en France','Buscar almacenes en España','Cerca magazzini in Italia','Magazijnen in Nederland zoeken')
tr('seoTitle','FBA-Lager Deutschland: Adressen & Karte | FreightVanta','Entrepôts FBA en France : adresses et carte | FreightVanta','Almacenes FBA en España: direcciones y mapa | FreightVanta','Magazzini FBA Italia: indirizzi e mappa | FreightVanta','Magazijnen Nederland: adressen en kaart | FreightVanta')
tr('seoDescription','FBA-Lager und 3PL-Lager in Deutschland nach Code, Bundesland oder PLZ finden. Lager in der Nähe suchen und ungefähre Luftlinienentfernungen in km vergleichen.','Recherchez des entrepôts FBA et 3PL en France par code, région ou code postal. Consultez les adresses et les distances à vol d’oiseau près d’une adresse.','Busca almacenes FBA en España por código, comunidad o código postal. Consulta direcciones y encuentra almacenes cercanos con distancias en línea recta en km.','Cerca magazzini FBA e operatori logistici in Italia per codice, regione o CAP. Consulta gli indirizzi e le distanze in linea d’aria da un indirizzo italiano.','Zoek logistieke magazijnen in Nederland op provincie, plaats of postcode. Bekijk adressen op de kaart en vergelijk afstanden hemelsbreed vanaf een Nederlands adres.')
tr('seoKeywords','FBA Lager Deutschland, Amazon Lager Adresse, Lager in der Nähe, 3PL Lagerkarte','entrepôt FBA France, adresse Amazon, entrepôt à proximité, carte logistique','almacenes FBA España, dirección Amazon, almacenes cercanos, mapa logístico','magazzini FBA Italia, indirizzo Amazon, magazzini vicini, mappa logistica','magazijn Nederland, magazijn zoeken, logistiek dienstverlener, magazijn in de buurt')
tr('home','Startseite','Accueil','Inicio','Home','Home')
tr('skip','Zum Inhalt springen','Aller au contenu','Ir al contenido','Vai al contenuto principale','Ga naar inhoud')
tr('browse','Nach Bundesland','Par région','Por comunidad','Per regione','Per provincie')
tr('nearby','In der Nähe suchen','À proximité','Buscar cerca','Cerca nelle vicinanze','In de buurt zoeken')
tr('featuredLink','Ausgewählte Lager ansehen','Voir la sélection d’entrepôts','Ver almacenes destacados','Vedi i magazzini selezionati','Bekijk geselecteerde magazijnen')
tr('searchLabel','Lagercode, Bundesland, Stadt oder PLZ','Code entrepôt, région, ville ou code postal','Código de almacén, comunidad, ciudad o código postal','Codice magazzino, regione, città o CAP','Magazijn, provincie, plaats of postcode')
tr('nearbyLabel','Adresse, Stadt oder deutsche PLZ','Adresse, ville ou code postal en France','Dirección, ciudad o código postal de España','Indirizzo, città o CAP in Italia','Nederlands adres, plaats of postcode')
tr('placeholder','Z. B. DUS2, Nordrhein-Westfalen oder 47495','Ex. ORY4, Île-de-France ou 91220','Ej. MAD4, Madrid o 28830','Es. FCO1, Lazio o 02032','Bijv. Roosendaal, Noord-Brabant of 4704 RG')
tr('nearbyPlaceholder','Z. B. Berlin, 47495 oder eine vollständige Adresse','Ex. Paris, 91220 ou une adresse complète','Ej. Madrid, 28830 o una dirección completa','Es. Roma, 02032 o un indirizzo completo','Bijv. Rotterdam, 4704 RG of een volledig adres')
tr('clear','Löschen','Effacer','Borrar','Cancella','Wissen')
tr('search','Lager suchen','Rechercher des entrepôts','Buscar almacenes','Cerca magazzini','Magazijnen zoeken')
tr('radius','Suchradius','Rayon de recherche','Radio de búsqueda','Raggio di ricerca','Zoekradius')
tr('warehouseType','Lagertyp','Type d’entrepôt','Tipo de almacén','Tipo di magazzino','Type magazijn')
tr('all','Alle','Tous','Todos','Tutti','Alle')
tr('allTypes','Alle Lagertypen','Tous les types','Todos los tipos','Tutti i tipi','Alle typen')
tr('threePL','Drittanbieter (3PL)','Prestataires (3PL)','Operadores (3PL)','Operatori (3PL)','Dienstverleners (3PL)')
tr('stateJump','Bundesland wählen','Choisir une région','Elegir comunidad','Scegli una regione','Kies een provincie')
tr('chooseState','Alle Bundesländer','Toutes les régions','Todas las comunidades','Tutte le regioni','Alle provincies')
tr('mapLoading','Karte wird geladen…','Chargement de la carte…','Cargando mapa…','Caricamento della mappa…','Kaart laden…')
tr('mapError','Die Karte ist nicht verfügbar. Die Textsuche funktioniert weiterhin. Seite neu laden, um es erneut zu versuchen.','La carte est indisponible. La recherche et les adresses restent accessibles. Rechargez la page pour réessayer.','El mapa no está disponible. La búsqueda y las direcciones siguen funcionando. Recarga la página para reintentarlo.','La mappa non è disponibile. Ricerca e indirizzi restano accessibili. Ricarica la pagina per riprovare.','De kaart is niet beschikbaar. Zoeken en adressen blijven werken. Laad de pagina opnieuw om het nogmaals te proberen.')
tr('mapCaption','Bundesland anklicken, um Lager zu finden','Cliquez sur une région pour voir les entrepôts','Pulsa una comunidad para ver sus almacenes','Seleziona una regione per vedere i magazzini','Klik op een provincie om magazijnen te bekijken')
tr('mapLabel','Karte der Bundesländer und Lager','Carte des régions et des entrepôts','Mapa de comunidades y almacenes','Mappa delle regioni e dei magazzini','Kaart van provincies en magazijnen')
tr('selected','Ausgewählt','Sélection','Selección','Selezione','Geselecteerd')
tr('directoryCount','Einträge im Verzeichnis','adresses du répertoire','direcciones del directorio','indirizzi nell’elenco','adressen in de gids')
tr('legend','Zahlen zeigen Einträge, keine Gesamtzahl aller Lager','Les chiffres indiquent les adresses de ce répertoire','Los números indican direcciones de este directorio','I numeri indicano gli indirizzi di questo elenco','Getallen tonen adressen in deze gids, niet alle magazijnen')
tr('results','Suchergebnisse','Résultats','Resultados','Risultati','Zoekresultaten')
tr('nearbyResults','Lager in der Nähe','Entrepôts à proximité','Almacenes cercanos','Magazzini nelle vicinanze','Magazijnen in de buurt')
tr('emptyBrowse','Keine Einträge für diese Auswahl. Anderen Ort oder Lagertyp versuchen. Das Verzeichnis ist nicht vollständig.','Aucune adresse pour cette sélection. Essayez une autre région ou un autre type. Ce répertoire est partiel.','No hay direcciones para esta selección. Prueba otra comunidad o tipo. Este directorio es una selección parcial.','Nessun indirizzo per questa selezione. Prova un’altra regione o un altro tipo. L’elenco è parziale.','Geen adressen voor deze selectie. Probeer een andere provincie of een ander type. Deze gids is een selectie.')
tr('emptyNearby','Keine erfassten Lager in diesem Radius. Radius vergrößern oder Filter ändern; das Verzeichnis ist nicht vollständig.','Aucun entrepôt répertorié dans ce rayon. Élargissez le rayon ou modifiez les filtres ; le répertoire est partiel.','No hay almacenes registrados en este radio. Amplía el radio o cambia los filtros; el directorio es parcial.','Nessun magazzino indicizzato in questo raggio. Amplia il raggio o cambia i filtri; l’elenco è parziale.','Geen opgenomen magazijnen binnen deze straal. Vergroot de straal of pas de filters aan; de gids is niet volledig.')
tr('nearbyPrompt','Adresse, Stadt oder PLZ eingeben und Suche starten.','Saisissez une adresse, une ville ou un code postal, puis lancez la recherche.','Introduce una dirección, ciudad o código postal e inicia la búsqueda.','Inserisci un indirizzo, una città o un CAP e avvia la ricerca.','Voer een adres, plaats of postcode in en start de zoekopdracht.')
tr('pendingChoice','Mehrere Orte gefunden. Bitte den passenden Ort wählen.','Plusieurs lieux correspondent. Sélectionnez le lieu souhaité.','Hay varias coincidencias. Elige la ubicación que buscas.','Sono state trovate più località. Scegli quella desiderata.','Meerdere locaties gevonden. Kies de gewenste locatie.')
tr('locationNoMatch','Kein passender Ort in Deutschland. Adresse prüfen oder Stadt bzw. PLZ versuchen.','Aucun lieu correspondant en France. Vérifiez l’adresse ou essayez une ville ou un code postal.','No se ha encontrado una ubicación en España. Revisa la dirección o prueba una ciudad o un código postal.','Nessuna località trovata in Italia. Controlla l’indirizzo o prova una città o un CAP.','Geen passende locatie in Nederland gevonden. Controleer het adres of probeer een plaats of postcode.')
tr('locationError','Adresssuche derzeit nicht verfügbar. Erneut versuchen oder Stadt bzw. PLZ verwenden.','La recherche d’adresse est indisponible. Réessayez ou utilisez une ville ou un code postal.','La búsqueda de direcciones no está disponible. Reinténtalo o usa una ciudad o código postal.','La ricerca indirizzi non è disponibile. Riprova oppure usa una città o un CAP.','Adressen zoeken is tijdelijk niet beschikbaar. Probeer opnieuw of zoek op plaats of postcode.')
tr('invalidQuery','Bitte 2–200 Zeichen für einen Ort oder höchstens 120 Zeichen für die Lagersuche eingeben.','Saisissez 2 à 200 caractères pour un lieu, ou 120 au maximum pour un entrepôt.','Escribe entre 2 y 200 caracteres para una ubicación, o un máximo de 120 para un almacén.','Inserisci da 2 a 200 caratteri per una località, oppure al massimo 120 per un magazzino.','Gebruik 2–200 tekens voor een locatie of maximaal 120 voor een magazijn.')
tr('busy','Die Ortssuche ist ausgelastet. Bitte kurz warten und erneut versuchen.','La recherche de lieux est occupée. Patientez un instant et réessayez.','El buscador está ocupado. Espera un momento y reinténtalo.','La ricerca è occupata. Attendi qualche istante e riprova.','Het zoeken is druk. Wacht even en probeer opnieuw.')
tr('finding','Ort wird gesucht…','Recherche du lieu…','Buscando ubicación…','Ricerca della località…','Locatie zoeken…')
tr('locate','Auf der Karte zeigen','Voir sur la carte','Ver en el mapa','Mostra sulla mappa','Toon op kaart')
tr('copy','Adresse kopieren','Copier l’adresse','Copiar dirección','Copia indirizzo','Adres kopiëren')
tr('copied','Adresse kopiert','Adresse copiée','Dirección copiada','Indirizzo copiato','Adres gekopieerd')
tr('copyManual','Adresse markiert. Bitte manuell kopieren.','Adresse sélectionnée. Copiez-la manuellement.','Dirección seleccionada. Cópiala manualmente.','Indirizzo selezionato. Copialo manualmente.','Adres geselecteerd. Kopieer het handmatig.')
tr('fullAddress','Vollständige Adresse','Adresse complète','Dirección completa','Indirizzo completo','Volledig adres')
tr('source','Quelle','Source','Fuente','Fonte','Bron')
tr('directions','Route öffnen','Ouvrir l’itinéraire','Abrir indicaciones','Apri indicazioni','Route openen')
tr('featuresTitle','Ausgewählte Lageradressen','Sélection d’adresses d’entrepôts','Direcciones de almacenes destacados','Indirizzi di magazzini selezionati','Geselecteerde magazijnadressen')
tr('featuresIntro','Referenzadressen für die Versandplanung nach Deutschland.','Des adresses de référence pour préparer vos expéditions vers la France.','Direcciones de referencia para planificar envíos a España.','Indirizzi di riferimento per pianificare spedizioni verso l’Italia.','Referentieadressen voor het plannen van zendingen naar Nederland.')
tr('allRegions','Alle Regionen','Toutes les régions','Todas las regiones','Tutte le regioni','Alle regio’s')
tr('hubsTitle','Lager nach Region entdecken','Explorer les entrepôts par région','Explorar almacenes por región','Esplora i magazzini per regione','Ontdek magazijnen per regio')
tr('hubsIntro','Regionen mit Adressen in dieser Auswahl.','Régions représentées dans cette sélection.','Regiones con direcciones en esta selección.','Regioni con indirizzi in questa selezione.','Regio’s met adressen in deze selectie.')
tr('planningTitle','Versand nach Deutschland planen','Préparer une expédition vers la France','Planifica tu envío a España','Pianifica una spedizione in Italia','Plan je zending naar Nederland')
tr('planningBody','Referenzkosten und Transportzeiten vergleichen, anschließend Details mit unserem Team abstimmen.','Comparez les coûts et les délais indicatifs, puis confirmez les détails avec notre équipe.','Compara costes y plazos orientativos y confirma los detalles con nuestro equipo.','Confronta costi e tempi indicativi, poi conferma i dettagli con il nostro team.','Vergelijk indicatieve kosten en vervoerstijden en stem de details af met ons team.')
tr('planningCTA','Kosten & Transportzeit prüfen','Consulter coûts et délais','Consultar costes y plazos','Consulta costi e tempi','Bekijk kosten en vervoerstijd')
tr('dataTitle','Abdeckung, Koordinaten und Quellen','Couverture, coordonnées et sources','Cobertura, coordenadas y fuentes','Copertura, coordinate e fonti','Dekking, coördinaten en bronnen')
tr('coverageNote','Unabhängige Auswahl öffentlich gelisteter Adressen, kein vollständiges oder aktuelles Amazon-Register. Eine Nennung belegt weder Partnerschaft noch freie Kapazität.','Sélection indépendante d’adresses publiques ; ce n’est pas un registre Amazon complet ou actualisé. Une présence dans l’annuaire ne prouve ni partenariat ni disponibilité.','Selección independiente de direcciones públicas; no es un registro completo ni actualizado de Amazon. La inclusión no acredita colaboración ni disponibilidad.','Selezione indipendente di indirizzi pubblici, non un registro Amazon completo o aggiornato. L’inclusione non indica collaborazione né disponibilità.','Onafhankelijke selectie van openbare adressen, geen volledig of actueel Amazon-register. Vermelding betekent geen samenwerking of beschikbare capaciteit. Deze Nederlandse selectie bevat uitsluitend 3PL-locaties; er zijn geen FBA-ontvangstlocaties bevestigd.')
tr('geometryNote','Grenzen: geoBoundaries / nationale Geodatenanbieter. Länderkarte einschließlich Inseln; Frankreich nur europäisches Festland und Korsika.','Limites : geoBoundaries et organismes nationaux. La carte de France couvre la métropole et la Corse, sans les territoires ultramarins.','Límites: geoBoundaries y organismos nacionales. Incluye las islas Canarias y Baleares, Ceuta y Melilla.','Confini: geoBoundaries e istituti nazionali. La mappa comprende tutte le 20 regioni, Sicilia e Sardegna incluse.','Grenzen: geoBoundaries en nationale bronhouders. De kaart toont de 12 provincies van Europees Nederland.')
tr('locationNote','Lagerpunkte sind ungefähre PLZ- oder Ortsmittelpunkte (GeoNames, CC BY 4.0), keine Einfahrten. Entfernung als Luftlinie in km, keine Fahrstrecke oder Lieferzeit.','Les points sont des centres approximatifs de codes postaux ou de villes (GeoNames, CC BY 4.0), pas des entrées de bâtiments. Distances à vol d’oiseau en km, sans durée de trajet.','Los puntos son centros aproximados de códigos postales o ciudades (GeoNames, CC BY 4.0), no accesos a edificios. Distancias en línea recta en km, no por carretera ni tiempos de entrega.','I punti sono centri approssimativi di aree postali o città (GeoNames, CC BY 4.0), non ingressi dei magazzini. Distanze in linea d’aria in km, non stradali né tempi di consegna.','Punten zijn benaderde postcode- of plaatscentra (GeoNames, CC BY 4.0), geen ingangen. Afstanden zijn hemelsbreed in km, geen rijafstanden of levertijden. Nederlandse postcodepunten gebruiken het gebied met vier cijfers.')
tr('providerNote','Straßenadresssuche: OpenStreetMap / Nominatim. Eingegebene Straßenadressen werden zur Ortssuche an diesen Dienst gesendet.','Recherche d’adresses : OpenStreetMap / Nominatim. Les adresses saisies sont transmises à ce service pour être localisées.','Búsqueda de direcciones: OpenStreetMap / Nominatim. Las direcciones introducidas se envían a este servicio para localizarlas.','Ricerca indirizzi: OpenStreetMap / Nominatim. Gli indirizzi inseriti vengono inviati a questo servizio per la localizzazione.','Adressen zoeken: OpenStreetMap / Nominatim. Ingevoerde straatadressen worden naar deze dienst gestuurd om ze te lokaliseren.')
tr('dispatchNote','Vor Versand die Empfängeradresse und Terminannahme im Amazon-Versandplan bzw. beim Betreiber bestätigen.','Avant tout envoi, confirmez l’adresse de réception et le rendez-vous dans le plan d’expédition Amazon ou auprès de l’opérateur.','Antes de enviar, confirma la dirección de recepción y la cita en el plan de envío de Amazon o con el operador.','Prima di spedire, conferma indirizzo di ricezione e appuntamento nel piano spedizioni Amazon o con l’operatore.','Bevestig vóór verzending het ontvangstadres en de afspraak in het Amazon-verzendplan of bij de dienstverlener.')
tr('nearbyHint','Adresse oder PLZ suchen. Ein eindeutiger Treffer zeigt nahe Lager sofort; bei mehreren Treffern bitte einen Ort wählen.','Recherchez une adresse ou un code postal. Un résultat unique affiche directement les entrepôts proches ; choisissez un lieu si plusieurs correspondent.','Busca una dirección o código postal. Una coincidencia única muestra los almacenes cercanos; elige una ubicación si hay varias.','Cerca un indirizzo o CAP. Un risultato unico mostra subito i magazzini vicini; scegli la località se ci sono più corrispondenze.','Zoek een adres of postcode. Eén passende locatie toont direct magazijnen in de buurt; kies een locatie als er meerdere zijn.')
tr('browseHint','Bundesland auf der Karte anklicken oder einen Lagercode eingeben. Empfangsadresse vor Versand bestätigen.','Cliquez sur une région ou saisissez un code entrepôt. Confirmez l’adresse de réception avant l’expédition.','Pulsa una comunidad o escribe un código de almacén. Confirma la dirección de recepción antes del envío.','Seleziona una regione o inserisci un codice magazzino. Conferma l’indirizzo di ricezione prima della spedizione.','Klik op een provincie of zoek een magazijn. Bevestig het ontvangstadres vóór verzending.')
tr('reset','Ansicht zurücksetzen','Réinitialiser','Restablecer vista','Ripristina vista','Weergave herstellen')
tr('straightLine','Luftlinie','À vol d’oiseau','En línea recta','In linea d’aria','Hemelsbreed')
tr('postalPrecision','Ungefährer PLZ-Mittelpunkt','Centre postal approximatif','Centro postal aproximado','Centro postale approssimativo','Benaderd postcodecentrum')
tr('cityPrecision','Ungefährer Ortsmittelpunkt','Centre-ville approximatif','Centro urbano aproximado','Centro città approssimativo','Benaderd plaatscentrum')
tr('osmPrecision','OSM-Referenzpunkt, bitte prüfen','Point de référence OSM à vérifier','Punto de referencia OSM, por verificar','Punto di riferimento OSM da verificare','OSM-referentiepunt, controleer de locatie')
tr('unknownPrecision','Keine geprüfte Position','Position non vérifiée','Posición sin verificar','Posizione non verificata','Locatie niet geverifieerd')
tr('mapReturn','Zur Landeskarte','Retour à la carte du pays','Volver al mapa del país','Torna alla mappa nazionale','Terug naar landkaart')
tr('zoomIn','Vergrößern','Zoom avant','Acercar','Ingrandisci','Inzoomen')
tr('zoomOut','Verkleinern','Zoom arrière','Alejar','Riduci','Uitzoomen')
tr('resultFoot','Lager wählen, um den ungefähren Referenzpunkt zu markieren.','Sélectionnez un entrepôt pour afficher son point de référence approximatif.','Elige un almacén para marcar su punto aproximado de referencia.','Seleziona un magazzino per evidenziare il punto di riferimento approssimativo.','Kies een magazijn om het benaderde referentiepunt te markeren.')
tr('nearbyFoot','Ungefähre Luftlinie; keine Fahrstrecke oder Lieferzeit.','Distance approximative à vol d’oiseau, sans itinéraire ni délai.','Distancia aproximada en línea recta, sin ruta ni plazo de entrega.','Distanza approssimativa in linea d’aria, non stradale né tempo di consegna.','Benaderde afstand hemelsbreed; geen rijafstand of levertijd.')
tr('noscript','Karte und Umkreissuche benötigen JavaScript. Die Textsuche oben funktioniert auch ohne JavaScript.','La carte et la recherche à proximité nécessitent JavaScript. La recherche textuelle ci-dessus reste disponible sans JavaScript.','El mapa y la búsqueda cercana requieren JavaScript. La búsqueda de texto funciona sin JavaScript.','Mappa e ricerca nelle vicinanze richiedono JavaScript. La ricerca testuale funziona anche senza JavaScript.','De kaart en zoeken in de buurt vereisen JavaScript. Zoeken op tekst werkt ook zonder JavaScript.')
tr('dataError','Lagerdaten konnten nicht geladen werden. Bitte Seite neu laden.','Impossible de charger les entrepôts. Rechargez la page.','No se han podido cargar los almacenes. Recarga la página.','Impossibile caricare i magazzini. Ricarica la pagina.','Magazijngegevens konden niet worden geladen. Laad de pagina opnieuw.')

def load(name):return json.loads((DATA/name).read_text(encoding='utf8'))
codes={
'de':dict(zip(['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'],'BW BY BE BB HB HH HE MV NI NW RP SL SN ST SH TH'.split())),
'fr':dict(zip(['Île-de-France','Centre-Val de Loire','Bourgogne-Franche-Comté','Normandie','Hauts-de-France','Grand Est','Pays de la Loire','Bretagne','Nouvelle-Aquitaine','Occitanie','Auvergne-Rhône-Alpes',"Provence-Alpes-Côte d'Azur",'Corse'],'IDF CVL BFC NOR HDF GES PDL BRE NAQ OCC ARA PAC COR'.split())),
'es':dict(zip(['Canarias','Ciudad Autónoma de Melilla','Ciudad Autónoma de Ceuta','La Rioja','País Vasco/Euskadi','Comunidad Foral de Navarra','Región de Murcia','Comunidad de Madrid','Galicia','Extremadura','Comunitat Valenciana','Cataluña/Catalunya','Castilla-La Mancha','Castilla y León','Cantabria','Illes Balears','Principado de Asturias','Aragón','Andalucía'],'CN ML CE RI PV NC MC MD GA EX VC CT CM CL CB IB AS AR AN'.split())),
'it':dict(zip(['Piemonte',"Valle d'Aosta",'Lombardia','Trentino-Alto Adige','Veneto','Friuli Venezia Giulia','Liguria','Emilia-Romagna','Toscana','Umbria','Marche','Lazio','Abruzzo','Molise','Campania','Puglia','Basilicata','Calabria','Sicilia','Sardegna'],'21 23 25 32 34 36 42 45 52 55 57 62 65 67 72 75 77 78 82 88'.split())),
'nl':dict(zip(['Groningen','Drenthe','Utrecht','Flevoland','Overijssel','Noord-Holland','Gelderland','Zuid-Holland','Fryslân','Noord-Brabant','Limburg','Zeeland'],'GR DR UT FL OV NH GE ZH FR NB LI ZE'.split()))}
country={lang:{'Country':lang.upper(),'Language':lang,'Name':copies[lang]['name'],'Copy':copies[lang],'DefaultState':{'de':'Nordrhein-Westfalen','fr':'Île-de-France','es':'Comunidad de Madrid','it':'Lazio','nl':'Noord-Brabant'}[lang], 'MapURL':f'/assets/data/warehouse-regions.{lang}.geojson','States':[{'code':v,'name':k,'region':k} for k,v in codes[lang].items()],'Warehouses':[],'FeaturedCodes':[],'Sources':[]} for lang in languages}
postal={lang:load(f'warehouse-locations.{lang}.json')['places'] for lang in languages}
def normalized(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if unicodedata.category(c)!='Mn')
def add(lang,code,street,city,zip_,region,source,type_='fba',name=None):
 rows=postal[lang]; key=zip_[:4] if lang=='nl' else zip_
 candidates=[p for p in rows if p['zip']==key]
 precision='zip-centroid'
 city_candidates=[p for p in candidates if normalized(city).replace('-',' ') in normalized(p['city']).replace('-',' ') or normalized(p['city']).replace('-',' ') in normalized(city).replace('-',' ')]
 if city_candidates:candidates=city_candidates
 if not candidates:
  candidates=[p for p in rows if normalized(city).replace('-',' ') in normalized(p['city']).replace('-',' ')];precision='city-centroid'
 assert candidates,(lang,code,city,zip_)
 lat=sum(p['lat'] for p in candidates)/len(candidates);lng=sum(p['lng'] for p in candidates)/len(candidates)
 row={'code':code,'name':name or code,'type':type_,'address':street,'city':city,'zip':zip_,'country':lang.upper(),'state':codes[lang][region],'stateName':region,'region':region,'sourceURL':source,'lat':round(lat,6),'lng':round(lng,6),'coordinatePrecision':precision,'coordinateSourceURL':'https://www.geonames.org/'}
 country[lang]['Warehouses'].append(row)

source='https://www.amzprep.com/amazon-warehouse-locations/germany'
# STR1's directory street/postcode conflict with the mapped warehouse and is
# excluded pending a reliable physical receiving-address reference. LEJ1 was
# corrected against the individually identified OSM facility, not a ZIP guess.
for row in [('DUS2','Amazonstraße 1','Rheinberg','47495','Nordrhein-Westfalen'),('FRA3','Amazonstraße 1','Bad Hersfeld','36251','Hessen'),('MUC3','Amazonstraße 1','Graben','86836','Bayern'),('LEJ1','Amazonstraße 1','Leipzig','04347','Sachsen')]:add('de',*row,'https://www.openstreetmap.org/way/112590309' if row[0]=='LEJ1' else source)
parsed=json.loads((CACHE/'fba-parsed.json').read_text(encoding='utf8'))
regions={'ORY1':'Centre-Val de Loire','ORY4':'Île-de-France','LIL1':'Hauts-de-France','LYS1':'Bourgogne-Franche-Comté','ETZ2':'Grand Est','MRS1':'Auvergne-Rhône-Alpes','BCN1':'Cataluña/Catalunya','BCN2':'Cataluña/Catalunya','MAD4':'Comunidad de Madrid','MAD6':'Castilla-La Mancha','MAD7':'Castilla-La Mancha','MAD9':'Comunidad de Madrid','SVQ1':'Andalucía','RMU1':'Región de Murcia','ZAZ1':'Aragón','VLC1':'Comunitat Valenciana','MXP3':'Piemonte','MXP5':'Emilia-Romagna','MXP6':'Piemonte','BGY1':'Lombardia','BLQ1':'Veneto','FCO1':'Lazio','FCO2':'Lazio','PSR2':'Abruzzo','TRN1':'Piemonte','TRN3':'Piemonte'}
for row in parsed:
 if row.get('code') not in regions:continue # CEDEX references BVA1/CDG7 await physical address review.
 lang={'france':'fr','spain':'es','italy':'it'}[row['countryName']]
 # Exclude partial road references; do not turn incomplete directory entries into receiving addresses.
 if row['code'] in ['MXP6','ZAZ1']:continue
 add(lang,row['code'],row['streetAddress'],row['addressLocality'],row['postalCode'],regions[row['code']],row['sourceURL'])
add('de','3PL-AA-DOR','Hoeschstraße 20','Dorsten','46284','Nordrhein-Westfalen','https://www.activeants.com/de/kontakt/','3pl','Active Ants · Dorsten')
add('fr','3PL-AA-LYO','Avenue Satolas Green','Pusignan','69330','Auvergne-Rhône-Alpes','https://www.activeants.com/fr/contact/','3pl','Active Ants · Lyon')
add('nl','3PL-AA-ROO','Borchwerf 5','Roosendaal','4704 RG','Noord-Brabant','https://www.activeants.com/nl/contact/','3pl','Active Ants · Roosendaal')
monta='https://gomonta.com/en-gb/fulfilment-center/netherlands/'
for code,street,city,zip_,region in [
 ('3PL-MO-BLE','Vaarsloot 1','Bleskensgraaf','2971 VV','Zuid-Holland'),
 ('3PL-MO-BRE','Zoete Inval 4','Breda','4815 HK','Noord-Brabant'),
 ('3PL-MO-DBO','De Vutter 1',"'s-Hertogenbosch",'5221 BD','Noord-Brabant'),
 ('3PL-MO-ENS','Ingenieur Hanlostraat 15','Enschede','7547 RD','Overijssel'),
 ('3PL-MO-GOE','Edisonweg 11','Gorinchem','4207 HE','Zuid-Holland'),
 ('3PL-MO-GOP','Papland 16','Gorinchem','4206 CL','Zuid-Holland'),
 ('3PL-MO-GOW','Weide 30','Gorinchem','4206 CJ','Zuid-Holland'),
 ('3PL-MO-LEL','Zuiveringweg 21','Lelystad','8243 RB','Flevoland'),
 ('3PL-MO-MOL','Polderweg Oost 19','Molenaarsgraaf','2973 AN','Zuid-Holland'),
 ('3PL-MO-NIE','Schoterhoek 2','Nieuwveen','2441 LD','Zuid-Holland'),
 ('3PL-MO-NIT','Schoterhoek 16','Nieuwveen','2441 LD','Zuid-Holland'),
 ('3PL-MO-OOS','Krombraak 4','Oosterhout','4906 CR','Noord-Brabant'),
 ('3PL-MO-OOX','Denariusstraat 15D','Oosterhout','4903 RC','Noord-Brabant'),
 ('3PL-MO-OUD','Watermolen 6','Oud Gastel','4751 VK','Noord-Brabant'),
 ('3PL-MO-OUX','Boekerman 1F','Oud Gastel','4751 XK','Noord-Brabant'),
 ('3PL-MO-WAS','Hooiweg 11','Waspik','5165 NL','Noord-Brabant')]:
 add('nl',code,street,city,zip_,region,monta,'3pl','Monta · '+city+(' XL' if code.endswith(('OOX','OUX')) else ' TWI' if code.endswith('NIT') else ' '+street if city=='Gorinchem' else ''))

for lang,c in country.items():
 c['FeaturedCodes']=[w['code'] for w in c['Warehouses'] if w['type']=='fba'][:6] or [w['code'] for w in c['Warehouses']][:6]
 if lang=='nl':
  c['Sources']=[{'Name':'Active Ants','URL':'https://www.activeants.com/nl/contact/'},{'Name':'Monta','URL':monta}]
  c['FeaturedCodes']=['3PL-AA-ROO','3PL-MO-BRE','3PL-MO-MOL','3PL-MO-LEL','3PL-MO-ENS','3PL-MO-BLE']
 else:
  c['Sources']=[{'Name':'AMZ Prep' if lang=='de' else 'FBA Near Me','URL':source if lang=='de' else 'https://www.fbanearme.com/locations/'+{'fr':'france','es':'spain','it':'italy'}[lang]}]
  if lang in ['de','fr']:c['Sources'].append({'Name':'Active Ants','URL':'https://www.activeants.com/'+lang+('/kontakt/' if lang=='de' else '/contact/')})
  if lang=='de':
   c['Sources'].append({'Name':'© OpenStreetMap-Mitwirkende · ODbL','URL':'https://www.openstreetmap.org/copyright'})
 (DATA/f'warehouse-country.{lang}.json').write_text(json.dumps(c,ensure_ascii=False,indent=2),encoding='utf8')
 print(lang,len(c['Warehouses']),[w['code'] for w in c['Warehouses']])
