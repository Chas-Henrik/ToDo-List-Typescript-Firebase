import { Todo } from "./types.js"
import { auth, createTodoFirestore, readTodosFirestore, updateTodoFirestore, deleteTodoFirestore, deleteTodosFirestore } from "./firestore.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "../node_modules/firebase/auth";

// Enums
enum todoEnum {UNKNOWN, ADD, UPDATE};
enum userEnum {LOGOUT, CREATE, LOGIN};

// Global Variables
let todosArr: Todo[] = [];
let dialogTodo: (Todo|null) = null;
let todoDialogMode = todoEnum.UNKNOWN;
let loginDialogMode = userEnum.LOGOUT;
let signedInUser: (User|null) = null;
let uid: string = '';

// Main Window elements
const createUserSvg:(HTMLElement | null) = document.getElementById("create-user-icon");
const loginUserPicture:(HTMLElement | null) = document.getElementById("login-user-picture");
const loginUserSvg:(HTMLElement | null) = document.getElementById("login-user-icon");
const logoutUserPicture:(HTMLElement | null) = document.getElementById("logout-user-picture");
const logoutUserSvg:(HTMLElement | null) = document.getElementById("logout-user-icon");

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
createUserSvg?.addEventListener('click', createUserSvgClicked);
loginUserSvg?.addEventListener('click', loginUserSvgClicked);
logoutUserSvg?.addEventListener('click', logoutUserSvgClicked);
addTodoBtn?.addEventListener('click', AddTodoBtnClicked);
clearTodoListBtn?.addEventListener('click', clearTodoListClicked);
todoUL?.addEventListener('click', todoListClicked);

// Main Window event listeners

function createUserSvgClicked(_: MouseEvent): void {
    if(loginDialog) {
        loginDialogMode = userEnum.CREATE;
        if(loginDialogHeader)
            loginDialogHeader.textContent = "User Create";
        showLoginDialog();
    }
}

function loginUserSvgClicked(_: MouseEvent): void {
    if(loginDialog && !signedInUser) {
        loginDialogMode = userEnum.LOGIN;
        if(loginDialogHeader)
            loginDialogHeader.textContent = "User Login";
        showLoginDialog();
    }
}

