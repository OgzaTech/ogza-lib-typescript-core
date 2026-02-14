import { Result } from "../../logic/Result";
import { IUnitOfWork } from "./IUnitOfWork";

/**
 * Base Unit of Work Implementation
 * Abstract class - Her ORM için extend edilmeli
 */
export abstract class BaseUnitOfWork implements IUnitOfWork {
  private _isActive: boolean = false;

  public isActive(): boolean {
    return this._isActive;
  }

  async begin(): Promise<Result<void>> {
    if (this._isActive) {
      return Result.fail('Transaction already active');
    }

    const result = await this.beginTransaction();
    if (result.isSuccess) {
      this._isActive = true;
    }
    return result;
  }

  async commit(): Promise<Result<void>> {
    if (!this._isActive) {
      return Result.fail('No active transaction');
    }

    const result = await this.commitTransaction();
    this._isActive = false;
    return result;
  }

  async rollback(): Promise<Result<void>> {
    if (!this._isActive) {
      return Result.fail('No active transaction');
    }

    const result = await this.rollbackTransaction();
    this._isActive = false;
    return result;
  }

  /**
   * Transaction içinde iş yap - auto commit/rollback
   */
  async execute<T>(work: () => Promise<Result<T>>): Promise<Result<T>> {
    // Begin transaction
    const beginResult = await this.begin();
    if (beginResult.isFailure) {
      return Result.fail(beginResult.error!);
    }

    try {
      // Execute work
      const workResult = await work();

      if (workResult.isSuccess) {
        // Commit on success
        const commitResult = await this.commit();
        if (commitResult.isFailure) {
          return Result.fail(`Commit failed: ${commitResult.error}`);
        }
        return workResult;
      } else {
        // Rollback on failure
        await this.rollback();
        return workResult;
      }
    } catch (error) {
      // Rollback on exception
      await this.rollback();
      return Result.fail(`Transaction failed: ${error}`);
    }
  }

  /**
   * Abstract methods - ORM'e göre implement edilmeli
   */
  protected abstract beginTransaction(): Promise<Result<void>>;
  protected abstract commitTransaction(): Promise<Result<void>>;
  protected abstract rollbackTransaction(): Promise<Result<void>>;
}