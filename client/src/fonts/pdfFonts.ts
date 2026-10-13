import { Font } from "@react-pdf/renderer";
import notoSansRegular from "../assets/fonts/pdf/NotoSans-Regular.ttf?url";
import notoSansBold from "../assets/fonts/pdf/NotoSans-Bold.ttf?url";
import notoSansItalic from "../assets/fonts/pdf/NotoSans-Italic.ttf?url";
import notoSansBoldItalic from "../assets/fonts/pdf/NotoSans-BoldItalic.ttf?url";
import notoSerifRegular from "../assets/fonts/pdf/NotoSerif-Regular.ttf?url";
import notoSerifBold from "../assets/fonts/pdf/NotoSerif-Bold.ttf?url";
import notoSerifItalic from "../assets/fonts/pdf/NotoSerif-Italic.ttf?url";
import notoSerifBoldItalic from "../assets/fonts/pdf/NotoSerif-BoldItalic.ttf?url";

export const PDF_FONT_FAMILY = {
  sans: "Noto Sans",
  serif: "Noto Serif",
} as const;

Font.register({
  family: PDF_FONT_FAMILY.sans,
  fonts: [
    { src: notoSansRegular, fontWeight: 400, fontStyle: "normal" },
    { src: notoSansBold, fontWeight: 700, fontStyle: "normal" },
    { src: notoSansItalic, fontWeight: 400, fontStyle: "italic" },
    { src: notoSansBoldItalic, fontWeight: 700, fontStyle: "italic" },
  ],
});

Font.register({
  family: PDF_FONT_FAMILY.serif,
  fonts: [
    { src: notoSerifRegular, fontWeight: 400, fontStyle: "normal" },
    { src: notoSerifBold, fontWeight: 700, fontStyle: "normal" },
    { src: notoSerifItalic, fontWeight: 400, fontStyle: "italic" },
    { src: notoSerifBoldItalic, fontWeight: 700, fontStyle: "italic" },
  ],
});
