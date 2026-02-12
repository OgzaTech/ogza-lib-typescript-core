import { ITranslator } from "./ITranslator";
import { en } from "./locales/en";

/**
 * Singleton Localization Service.
 * Varsayılan olarak basit bir string replace yapar ve İngilizce çalışır.
 * Vue veya Strapi tarafında configure() metodu ile daha gelişmiş bir yapıya (i18n, next-intl vb.) bağlanabilir.
 */
export class LocalizationService {
  private static instance: LocalizationService;
  private translator: ITranslator;
  private localeData: Record<string, string>;

  private constructor() {
    // Varsayılan implementasyon (Dependency Injection yoksa bunu kullanır)
    this.localeData = en;
    this.translator = {
      translate: (key: string, args?: Record<string, any>) => {
        let text = this.localeData[key] || key;
        if (args) {
          Object.keys(args).forEach(argKey => {
            text = text.replace(`{${argKey}}`, String(args[argKey]));
          });
        }
        return text;
      }
    };
  }

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  // Dışarıdan özel bir translator (Vue-i18n vb.) enjekte etmek için
  public static configure(translator: ITranslator) {
    this.getInstance().translator = translator;
  }

  // Core içindeki basit dil dosyalarını değiştirmek için (örn: TR yüklemek için)
  public static setLocaleData(data: Record<string, string>) {
    this.getInstance().localeData = data;
  }

  public static t(key: string, args?: Record<string, any>): string {
    return this.getInstance().translator.translate(key, args);
  }
}