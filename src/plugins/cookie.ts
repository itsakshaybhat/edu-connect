import fp from "fastify-plugin";
import cookie from "@fastify/cookie";

async function cookiePlugin(app: any){
    app.register(cookie);
}

export default fp(cookiePlugin);
