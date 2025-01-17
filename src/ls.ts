import { Todos } from "./types.js"

const defaultTodos: Todos = {
    nextId: 0,
    todos: []
}

const TODO_NAME = "Todo-List-Typescript";

export function getTodosLS(): Todos {
    try {
        const lsTodos: (string | null) = localStorage.getItem(TODO_NAME);
        return lsTodos ? JSON.parse(lsTodos) : defaultTodos;
    } catch(error) {
        console.error(error);
        return defaultTodos;
    }
}

export function setTodosLS(todosObj: Todos): void {
    try {
        localStorage.setItem(TODO_NAME, JSON.stringify(todosObj));
    } catch(error) {
        console.error(error);
    }
}