export const createCourseSchema = {
    body: {
        type: "object",
        required: ["title"],
        properties: {
            title: { type: "string", minLength: 3, maxLength: 225},
            descripton: {type: "string", maxLength:5000}
        },
        additionalProperties: false,
    },
} as const;


export const listCourseSchema = {
    querystring: {
        type: "object",
        properties: {
            page: {
                type: "number",
                minimum: 1,
            },
            limit:{
                type: "number",
                minimum:1,
                maximum: 100,
            },
            instructorId: {
                type: "number",
                minimum: 1,
            },
            sortBy: {
                type: "string",
                enum: ["createdAt", "title"],
            },
            order: {
                type: "string",
                enum: ["asc", "desc"],
            },
        },
    },
} as const;