export type Language = 'en' | 'es' | 'fr' | 'hi';

export interface TranslationDictionary {
  appName: string;
  overview: string;
  kioskDispenser: string;
  counterStation: string;
  liveTvDisplay: string;
  ticketTracker: string;
  appointments: string;
  adminControl: string;
  signIn: string;
  register: string;
  signOut: string;
  welcomeBack: string;
  status: string;
  kioskTitle: string;
  kioskDesc: string;
  selectDept: string;
  selectPriority: string;
  issueTicket: string;
  nowCalling: string;
  proceedTo: string;
  estWait: string;
  peopleAhead: string;
  callNext: string;
  markComplete: string;
  trackTitle: string;
  guestNotSignedIn: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'QueueSphere',
    overview: 'Overview',
    kioskDispenser: 'Kiosk Dispenser',
    counterStation: 'Counter Station',
    liveTvDisplay: 'Live TV Display',
    ticketTracker: 'Ticket Tracker',
    appointments: 'Appointments',
    adminControl: 'Admin Control',
    signIn: 'Sign In',
    register: 'Register',
    signOut: 'Sign Out',
    welcomeBack: 'Welcome back',
    status: 'Status',
    kioskTitle: 'Self-Service Token Dispenser',
    kioskDesc: 'Select your service department below to receive your instant queue ticket.',
    selectDept: 'Select Service Department',
    selectPriority: 'Select Queue Priority Tier',
    issueTicket: 'ISSUE TICKET NOW',
    nowCalling: 'NOW CALLING TICKET',
    proceedTo: 'Proceed To',
    estWait: 'Est. Wait Time',
    peopleAhead: 'People Ahead',
    callNext: 'CALL NEXT CUSTOMER',
    markComplete: 'Mark Complete',
    trackTitle: 'Live Queue Ticket Tracker',
    guestNotSignedIn: 'Guest (Not Signed In)',
  },
  es: {
    appName: 'QueueSphere',
    overview: 'Resumen',
    kioskDispenser: 'Dispensador Kiosco',
    counterStation: 'Estación de Ventanilla',
    liveTvDisplay: 'Pantalla TV en Vivo',
    ticketTracker: 'Rastreador de Ticket',
    appointments: 'Citas',
    adminControl: 'Control de Admin',
    signIn: 'Iniciar Sesión',
    register: 'Registrarse',
    signOut: 'Cerrar Sesión',
    welcomeBack: 'Bienvenido de nuevo',
    status: 'Estado',
    kioskTitle: 'Dispensador de Turnos Autoservicio',
    kioskDesc: 'Seleccione su departamento para recibir su ticket de turno instantáneo.',
    selectDept: 'Seleccionar Departamento de Servicio',
    selectPriority: 'Nivel de Prioridad de Fila',
    issueTicket: 'EMITIR TICKET AHORA',
    nowCalling: 'LLAMANDO AHORA AL TICKET',
    proceedTo: 'Diríjase a',
    estWait: 'Tiempo de Espera Est.',
    peopleAhead: 'Personas Adelante',
    callNext: 'LLAMAR SIGUIENTE CLIENTE',
    markComplete: 'Marcar Completado',
    trackTitle: 'Rastreador de Ticket en Vivo',
    guestNotSignedIn: 'Invitado (Sin Iniciar Sesión)',
  },
  fr: {
    appName: 'QueueSphere',
    overview: 'Aperçu',
    kioskDispenser: 'Distributeur Kiosque',
    counterStation: 'Station Guichet',
    liveTvDisplay: 'Affichage TV en Direct',
    ticketTracker: 'Suivi de Ticket',
    appointments: 'Rendez-vous',
    adminControl: 'Contrôle Admin',
    signIn: 'Connexion',
    register: 'S\'inscrire',
    signOut: 'Déconnexion',
    welcomeBack: 'Bon retour',
    status: 'Statut',
    kioskTitle: 'Distributeur de Tickets Libre-Service',
    kioskDesc: 'Sélectionnez votre service ci-dessous pour recevoir votre ticket instantané.',
    selectDept: 'Sélectionner le Service',
    selectPriority: 'Niveau de Priorité',
    issueTicket: 'ÉMETTRE LE TICKET MAINTENANT',
    nowCalling: 'TICKET EN COURS D\'APPEL',
    proceedTo: 'Veuillez vous rendre au',
    estWait: 'Temps d\'attente est.',
    peopleAhead: 'Personnes devant vous',
    callNext: 'APPELER CLIENT SUIVANT',
    markComplete: 'Marquer Terminé',
    trackTitle: 'Suivi de Ticket en Direct',
    guestNotSignedIn: 'Invité (Non connecté)',
  },
  hi: {
    appName: 'QueueSphere',
    overview: 'अवलोकन',
    kioskDispenser: 'स्व-सेवा कियोस्क',
    counterStation: 'काउंटर स्टेशन',
    liveTvDisplay: 'लाइव टीवी डिस्प्ले',
    ticketTracker: 'टिकट ट्रैकर',
    appointments: 'अप्वाइंटमेंट्स',
    adminControl: 'एडमिन नियंत्रण',
    signIn: 'साइन इन',
    register: 'रजिस्टर करें',
    signOut: 'साइन आउट',
    welcomeBack: 'वापस स्वागत है',
    status: 'स्थिति',
    kioskTitle: 'स्व-सेवा टोकन वितरक',
    kioskDesc: 'तत्काल कतार टिकट प्राप्त करने के लिए नीचे अपना सेवा विभाग चुनें।',
    selectDept: 'सेवा विभाग चुनें',
    selectPriority: 'कतार प्राथमिकता स्तर',
    issueTicket: 'अभी टिकट जारी करें',
    nowCalling: 'अब पुकारा गया टोकन',
    proceedTo: 'कृपया यहाँ जाएं',
    estWait: 'अनुमानित प्रतीक्षा समय',
    peopleAhead: 'आपसे आगे लोग',
    callNext: 'अगले ग्राहक को बुलाएं',
    markComplete: 'पूर्ण चिह्नित करें',
    trackTitle: 'लाइव टोकन ट्रैकर',
    guestNotSignedIn: 'अतिथि (साइन इन नहीं)',
  },
};
