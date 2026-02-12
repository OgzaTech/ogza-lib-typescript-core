import { ValueObject } from "../ValueObject";
import { Result } from "../../logic/Result";
import { Guard } from "../../logic/Guard";
import { RegexPatterns } from "../../constants/RegexPatterns"; 
import { CoreKeys } from "../../constants/CoreKeys"; 
import { LocalizationService } from "../../localization/LocalizationService"; 

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  
  private constructor(props: EmailProps) {
    super(props);
  }

  public getValue(): string {
    return this.props.value;
  }

  public static create(emailString: string): Result<Email> {
    // 1. Guard (Boş kontrolü) - Bu zaten localized dönüyor
    const guardResult = Guard.againstNullOrUndefined(emailString, 'email');
    if (guardResult.isFailure) {
      return Result.fail<Email>(guardResult.error!);
    }

    const formattedEmail = emailString.trim().toLowerCase();

    // 2. Regex Kontrolü (Constants dosyasından)
    if (!RegexPatterns.EMAIL.test(formattedEmail)) {
      return Result.fail<Email>(
        LocalizationService.t(CoreKeys.VALIDATION.INVALID_EMAIL)
      );
    }

    return Result.ok<Email>(new Email({ value: formattedEmail }));
  }
}