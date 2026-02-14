import { CoreKeys } from "../../constants/CoreKeys";

export const tr = {
   // Result
  [CoreKeys.RESULT.SUCCESS_WITH_ERROR]: "Geçersizİşlem: Başarılı bir sonuç hata içeremez.",
  [CoreKeys.RESULT.FAIL_WITHOUT_ERROR]: "Geçersizİşlem: Başarısız bir sonuç hata mesajı içermelidir.",
  [CoreKeys.RESULT.VALUE_ON_ERROR]: "Hatalı bir sonucun değeri okunamaz. 'error' özelliğini kullanın.",
  // Guard
  [CoreKeys.GUARD.NULL_OR_UNDEFINED]: "{name} değeri boş (null/undefined) olamaz.",
  [CoreKeys.GUARD.EMPTY_STRING]: "{name} değeri boş metin olamaz.",
  [CoreKeys.GUARD.AT_LEAST]: "{name} en az {min} karakter uzunluğunda olmalıdır",
  [CoreKeys.GUARD.AT_MOST]: "{name} en fazla {max} karakter uzunluğunda olmalıdır",
  [CoreKeys.GUARD.RANGE]: "{name} {min} ile {max} karakter arasında olmalıdır",
  [CoreKeys.GUARD.INVALID_PATTERN]: "{name} geçersiz bir formata sahip",
  
  // Domain Errors
  [CoreKeys.ERRORS.VALIDATION]: "Doğrulama hatası.",
  [CoreKeys.ERRORS.UNAUTHORIZED]: "Oturum açmanız gerekiyor.",
  [CoreKeys.ERRORS.FORBIDDEN]: "Erişim reddedildi.",
  [CoreKeys.ERRORS.NOT_FOUND]: "{resource} bulunamadı.",
  [CoreKeys.ERRORS.CONFLICT]: "Veri çakışması oluştu.",
  [CoreKeys.ERRORS.SERVICE_UNAVAILABLE]: "Servis şu anda kullanılamıyor.",
  [CoreKeys.ERRORS.NOT_IMPLEMENTED]: "Bu özellik henüz tamamlanmadı.",
  [CoreKeys.ERRORS.UNEXPECTED]: "Beklenmeyen bir hata oluştu.",

  // Infra Errors
  [CoreKeys.INFRA.NETWORK_ERROR]: "Bir ağ hatası oluştu. Lütfen bağlantınızı kontrol edin.",
  [CoreKeys.INFRA.TIMEOUT_ERROR]: "İstek zaman aşımına uğradı.",
  [CoreKeys.INFRA.ENCRYPTION_FAILED]: "Şifreleme işlemi başarısız oldu.",
  [CoreKeys.INFRA.DECRYPTION_FAILED]: "Şifre çözme işlemi başarısız oldu.",
  [CoreKeys.INFRA.HASHING_FAILED]: "Hashleme işlemi başarısız oldu.",
  [CoreKeys.INFRA.INVALID_CIPHER_FORMAT]: "Geçersiz şifreli metin formatı.",

  // App & Logic
  [CoreKeys.APP_ERROR.UNEXPECTED]: "Beklenmeyen bir hata oluştu.",
  [CoreKeys.VALIDATION.INVALID_EMAIL]: "Geçersiz e-posta formatı.",
};