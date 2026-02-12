import { IUseCase } from '../IUseCase';
import { Result } from '../../logic/Result';
import { AppError } from '../AppError';
import { LocalizationService } from '../../localization/LocalizationService';
import { en } from '../../localization/locales/en';

LocalizationService.setLocaleData(en);

// 1. Örnek Request ve Response
interface MockRequest {
  val: number;
}
type MockResponse = Result<string>;

// 2. Mock UseCase Implementasyonu
class MockUseCase implements IUseCase<MockRequest, MockResponse> {
  public async execute(req: MockRequest): Promise<MockResponse> {
    if (req.val < 0) {
      return AppError.UnexpectedError.create("Negative value");
    }
    return Result.ok<string>("Success: " + req.val);
  }
}

describe('UseCase & AppError', () => {

  beforeAll(() => {
    // console.error'u sustur (mockla)
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Test bitince console.error'u eski haline getir
    jest.restoreAllMocks();
  });

  it('should execute successfully', async () => {
    const useCase = new MockUseCase();
    const result = await useCase.execute({ val: 10 });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe("Success: 10");
  });

  it('should return UnexpectedError on failure', async () => {
    const useCase = new MockUseCase();
    const result = await useCase.execute({ val: -1 });

    expect(result.isFailure).toBe(true);
    // Hata mesajı localized olmalı
    expect(result.error).toBe("An unexpected error occurred.");
  });
});