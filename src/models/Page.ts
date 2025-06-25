export interface Page<T> {
    content: T[];
    pageable: object;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // A página atual (base 0)
    sort: object;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}