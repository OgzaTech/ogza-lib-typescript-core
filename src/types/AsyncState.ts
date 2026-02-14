/**
 * Async State Type
 * Frontend'de API çağrılarının durumunu takip etmek için
 * 
 * Kullanım:
 * - Idle: Henüz başlamadı
 * - Loading: Yükleniyor
 * - Success: Başarılı, data var
 * - Error: Hata oluştu
 */

export type AsyncState<T, E = string> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

/**
 * Type guard functions
 */
export const isIdle = <T, E>(state: AsyncState<T, E>): state is { status: 'idle' } => {
  return state.status === 'idle';
};

export const isLoading = <T, E>(state: AsyncState<T, E>): state is { status: 'loading' } => {
  return state.status === 'loading';
};

export const isSuccess = <T, E>(state: AsyncState<T, E>): state is { status: 'success'; data: T } => {
  return state.status === 'success';
};

export const isError = <T, E>(state: AsyncState<T, E>): state is { status: 'error'; error: E } => {
  return state.status === 'error';
};

/**
 * Helper functions
 */
export const AsyncState = {
  idle: <T, E = string>(): AsyncState<T, E> => ({ status: 'idle' }),
  
  loading: <T, E = string>(): AsyncState<T, E> => ({ status: 'loading' }),
  
  success: <T, E = string>(data: T): AsyncState<T, E> => ({ 
    status: 'success', 
    data 
  }),
  
  error: <T, E = string>(error: E): AsyncState<T, E> => ({ 
    status: 'error', 
    error 
  }),

  /**
   * Map data if success
   */
  map: <T, U, E>(
    state: AsyncState<T, E>,
    fn: (data: T) => U
  ): AsyncState<U, E> => {
    if (state.status === 'success') {
      return AsyncState.success(fn(state.data));
    }
    return state as any;
  },

  /**
   * Get data or default value
   */
  getOrElse: <T, E>(state: AsyncState<T, E>, defaultValue: T): T => {
    return state.status === 'success' ? state.data : defaultValue;
  }
};