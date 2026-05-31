import { getEnv } from "./get-env.ts";

export function getNumberEnv(name: string):number {
    const value = Number(getEnv(name));
    if(Number.isNaN(value)){
        throw new Error(`${name} must be a valid Number`);
    }
    return value;
}