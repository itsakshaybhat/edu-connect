export interface CreateCourseInput {
    title: string;
    description?:string;
}

export interface ListCourseQuery {
    page?: number;
    limit?: number;
    instructorId: number;
    sortBy?: "createdAt" | "title";
    order?: "asc" | "desc";
}
