import { Todo, Todos } from "./types.js"
import { getTodosLS, setTodosLS } from "./ls.js";
import { initializeApp } from 'firebase/app';
import { Firestore, getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User, UserCredential } from "firebase/auth";
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "PROJECT_ID.firebaseapp.com",
    // The value of `databaseURL` depends on the location of the database
    databaseURL: "https://DATABASE_NAME.firebaseio.com",
    projectId: "PROJECT_ID",
    // The value of `storageBucket` depends on when you provisioned your default bucket (learn more)
    storageBucket: "PROJECT_ID.firebasestorage.app",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID",
    // For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field
    measurementId: "G-MEASUREMENT_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const db: Firestore = getFirestore(app);

// Get a list of cities from your database
async function getCities(db: Firestore) {
    const citiesCol = collection(db, 'cities');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    return cityList;
}

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

    try {
        const userCredential: UserCredential = await Authenticate(
            (loginDialogEmailInput as HTMLInputElement).value, 
            (loginDialogPasswordInput as HTMLInputElement).value);
        signedInUser = userCredential.user;   
    } catch (error) {
        console.error(error);
        alert(error);
    }

    closeLoginDialog();
}

function loginDialogCancelClicked(_: MouseEvent): void {
    closeLoginDialog();
}

// Login Dialog functions

async function Authenticate(email:string, password:string): Promise<UserCredential> {
    const auth = getAuth();

    switch(loginDialogMode) {
        case userEnum.CREATE:
            return createUserWithEmailAndPassword(auth, (loginDialogEmailInput as HTMLInputElement).value, (loginDialogPasswordInput as HTMLInputElement).value)
            .then((userCredential) => {
                alert("Created new user!");
                return userCredential;
            })
            .catch((error) => {
                const errorStr: string = `An error occurred!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
                console.error(errorStr);
                throw new Error(errorStr);
            });
        case userEnum.LOGIN:
            return signInWithEmailAndPassword(auth, (loginDialogEmailInput as HTMLInputElement).value, (loginDialogPasswordInput as HTMLInputElement).value)
            .then((userCredential) => {
                alert("Login success!");
                return userCredential;
            })
            .catch((error) => {
                const errorStr: string = `An error occurred!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
                console.error(errorStr);
                throw new Error(errorStr);
            });
        default:
            throw new Error("Invalid loginDialogMode");
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