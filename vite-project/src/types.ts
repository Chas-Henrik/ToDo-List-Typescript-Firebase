export type Todo = {
    id: number,
    text: string,
    done: boolean
}

export type Todos = {
    nextId: number,
    todos: Todo[]
}

