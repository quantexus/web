/** @type {import("next").NextConfig} */
const nextConfig = {
  // gRPC client is server-side only; prevent bundling attempt on the browser side
  serverExternalPackages: ["@grpc/grpc-js", "@grpc/proto-loader"],
};

export default nextConfig;
