
const languageCodeMap: { [key: string]: string } = {
    'eng': 'en',
    'fra': 'fr',
    'spa': 'es',
    'deu': 'de',
    'ita': 'it',
    'por': 'pt',
    'ron': 'ro',
    'ell': 'el',
    'rus': 'ru'
};

const languageCodeMapper = (code: string): string | null => {
    return languageCodeMap[code] || null;
}

export default languageCodeMapper;