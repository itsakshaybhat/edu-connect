import fp from "fastify-plugin";
import oauthPlugin from "@fastify/oauth2";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.ts";

async function githubOAuthPlugin(app:FastifyInstance){
    await app.register(oauthPlugin, {
        name: "githubOAuth2",

        credentials: {
            client: {
                id: env.githubClientId,
                secret: env.githubClientSecret,
            },
            auth: {
                authorizeHost: "https://github.com", //When login where to send the users
                authorizePath: "/login/oauth/authorize", //redirected path to approve your app
                tokenHost: "https://github.com", //where to exchange the authorization code(token)
                tokenPath: "/login/oauth/access_token", //app sends teh authorization code
            },
        },
        startRedirectPath: "/api/v1/auth/github",

        callbackUri: "http://localhost:3000/api/v1/auth/github/callback",
    });
}

export default fp(githubOAuthPlugin);