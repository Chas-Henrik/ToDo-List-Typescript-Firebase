import { Todo, Todos } from "./types.js"
import { getTodosLS, setTodosLS } from "./ls.js";
import { app, db, createTodoFirestore, readTodoFirestore, readTodosFirestore, updateTodoFirestore, deleteTodoFirestore, deleteTodosFirestore } from "./firestore.js";
import { Auth, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from "firebase/auth";


// Enums
enum modeEnum {UNKNOWN, ADD, UPDATE};
enum userEnum {UNKNOWN, CREATE, LOGIN};

// Global Variables
let todosObj: Todos = getTodosLS();
let dialogTodo: (Todo|null) = null;
let todoDialogMode = modeEnum.UNKNOWN;
let loginDialogMode = userEnum.UNKNOWN;
let signedInUser: User;

// Main Window elements
const createUserImg:(HTMLElement | null) = document.getElementById("create-user-icon");
const loginUserImg:(HTMLElement | null) = document.getElementById("login-user-icon");
const addTodoBtn:(HTMLElement | null) = document.getElementById("add-todo-btn");
const clearTodoListBtn:(HTMLElement | null) = document.getElementById("clear-todo-list-btn");
const todoUL:(HTMLElement | null) = document.getElementById("todo-list");

// Login Dialog elements
const loginDialog:(HTMLElement | null) = document.getElementById("login-dialog");
const loginDialogHeader:(HTMLElement | null) = document.getElementById("login-dialog-header");
const loginDialogEmailInput:(HTMLInputElement | null) = document.getElementById("login-dialog-email") as HTMLInputElement;
const loginDialogPasswordInput:(HTMLInputElement | null) = document.getElementById("login-dialog-password") as HTMLInputElement;
const loginDialogOkBtn:(HTMLElement | null) = document.getElementById("login-dialog-ok-btn");
const loginDialogCancelBtn:(HTMLElement | null) = document.getElementById("login-dialog-cancel-btn");

// ToDo Dialog elements
const todoDialog:(HTMLElement | null) = document.getElementById("todo-dialog");
const todoDialogTextArea:(HTMLTextAreaElement | null) = document.getElementById("todo-dialog-textarea") as HTMLTextAreaElement;
const todoDialogOkBtn:(HTMLElement | null) = document.getElementById("todo-dialog-ok-btn");
const todoDialogCancelBtn:(HTMLElement | null) = document.getElementById("todo-dialog-cancel-btn");


// Add Main Window event listeners
createUserImg?.addEventListener('click', createUserImgClicked);
loginUserImg?.addEventListener('click', loginUserImgClicked);
addTodoBtn?.addEventListener('click', AddTodoBtnClicked);
clearTodoListBtn?.addEventListener('click', clearTodoListClicked);
todoUL?.addEventListener('click', todoListClicked);

// Main Window event listeners

function createUserImgClicked(_: MouseEvent): void {
    if(loginDialog) {
        loginDialogMode = userEnum.CREATE;
        if(loginDialogHeader)
            loginDialogHeader.textContent = "User Create";
        showLoginDialog();
    }
}

function loginUserImgClicked(_: MouseEvent): void {
    if(loginDialog) {
        loginDialogMode = userEnum.LOGIN;
        if(loginDialogHeader)
            loginDialogHeader.textContent = "User Login";
        showLoginDialog();
    }
}

function AddTodoBtnClicked(_: MouseEvent): void {
    todoDialogMode = modeEnum.ADD;
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
                        todoDialogMode = modeEnum.UPDATE;
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

// Login Dialog

// Add Login Dialog event listeners

loginDialogOkBtn?.addEventListener('click', loginDialogOkClicked);
loginDialogCancelBtn?.addEventListener('click', loginDialogCancelClicked);

// Login Dialog event listeners

async function loginDialogOkClicked(e: MouseEvent) {
    if(loginDialogEmailInput === null || loginDialogPasswordInput === null || 
        !loginDialogEmailInput.validity.valid || !loginDialogPasswordInput.validity.valid
    ) {
        return;
    }
    e.preventDefault();

    const auth: Auth = getAuth(app);
    const email: string = (loginDialogEmailInput as HTMLInputElement).value;
    const psw: string = (loginDialogPasswordInput as HTMLInputElement).value;

    switch (loginDialogMode) {
        case userEnum.CREATE:
            createUserWithEmailAndPassword(auth, email, psw)
            .then((userCredential) => {
                alert(`User '${userCredential.user.email}' ${userCredential.operationType}!`);
                signedInUser = userCredential.user;
            })
            .catch((error) => {
                const errorStr: string = `An error occurred!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
                console.error(errorStr);
                alert(errorStr);
            });
            break;
        case userEnum.LOGIN:
            signInWithEmailAndPassword(auth, email, psw)
            .then((userCredential) => {
                alert(`User '${userCredential.user.email}' ${userCredential.operationType}!`);
                signedInUser = userCredential.user;
            })
            .catch((error) => {
                const errorStr: string = `An error occurred!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
                console.error(errorStr);
                alert(errorStr);
            });
            break;
        default:
            const errorStr: string = `Invalid loginDialogMode (${loginDialogMode})`
            console.error(errorStr);
            alert(errorStr);
            break;
    }

    closeLoginDialog();
}

function loginDialogCancelClicked(_: MouseEvent): void {
    closeLoginDialog();
}

// Login Dialog functions

function showLoginDialog(): void {
    (loginDialog as HTMLDialogElement)?.showModal();
}

function closeLoginDialog(): void {
    if (loginDialogEmailInput)
        loginDialogEmailInput.value = "";

    if(loginDialogPasswordInput)
        loginDialogPasswordInput.value = "";

    (loginDialog as HTMLDialogElement)?.close();
}


// Todo Dialog


// Add Todo Dialog event listeners

todoDialogOkBtn?.addEventListener('click', todoDialogOkClicked);
todoDialogCancelBtn?.addEventListener('click', todoDialogCancelClicked);


// Todo Dialog event listeners

function todoDialogOkClicked(e: MouseEvent): void {
    if(todoDialogTextArea === null || (todoDialogTextArea as HTMLTextAreaElement).value === "") {
        return;
    }

    switch(todoDialogMode) {
        case modeEnum.ADD:
            addTodo(todoDialogTextArea.value);
            renderTodoList();
            break;
        case modeEnum.UPDATE:
            if(dialogTodo){
                updateTodo(dialogTodo.id, todoDialogTextArea.value);
                renderTodoList();
            }
            break;
        case modeEnum.UNKNOWN:
            console.error("todoDialogOkClicked - Error: todoDialogMode is modeEnum.UNKNOWN")
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
    (todoDialog as HTMLDialogElement)?.showModal();
}

function closeTodoDialog(): void {
    if(todoDialogTextArea)
        (todoDialogTextArea as HTMLTextAreaElement).value = "";

    (todoDialog as HTMLDialogElement)?.close();
}


// Global Initializations

renderTodoList();