import type { NextConfig } from "next";
import { MS_LOGIN } from "./src/lib/constants";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    MS_LOGIN: "http://localhost:8080"
  }
};

export default nextConfig;
