import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

i18next
	.use(Backend)
	.use(initReactI18next)
	.init({
		backend: {
			loadPath: "./locales/{{lng}}/{{ns}}.json",
		},
		fallbackLng: "en",
		debug: process.env.NODE_ENV === "development" ? true : false,
		interpolation: { escapeValue: false },
	});

export default i18next;
