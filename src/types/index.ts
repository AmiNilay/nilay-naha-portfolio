export interface IProject {
    _id?: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    techStack: string[];
    features: string[];
    githubUrl?: string;
    liveUrl?: string;
    images?: string[];
    snippets?: {
        title: string;
        language: string;
        code: string;
    }[];
    createdAt?: string;
}

export interface IBlog {
    _id?: string;
    title: string;
    slug: string;
    coverImage: string;
    description: string;
    content: string;
    tags: string[];
    readTime: number;
    published: boolean;
    createdAt?: string;
}