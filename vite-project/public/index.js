var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getTodosLS, setTodosLS } from "./ls.js";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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
const db = getFirestore(app);
// Get a list of cities from your database
function getCities(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const citiesCol = collection(db, 'cities');
        const citySnapshot = yield getDocs(citiesCol);
        const cityList = citySnapshot.docs.map(doc => doc.data());
        return cityList;
    });
}
// Enums
var modeEnum;
(function (modeEnum) {
    modeEnum[modeEnum["UNKNOWN"] = 0] = "UNKNOWN";
    modeEnum[modeEnum["ADD"] = 1] = "ADD";
    modeEnum[modeEnum["UPDATE"] = 2] = "UPDATE";
})(modeEnum || (modeEnum = {}));
;
// Global Variables
let todosObj = getTodosLS();
let dialogTodo = null;
let dialogMode = modeEnum.UNKNOWN;
let signedInUser = null;
// Main Window elements
const createAccountImg = document.getElementById("create-account-icon");
const loginImg = document.getElementById("login-icon");
const addTodoBtn = document.getElementById("add-todo-btn");
const clearTodoListBtn = document.getElementById("clear-todo-list-btn");
const todoUL = document.getElementById("todo-list");
// ToDo Dialog elements
const todoDialog = document.getElementById("todo-dialog");
const todoDialogTextArea = document.getElementById("todo-dialog-textarea");
const todoDialogOkBtn = document.getElementById("todo-dialog-ok-btn");
const todoDialogCancelBtn = document.getElementById("todo-dialog-cancel-btn");
// Add Main Window event listeners
createAccountImg === null || createAccountImg === void 0 ? void 0 : createAccountImg.addEventListener('click', createAccountImgClicked);
loginImg === null || loginImg === void 0 ? void 0 : loginImg.addEventListener('click', loginImgClicked);
addTodoBtn === null || addTodoBtn === void 0 ? void 0 : addTodoBtn.addEventListener('click', AddTodoBtnClicked);
clearTodoListBtn === null || clearTodoListBtn === void 0 ? void 0 : clearTodoListBtn.addEventListener('click', clearTodoListClicked);
todoUL === null || todoUL === void 0 ? void 0 : todoUL.addEventListener('click', todoListClicked);
// Main Window event listeners
function createAccountImgClicked(_) {
    createUser();
    console.log("createAccountImgClicked");
}
function loginImgClicked(_) {
    loginUser();
    console.log("loginImgClicked");
}
function AddTodoBtnClicked(_) {
    dialogMode = modeEnum.ADD;
    showTodoDialog(null);
}
function clearTodoListClicked(_) {
    todosObj = {
        nextId: 0,
        todos: []
    };
    setTodosLS(todosObj);
    renderTodoList();
}
function todoListClicked(e) {
    const element = e.target;
    if (element) {
        const parentElement = element.parentElement;
        if (parentElement) {
            let id;
            let foundTodo;
            switch (element.tagName.toLowerCase()) {
                case 'button':
                    id = parseInt(parentElement.dataset.id || '-1');
                    if (deleteTodo(id))
                        renderTodoList();
                    break;
                case 'p':
                    id = parseInt(parentElement.dataset.id || '-1');
                    foundTodo = findTodo(id);
                    if (foundTodo) {
                        dialogMode = modeEnum.UPDATE;
                        showTodoDialog(foundTodo);
                    }
                    break;
                case 'input':
                    id = parseInt(parentElement.dataset.id || '-1');
                    foundTodo = findTodo(id);
                    if (foundTodo) {
                        foundTodo.done = element.checked;
                        setTodosLS(todosObj);
                    }
                    break;
            }
        }
    }
}
// Main Window functions
function createUser() {
    return __awaiter(this, void 0, void 0, function* () {
        createUserWithEmailAndPassword(auth, "henrik.suurik@chasacademy.se", "my-top-secret-password")
            .then((userCredential) => {
            // Signed up 
            signedInUser = userCredential.user;
            console.log("Successfully signed in to server");
            // ...
        })
            .catch((error) => {
            console.error("error.code: ", error.code, "error.message: ", error.message);
        });
    });
}
function loginUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, "henrik.suurik@chasacademy.se", "my-top-secret-password")
            .then((userCredential) => {
            // Signed in 
            signedInUser = userCredential.user;
            console.log("Successfully signed in to server");
            // ...
        })
            .catch((error) => {
            console.error("error.code: ", error.code, "error.message: ", error.message);
        });
    });
}
function findTodo(id) {
    const index = todosObj.todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
        return todosObj.todos[index];
    }
    return null;
}
function addTodo(todoStr) {
    const todo = {
        id: todosObj.nextId++,
        text: todoStr,
        done: false
    };
    todosObj.todos.push(todo);
    setTodosLS(todosObj);
}
function updateTodo(id, todoStr) {
    const foundTodo = findTodo(id);
    if (foundTodo) {
        foundTodo.text = todoStr;
        setTodosLS(todosObj);
    }
}
function deleteTodo(id) {
    const index = todosObj.todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
        todosObj.todos.splice(index, 1);
        setTodosLS(todosObj);
        return true;
    }
    return false;
}
function renderTodoList() {
    if (todoUL) {
        todoUL.innerHTML = todosObj.todos.map((todo) => {
            const checked = (todo.done) ? "checked" : "";
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
if (todoDialogOkBtn)
    todoDialogOkBtn.addEventListener('click', todoDialogOkClicked);
else
    console.error("todoDialogOkBtn===null");
if (todoDialogCancelBtn)
    todoDialogCancelBtn.addEventListener('click', todoDialogCancelClicked);
else
    console.error("todoDialogCancelBtn===null");
// Todo Dialog event listeners
function todoDialogOkClicked(e) {
    if (todoDialogTextArea === null || todoDialogTextArea.value === "") {
        return;
    }
    switch (dialogMode) {
        case modeEnum.ADD:
            addTodo(todoDialogTextArea.value);
            renderTodoList();
            break;
        case modeEnum.UPDATE:
            if (dialogTodo) {
                updateTodo(dialogTodo.id, todoDialogTextArea.value);
                renderTodoList();
            }
            break;
        case modeEnum.UNKNOWN:
            console.error("todoDialogOkClicked - Error: dialogMode is modeEnum.UNKNOWN");
            break;
    }
    e.preventDefault();
    closeTodoDialog();
}
function todoDialogCancelClicked(_) {
    closeTodoDialog();
}
// Todo Dialog functions
function showTodoDialog(todo) {
    dialogTodo = todo;
    if (todoDialogTextArea) {
        todoDialogTextArea.value = (dialogTodo) ? dialogTodo.text : '';
    }
    if (todoDialog) {
        todoDialog.showModal();
    }
}
function closeTodoDialog() {
    if (todoDialogTextArea)
        todoDialogTextArea.value = "";
    if (todoDialog)
        todoDialog.close();
}
// Global Initializations
renderTodoList();
