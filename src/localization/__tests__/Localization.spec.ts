import { LocalizationService } from "../LocalizationService";
import { CoreKeys } from "../../constants/CoreKeys";
import { tr } from "../locales/tr";
import { en } from "../locales/en";

describe('LocalizationService', () => {
  
  // Her testten sonra servisi varsayılan (İngilizce) haline getirelim ki diğer testler bozulmasın
  afterEach(() => {
    LocalizationService.setLocaleData(en);
  });

  it('should return default english message', () => {
    LocalizationService.setLocaleData(en);
    const msg = LocalizationService.t(CoreKeys.GUARD.NULL_OR_UNDEFINED, { name: 'Field' });
    expect(msg).toBe('Field is null or undefined');
  });

  it('should switch to turkish message', () => {
    LocalizationService.setLocaleData(tr);
    const msg = LocalizationService.t(CoreKeys.GUARD.NULL_OR_UNDEFINED, { name: 'Alan' });
    expect(msg).toBe('Alan değeri boş (null/undefined) olamaz.');
  });

  it('should return key if translation is missing', () => {
    LocalizationService.setLocaleData({});
    const msg = LocalizationService.t('UNKNOWN_KEY');
    expect(msg).toBe('UNKNOWN_KEY');
  });
});