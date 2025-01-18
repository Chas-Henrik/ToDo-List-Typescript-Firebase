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
import { app } from "./firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// Enums
var modeEnum;
(function (modeEnum) {
    modeEnum[modeEnum["UNKNOWN"] = 0] = "UNKNOWN";
    modeEnum[modeEnum["ADD"] = 1] = "ADD";
    modeEnum[modeEnum["UPDATE"] = 2] = "UPDATE";
})(modeEnum || (modeEnum = {}));
;
var userEnum;
(function (userEnum) {
    userEnum[userEnum["UNKNOWN"] = 0] = "UNKNOWN";
    userEnum[userEnum["CREATE"] = 1] = "CREATE";
    userEnum[userEnum["LOGIN"] = 2] = "LOGIN";
})(userEnum || (userEnum = {}));
;
// Global Variables
let todosObj = getTodosLS();
let dialogTodo = null;
let todoDialogMode = modeEnum.UNKNOWN;
let loginDialogMode = userEnum.UNKNOWN;
let signedInUser;
// Main Window elements
const createUserImg = document.getElementById("create-user-icon");
const loginUserImg = document.getElementById("login-user-icon");
const addTodoBtn = document.getElementById("add-todo-btn");
const clearTodoListBtn = document.getElementById("clear-todo-list-btn");
const todoUL = document.getElementById("todo-list");
// Login Dialog elements
const loginDialog = document.getElementById("login-dialog");
const loginDialogHeader = document.getElementById("login-dialog-header");
const loginDialogEmailInput = document.getElementById("login-dialog-email");
const loginDialogPasswordInput = document.getElementById("login-dialog-password");
const loginDialogOkBtn = document.getElementById("login-dialog-ok-btn");
const loginDialogCancelBtn = document.getElementById("login-dialog-cancel-btn");
// ToDo Dialog elements
const todoDialog = document.getElementById("todo-dialog");
const todoDialogTextArea = document.getElementById("todo-dialog-textarea");
const todoDialogOkBtn = document.getElementById("todo-dialog-ok-btn");
const todoDialogCancelBtn = document.getElementById("todo-dialog-cancel-btn");
// Add Main Window event listeners
createUserImg === null || createUserImg === void 0 ? void 0 : createUserImg.addEventListener('click', createUserImgClicked);
loginUserImg === null || loginUserImg === void 0 ? void 0 : loginUserImg.addEventListener('click', loginUserImgClicked);
addTodoBtn === null || addTodoBtn === void 0 ? void 0 : addTodoBtn.addEventListener('click', AddTodoBtnClicked);
clearTodoListBtn === null || clearTodoListBtn === void 0 ? void 0 : clearTodoListBtn.addEventListener('click', clearTodoListClicked);
todoUL === null || todoUL === void 0 ? void 0 : todoUL.addEventListener('click', todoListClicked);
// Main Window event listeners
function createUserImgClicked(_) {
    if (loginDialog) {
        loginDialogMode = userEnum.CREATE;
        if (loginDialogHeader)
            loginDialogHeader.textContent = "User Create";
        showLoginDialog();
    }
}
function loginUserImgClicked(_) {
    if (loginDialog) {
        loginDialogMode = userEnum.LOGIN;
        if (loginDialogHeader)
            loginDialogHeader.textContent = "User Login";
        showLoginDialog();
    }
}
function AddTodoBtnClicked(_) {
    todoDialogMode = modeEnum.ADD;
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
                        todoDialogMode = modeEnum.UPDATE;
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
// Login Dialog
// Add Login Dialog event listeners
loginDialogOkBtn === null || loginDialogOkBtn === void 0 ? void 0 : loginDialogOkBtn.addEventListener('click', loginDialogOkClicked);
loginDialogCancelBtn === null || loginDialogCancelBtn === void 0 ? void 0 : loginDialogCancelBtn.addEventListener('click', loginDialogCancelClicked);
// Login Dialog event listeners
function loginDialogOkClicked(e) {
    return __awaiter(this, void 0, void 0, function* () {
        if (loginDialogEmailInput === null || loginDialogPasswordInput === null ||
            !loginDialogEmailInput.validity.valid || !loginDialogPasswordInput.validity.valid) {
            return;
        }
        e.preventDefault();
        const auth = getAuth(app);
        const email = loginDialogEmailInput.value;
        const psw = loginDialogPasswordInput.value;
        switch (loginDialogMode) {
            case userEnum.CREATE:
                createUserWithEmailAndPassword(auth, email, psw)
                    .then((userCredential) => {
                    alert(`User '${userCredential.user.email}' ${userCredential.operationType}!`);
                    signedInUser = userCredential.user;
                })
                    .catch((error) => {
                    const errorStr = `An error occurred!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
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
                    const errorStr = `An error occurred!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
                    console.error(errorStr);
                    alert(errorStr);
                });
                break;
            default:
                const errorStr = `Invalid loginDialogMode (${loginDialogMode})`;
                console.error(errorStr);
                alert(errorStr);
                break;
        }
        closeLoginDialog();
    });
}
function loginDialogCancelClicked(_) {
    closeLoginDialog();
}
// Login Dialog functions
function showLoginDialog() {
    loginDialog === null || loginDialog === void 0 ? void 0 : loginDialog.showModal();
}
function closeLoginDialog() {
    if (loginDialogEmailInput)
        loginDialogEmailInput.value = "";
    if (loginDialogPasswordInput)
        loginDialogPasswordInput.value = "";
    loginDialog === null || loginDialog === void 0 ? void 0 : loginDialog.close();
}
// Todo Dialog
// Add Todo Dialog event listeners
todoDialogOkBtn === null || todoDialogOkBtn === void 0 ? void 0 : todoDialogOkBtn.addEventListener('click', todoDialogOkClicked);
todoDialogCancelBtn === null || todoDialogCancelBtn === void 0 ? void 0 : todoDialogCancelBtn.addEventListener('click', todoDialogCancelClicked);
// Todo Dialog event listeners
function todoDialogOkClicked(e) {
    if (todoDialogTextArea === null || todoDialogTextArea.value === "") {
        return;
    }
    switch (todoDialogMode) {
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
            console.error("todoDialogOkClicked - Error: todoDialogMode is modeEnum.UNKNOWN");
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
    todoDialog === null || todoDialog === void 0 ? void 0 : todoDialog.showModal();
}
function closeTodoDialog() {
    if (todoDialogTextArea)
        todoDialogTextArea.value = "";
    todoDialog === null || todoDialog === void 0 ? void 0 : todoDialog.close();
}
// Global Initializations
renderTodoList();
