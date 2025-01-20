export type Todo = {
    id: string,
    text: string,
    done: boolean
}

export type Todos = {
    nextId: number,
    todos: Todo[]
}

