import dotenv from "dotenv";
import path from "node:path";
import { getEnv } from "./get-env.ts";
import { getNumberEnv } from "./get-number-env.ts";

dotenv.config({
    path: path.resolve(process.cwd(), "src", ".env"),
});

export const env = {
    PORT: getNumberEnv("PORT") || 3000,

    DB_HOST: getEnv("DB_HOST"),
    DB_PORT: getNumberEnv("DB_PORT") || 3306,
    DB_USER: getEnv("DB_USER"),
    DB_PASSWORD: getEnv("DB_PASSWORD"),
    DB_NAME: getEnv("DB_NAME"),

    JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
};