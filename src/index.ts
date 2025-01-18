import { Todo, Todos } from "./types.js"
import { getTodosLS, setTodosLS } from "./ls.js";

// Enums
enum modeEnum {UNKNOWN, ADD, UPDATE};

// Global Variables
let todosObj: Todos = getTodosLS();
let dialogTodo: (Todo|null) = null;
let dialogMode = modeEnum.UNKNOWN;

// Main Window elements
const createAccountImg:(HTMLElement | null) = document.getElementById("create-account-icon");
const loginImg:(HTMLElement | null) = document.getElementById("login-icon");
const addTodoBtn:(HTMLElement | null) = document.getElementById("add-todo-btn");
const clearTodoListBtn:(HTMLElement | null) = document.getElementById("clear-todo-list-btn");
const todoUL:(HTMLElement | null) = document.getElementById("todo-list");

// ToDo Dialog elements
const todoDialog:(HTMLElement | null) = document.getElementById("todo-dialog");
const todoDialogTextArea:(HTMLTextAreaElement | null) = document.getElementById("todo-dialog-textarea") as HTMLTextAreaElement;
const todoDialogOkBtn:(HTMLElement | null) = document.getElementById("todo-dialog-ok-btn");
const todoDialogCancelBtn:(HTMLElement | null) = document.getElementById("todo-dialog-cancel-btn");


// Add Main Window event listeners
createAccountImg?.addEventListener('click', createAccountImgClicked);
loginImg?.addEventListener('click', loginImgClicked);
addTodoBtn?.addEventListener('click', AddTodoBtnClicked);
clearTodoListBtn?.addEventListener('click', clearTodoListClicked);
todoUL?.addEventListener('click', todoListClicked);


// Main Window event listeners

function createAccountImgClicked(_: MouseEvent): void {
    console.log("createAccountImgClicked");
}

function loginImgClicked(_: MouseEvent): void {
    console.log("loginImgClicked");
}

function AddTodoBtnClicked(_: MouseEvent): void {
    dialogMode = modeEnum.ADD;
    showTodoDialog(null);
}

function clearTodoListClicked(_: MouseEvent): void {
    todosObj = {
        nextId: 0,
        todos: []
    }
    setTodosLS(todosObj);
    renderTodoList();
}

function todoListClicked(e: Event): void {
    const element:(HTMLElement | null) = e.target as HTMLElement | null;
    if(element) {
        const parentElement:(HTMLElement | null) = element.parentElement as HTMLElement | null;
        if(parentElement) {
            let id: number;
            let foundTodo: (Todo|null);
            switch(element.tagName.toLowerCase()) {
                case 'button':
                    id = parseInt(parentElement.dataset.id || '-1');
                    if(deleteTodo(id))
                        renderTodoList();
                    break;
                case 'p':
                    id = parseInt(parentElement.dataset.id || '-1');
                    foundTodo = findTodo(id);
                    if(foundTodo) {
                        dialogMode = modeEnum.UPDATE;
                        showTodoDialog(foundTodo);
                    }
                    break;
                case 'input':
                    id = parseInt(parentElement.dataset.id || '-1');
                    foundTodo = findTodo(id);
                    if(foundTodo) {
                        foundTodo.done = (element as HTMLInputElement).checked;
                        setTodosLS(todosObj);
                    }
                    break;
            }
        }
    }
}


// Main Window functions

function findTodo(id: number): (Todo | null) {
    const index:number = todosObj.todos.findIndex((todo) => todo.id === id);
    if(index !== -1) {
        return todosObj.todos[index];
    }
    return null;
}

function addTodo(todoStr: string): void {
    const todo: Todo = {
        id: todosObj.nextId++,
        text: todoStr,
        done: false
    }
    todosObj.todos.push(todo);
    setTodosLS(todosObj);
}

function updateTodo(id:number, todoStr: string): void {
    const foundTodo:(Todo | null) = findTodo(id);
    if(foundTodo) {
        foundTodo.text = todoStr;
        setTodosLS(todosObj);
    }
}

function deleteTodo(id: number): boolean {
    const index:number = todosObj.todos.findIndex((todo) => todo.id === id);
    if(index !== -1) {
        todosObj.todos.splice(index,1);
        setTodosLS(todosObj);
        return true;
    }
    return false;
}

function renderTodoList(): void {
    if(todoUL) {
        todoUL.innerHTML = todosObj.todos.map((todo) => {
            const checked:string = (todo.done) ? "checked": "";
            return `
            <li class="grid-list" data-id=${todo.id}>
                <button title="Delete todo">X</button>
                <p title="Update todo">${todo.text}</p>
                <input type="checkbox" title="Toggle done" ${checked}>
            </li>`;
        }).join('');
    }
}


// Todo Dialog


// Add Todo Dialog event listeners

if(todoDialogOkBtn)
    todoDialogOkBtn.addEventListener('click', todoDialogOkClicked);
else
    console.error("todoDialogOkBtn===null");

if(todoDialogCancelBtn)
    todoDialogCancelBtn.addEventListener('click', todoDialogCancelClicked);
else
    console.error("todoDialogCancelBtn===null");
    


// Todo Dialog event listeners

function todoDialogOkClicked(e: MouseEvent): void {
    if(todoDialogTextArea === null || (todoDialogTextArea as HTMLTextAreaElement).value === "") {
        return;
    }

    switch(dialogMode) {
        case modeEnum.ADD:
            addTodo(todoDialogTextArea.value);
            renderTodoList();
            break;
        case modeEnum.UPDATE:
            if(dialogTodo){
                updateTodo(dialogTodo.id, todoDialogTextArea.value)
                renderTodoList();
            }
            break;
        case modeEnum.UNKNOWN:
            console.error("todoDialogOkClicked - Error: dialogMode is modeEnum.UNKNOWN")
            break;
    }

    e.preventDefault();
    closeTodoDialog();
}

function todoDialogCancelClicked(_: MouseEvent): void {
    closeTodoDialog();
}


// Todo Dialog functions

function showTodoDialog(todo: (Todo|null)): void {
    dialogTodo = todo;
    if(todoDialogTextArea) {
        (todoDialogTextArea as HTMLTextAreaElement).value = (dialogTodo)? dialogTodo.text : '';
    }
    if(todoDialog) {
        (todoDialog as HTMLDialogElement).showModal();
    }
}

function closeTodoDialog(): void {
    if(todoDialogTextArea)
        (todoDialogTextArea as HTMLTextAreaElement).value = "";

    if(todoDialog)
        (todoDialog as HTMLDialogElement).close();
}


// Global Initializations

renderTodoList();