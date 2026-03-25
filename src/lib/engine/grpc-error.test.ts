import { describe, it, expect } from "vitest"
import * as grpc from "@grpc/grpc-js"
import { grpcToHttp } from "./grpc-error"

describe("grpcToHttp", () => {
  it("maps INVALID_ARGUMENT to 400", () => {
    expect(grpcToHttp(grpc.status.INVALID_ARGUMENT)).toBe(400)
  })

  it("maps NOT_FOUND to 404", () => {
    expect(grpcToHttp(grpc.status.NOT_FOUND)).toBe(404)
  })

  it("maps ALREADY_EXISTS to 409", () => {
    expect(grpcToHttp(grpc.status.ALREADY_EXISTS)).toBe(409)
  })

  it("maps FAILED_PRECONDITION to 422", () => {
    expect(grpcToHttp(grpc.status.FAILED_PRECONDITION)).toBe(422)
  })

  it("maps UNIMPLEMENTED to 501", () => {
    expect(grpcToHttp(grpc.status.UNIMPLEMENTED)).toBe(501)
  })

  it("maps UNAVAILABLE to 503", () => {
    expect(grpcToHttp(grpc.status.UNAVAILABLE)).toBe(503)
  })

  it("maps unknown code to 500", () => {
    expect(grpcToHttp(grpc.status.OK)).toBe(500)
    expect(grpcToHttp(grpc.status.CANCELLED)).toBe(500)
    expect(grpcToHttp(9999)).toBe(500)
  })
})
