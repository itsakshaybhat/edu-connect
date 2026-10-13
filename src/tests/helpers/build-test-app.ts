import { buildApp } from "../../app.ts";

export async function buildTestApp(){
    const app = await buildApp();

    await app.ready();

    return app;
}