import { ISoapClient } from '../interfaces/ISoapClient';
import { Result } from '../../../logic/Result';

class MockSoapClient implements ISoapClient {
  public headers: Record<string, any> = {};

  // DÜZELTME: 'args' parametresi eklendi. Interface ile birebir uyumlu oldu.
  async call<T>(methodName: string, args: Record<string, any>): Promise<Result<T>> {
    // args parametresini mock dönüşünde kullanabiliriz veya loglayabiliriz
    return Result.ok({ 
      method: methodName,
      receivedArgs: args 
    } as any);
  }

  addHeader(name: string, content: any): void {
    this.headers[name] = content;
  }
}

describe('ISoapClient Contract', () => {
  it('should call soap method', async () => {
    const client = new MockSoapClient();
    
    // Artık 2 parametre gönderdiğimizde hata vermeyecek
    const result = await client.call('TestOp', { id: 123 });
    
    expect(result.isSuccess).toBe(true);
    // Dönen mock objesinin içeriğini kontrol edelim
    expect((result.getValue() as any).method).toBe('TestOp');
    expect((result.getValue() as any).receivedArgs).toEqual({ id: 123 });
  });

  it('should handle soap headers', () => {
    const client = new MockSoapClient();
    client.addHeader('Auth', 'Token123');
    expect(client.headers['Auth']).toBe('Token123');
  });
});