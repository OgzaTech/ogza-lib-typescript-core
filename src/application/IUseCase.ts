/**
 * IRequest: UseCase'e giren veri tipi (Genelde bir DTO)
 * IResponse: UseCase'den çıkan veri tipi (Genelde Result<DTO>)
 */
export interface IUseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse> | IResponse;
}