import type { CVLanguage } from "../../interfaces/cv";
import us from "../../assets/flags/us.svg";
import fr from "../../assets/flags/fr.svg";
import es from "../../assets/flags/es.svg";
import de from "../../assets/flags/de.svg";
import it from "../../assets/flags/it.svg";
import pt from "../../assets/flags/pt.svg";
import ro from "../../assets/flags/ro.svg";
import gr from "../../assets/flags/gr.svg";
import ru from "../../assets/flags/ru.svg";
import fallback from "../../assets/flags/fallback_flag.svg";

export const LANGUAGE_TO_FLAG = {
  en: { svg: us, label: "English" },
  fr: { svg: fr, label: "French" },
  es: { svg: es, label: "Spanish" },
  de: { svg: de, label: "German" },
  it: { svg: it, label: "Italian" },
  pt: { svg: pt, label: "Portuguese" },
  ro: { svg: ro, label: "Romanian" },
  el: { svg: gr, label: "Greek" },
  ru: { svg: ru, label: "Russian" },
};

export const getFlagFromLanguage = (lng: CVLanguage) =>
  LANGUAGE_TO_FLAG[lng] ?? { svg: fallback, label: "Unknown" };