function logoutUserSvgClicked(_: MouseEvent): void {
    if(signedInUser) {
        signOut(auth)
        .then(() => {
            const userEmail: (string|null|undefined) = signedInUser?.email;
            signedInUser = null;
            uid = '';
            todosArr = [];
            loginDialogMode = userEnum.LOGOUT;
            setUIState(userEnum.LOGOUT);
            renderTodoList();
            alert(`User '${userEmail}' logged out!`);
        })
        .catch((error) => {
            const errorStr: string = `Failed to logout!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
            console.error(errorStr);
            alert(errorStr);
        });
    }
}

function AddTodoBtnClicked(_: MouseEvent): void {
    todoDialogMode = todoEnum.ADD;
    showTodoDialog(null);
}

async function clearTodoListClicked(_: MouseEvent): Promise<void> {
    clearTodoList();
}

async function todoListClicked(e: Event): Promise<void> {
    const element:(HTMLElement | null) = e.target as HTMLElement | null;
    if(element) {
        const parentElement:(HTMLElement | null) = element.parentElement as HTMLElement | null;
        if(parentElement) {
            let foundTodo: (Todo|null);
            switch(element.tagName.toLowerCase()) {
                case 'button':
                    await deleteTodo(parentElement.dataset.id);
                    break;
                case 'p':
                    foundTodo = findTodo(parentElement.dataset.id);
                    if(foundTodo) {
                        todoDialogMode = todoEnum.UPDATE;
                        showTodoDialog(foundTodo);
                    }
                    break;
                case 'input':
                    foundTodo = findTodo(parentElement.dataset.id);
                    if(foundTodo) {
                        foundTodo.done = (element as HTMLInputElement).checked;
                        await updateTodoFirestore(uid, foundTodo);
                    }
                    break;
            }
        }
    }
}


// Main Window functions

function setUIState(state: userEnum): void {
    switch(state) {
        case userEnum.LOGOUT:
            loginUserPicture?.setAttribute("title", "Login User");
            loginUserSvg?.classList.remove("svg-disabled");
            logoutUserPicture?.removeAttribute("title");
            logoutUserSvg?.classList.add("svg-disabled");
            addTodoBtn?.setAttribute("disabled", "true");
            addTodoBtn?.removeAttribute("title");
            addTodoBtn?.classList.remove("cursor-pointer");
            clearTodoListBtn?.setAttribute("disabled", "true");
            clearTodoListBtn?.removeAttribute("title");
            clearTodoListBtn?.classList.remove("cursor-pointer");
            break;
        case userEnum.LOGIN:
            loginUserPicture?.removeAttribute("title");
            loginUserSvg?.classList.add("svg-disabled");
            logoutUserPicture?.setAttribute("title", "Logout User");
            logoutUserSvg?.classList.remove("svg-disabled");
            addTodoBtn?.removeAttribute("disabled");
            addTodoBtn?.setAttribute("title", "Add new todo");
            addTodoBtn?.classList.add("cursor-pointer");
            clearTodoListBtn?.removeAttribute("disabled");
            clearTodoListBtn?.setAttribute("title", "Clear the entire todo list");
            clearTodoListBtn?.classList.add("cursor-pointer");
            break;
    }
}

function findTodo(id: string | undefined): (Todo | null) {
    if(id !== undefined) {
        const index:number = todosArr.findIndex((todo) => todo.id === id);
        if(index !== -1) {
            return todosArr[index];
        }
    }
    return null;
}

async function addTodo(todoStr: string): Promise<void> {
    const todo: (Todo | null) = await createTodoFirestore(uid);

    if(todo !== null) {
        todo.text = todoStr;
        todo.done = false;
        todosArr.push(todo);
        await updateTodoFirestore(uid, todo);
        renderTodoList();
    } else {
        console.error("Failed to create todo in Firestore");
    }
}

async function updateTodo(id:string, todoStr: string): Promise<void> {
    const foundTodo:(Todo | null) = findTodo(id);
    if(foundTodo) {
        foundTodo.text = todoStr;
        await updateTodoFirestore(uid, foundTodo);
        renderTodoList();
    }
}

async function clearTodoList(): Promise<void> {
    try {
        await deleteTodosFirestore(uid, todosArr);
        todosArr = [];
        renderTodoList();
    } catch (error) {
        console.error(error);
    }
}

async function deleteTodo(id: string | undefined): Promise<boolean> {
    const index:number = todosArr.findIndex((todo) => todo.id === id);
    if(index !== -1) {
        await deleteTodoFirestore(uid, todosArr[index]);
        todosArr.splice(index,1);
        renderTodoList();
        return true;
    }
    return false;
}

function renderTodoList(): void {
    if(todoUL) {
        todoUL.innerHTML = todosArr.
        sort((a:Todo, b:Todo) => sortAscending(a.text.toLowerCase(), b.text.toLowerCase())).
        map((todo) => {
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

async function loginDialogOkClicked(e: MouseEvent): Promise<void> {
    if(loginDialogEmailInput === null || loginDialogPasswordInput === null || 
        !loginDialogEmailInput.validity.valid || !loginDialogPasswordInput.validity.valid
    ) {
        return;
    }
    e.preventDefault();

    const email: string = (loginDialogEmailInput as HTMLInputElement).value;
    const psw: string = (loginDialogPasswordInput as HTMLInputElement).value;

    switch (loginDialogMode) {
        case userEnum.CREATE:
            createUserWithEmailAndPassword(auth, email, psw)
                .then((userCredential) => {
                    alert(`User '${userCredential.user.email}' created!`);
                })
                .catch((error) => {
                    const errorStr: string = `Failed to create account!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
                    console.error(errorStr);
                    alert(errorStr);
                });
            break;
        case userEnum.LOGIN:
            signInWithEmailAndPassword(auth, email, psw)
                .then((userCredential) => {
                    alert(`User '${userCredential.user.email}' logged in!`);
                    signedInUser = userCredential.user;
                    uid = signedInUser.uid;
                    setUIState(userEnum.LOGIN);
                    readTodosFirestore(uid)
                        .then((todos: Todo[]) => {
                            todosArr = todos;
                            renderTodoList();
                        })
                        .catch((error) => {
                                const errorStr: string = `Failed to read from DB!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
                                console.error(errorStr);
                                alert(errorStr);
                        });
                })
                .catch((error) => {
                    const errorStr: string = `Failed to login to server!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
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

function sortAscending(a: string, b: string): number {
    if(a === b) {
        return 0;
    } else if(a < b) {
        return -1;
    } else {
        return 1;
    }
}

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

async function todoDialogOkClicked(e: MouseEvent): Promise<void> {
    if(todoDialogTextArea === null || (todoDialogTextArea as HTMLTextAreaElement).value === "") {
        return;
    }

    switch(todoDialogMode) {
        case todoEnum.ADD:
            addTodo(todoDialogTextArea.value);
            break;
        case todoEnum.UPDATE:
            if(dialogTodo){
                updateTodo(dialogTodo.id, todoDialogTextArea.value);
            }
            break;
        case todoEnum.UNKNOWN:
            console.error("todoDialogOkClicked - Error: todoDialogMode is todoEnum.UNKNOWN")
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

