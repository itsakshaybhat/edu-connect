export const createLessonSchema = {
    params: {
        type: "object",
        required: ["id"],
        properties:{
            id: {type: "integer", minimum: 1},
        }
    },
    body: {
        type: "object",
        required: ["title", "lessonOrder"],
        properties: {
            title: {
                type: "string",
                minLength: 3,
                maxLength: 255,
            },
            content: {
                type: "string",
            },
            lessonOrder: {
                type: "integer",
                minimum: 1,
            },
        },
        additionalProperties: false,
    },
} as const;

export const updateLessonSchema = {
    params: {
        type: "object",
        required: ["id"],
        properties: {
            id: {
                type: "integer",
                minimum: 1,
            },
        },
    },
    body: {
        type: "object",
        properties: {
            title: {
                type: "string",
                minLength: 3,
                maxLength: 255,
            },
            content: {
                type: "string",
            },
            lessonOrder: {
                type: "integer",
                minimum: 1,
            },
        },
        additionalProperties: false,
        minProperties: 1,
    },
} as const;