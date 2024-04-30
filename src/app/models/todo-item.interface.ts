export interface TodoItemInterface {
    id: string;
    title: string;
    isDone: boolean;
    isFavorite: boolean;
    createdAt: Date;
    expireAt: Date;
}
