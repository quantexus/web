import * as grpc from "@grpc/grpc-js"

export function grpcToHttp(code: number): number {
  switch (code) {
    case grpc.status.INVALID_ARGUMENT:
      return 400
    case grpc.status.NOT_FOUND:
      return 404
    case grpc.status.ALREADY_EXISTS:
      return 409
    case grpc.status.FAILED_PRECONDITION:
      return 422
    case grpc.status.UNIMPLEMENTED:
      return 501
    case grpc.status.UNAVAILABLE:
      return 503
    default:
      return 500
  }
}

export interface GrpcError {
  code: number
  message: string
}
