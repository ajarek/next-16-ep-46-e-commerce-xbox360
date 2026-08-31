export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    featured: boolean;
    discount: number;
    reviewCount: number;
    createdAt: string;
    quantity?: number;
}

export interface Category {
    id: number;
    name: string;
}