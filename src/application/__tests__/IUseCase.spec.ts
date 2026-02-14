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

// Basit string error kullanan mock
type MockResponse = Result<string>;

// 2. Mock UseCase Implementasyonu
class MockUseCase implements IUseCase<MockRequest, MockResponse> {
  public async execute(req: MockRequest): Promise<MockResponse> {
    if (req.val < 0) {
      // Basit string error döndür (Result<T, string> default davranışı)
      return Result.fail("An unexpected error occurred.");
    }
    return Result.ok<string>("Success: " + req.val);
  }
}

// 3. Structured error kullanan alternatif UseCase
type StructuredResponse = Result<string, AppError.UnexpectedError>;

class StructuredUseCase implements IUseCase<MockRequest, StructuredResponse> {
  public async execute(req: MockRequest): Promise<StructuredResponse> {
    if (req.val < 0) {
      // Structured error döndür
      return AppError.UnexpectedError.create(new Error("Negative value"));
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

  describe('Simple String Error UseCase', () => {
    it('should execute successfully', async () => {
      const useCase = new MockUseCase();
      const result = await useCase.execute({ val: 10 });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Success: 10");
    });

    it('should return simple error on failure', async () => {
      const useCase = new MockUseCase();
      const result = await useCase.execute({ val: -1 });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe("An unexpected error occurred.");
    });
  });

  describe('Structured Error UseCase', () => {
    it('should execute successfully', async () => {
      const useCase = new StructuredUseCase();
      const result = await useCase.execute({ val: 10 });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Success: 10");
    });

    it('should return structured error on failure', async () => {
      const useCase = new StructuredUseCase();
      const result = await useCase.execute({ val: -1 });

      expect(result.isFailure).toBe(true);
      
      const error = result.getError();
      expect(error).toBeDefined();
      expect(error!.code).toBe('UNEXPECTED_ERROR');
      expect(error!.message).toBe('Negative value');
      expect(error!.originalError).toBeDefined();
    });
  });
});