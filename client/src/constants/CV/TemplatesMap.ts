import Castor from "../../components/features/CV/CVEditor/templates/castor";
import Polaris from "../../components/features/CV/CVEditor/templates/polaris";
import { CVTemplates } from "../../interfaces/cv";

export const TemplateMap = {
    [CVTemplates.CASTOR]: Castor,
    [CVTemplates.POLARIS]: Polaris,
}