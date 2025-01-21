var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { auth, createTodoFirestore, readTodosFirestore, updateTodoFirestore, deleteTodoFirestore, deleteTodosFirestore } from "./firestore.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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
let todosArr = [];
let dialogTodo = null;
let todoDialogMode = modeEnum.UNKNOWN;
let loginDialogMode = userEnum.UNKNOWN;
let signedInUser;
let uid = '';
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
    return __awaiter(this, void 0, void 0, function* () {
        clearTodoList();
    });
}
function todoListClicked(e) {
    return __awaiter(this, void 0, void 0, function* () {
        const element = e.target;
        if (element) {
            const parentElement = element.parentElement;
            if (parentElement) {
                let foundTodo;
                switch (element.tagName.toLowerCase()) {
                    case 'button':
                        yield deleteTodo(parentElement.dataset.id);
                        break;
                    case 'p':
                        foundTodo = findTodo(parentElement.dataset.id);
                        if (foundTodo) {
                            todoDialogMode = modeEnum.UPDATE;
                            showTodoDialog(foundTodo);
                        }
                        break;
                    case 'input':
                        foundTodo = findTodo(parentElement.dataset.id);
                        if (foundTodo) {
                            foundTodo.done = element.checked;
                            yield updateTodoFirestore(uid, foundTodo);
                        }
                        break;
                }
            }
        }
    });
}
// Main Window functions
function findTodo(id) {
    if (id !== undefined) {
        const index = todosArr.findIndex((todo) => todo.id === id);
        if (index !== -1) {
            return todosArr[index];
        }
    }
    return null;
}
function addTodo(todoStr) {
    return __awaiter(this, void 0, void 0, function* () {
        const todo = yield createTodoFirestore(uid);
        if (todo !== null) {
            todo.text = todoStr;
            todo.done = false;
            todosArr.push(todo);
            yield updateTodoFirestore(uid, todo);
            renderTodoList();
        }
        else {
            console.error("Failed to create todo in Firestore");
        }
    });
}
function updateTodo(id, todoStr) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundTodo = findTodo(id);
        if (foundTodo) {
            foundTodo.text = todoStr;
            yield updateTodoFirestore(uid, foundTodo);
            renderTodoList();
        }
    });
}
function clearTodoList() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield deleteTodosFirestore(uid, todosArr);
            todosArr = [];
            renderTodoList();
        }
        catch (error) {
            console.error(error);
        }
    });
}
function deleteTodo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const index = todosArr.findIndex((todo) => todo.id === id);
        if (index !== -1) {
            yield deleteTodoFirestore(uid, todosArr[index]);
            todosArr.splice(index, 1);
            renderTodoList();
            return true;
        }
        return false;
    });
}
function renderTodoList() {
    if (todoUL) {
        todoUL.innerHTML = todosArr.
            sort((a, b) => sortAscending(a.text.toLowerCase(), b.text.toLowerCase())).
            map((todo) => {
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
        const email = loginDialogEmailInput.value;
        const psw = loginDialogPasswordInput.value;
        switch (loginDialogMode) {
            case userEnum.CREATE:
                createUserWithEmailAndPassword(auth, email, psw)
                    .then((userCredential) => {
                    alert(`User '${userCredential.user.email}' created!`);
                })
                    .catch((error) => {
                    const errorStr = `Failed to create account!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
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
                    addTodoBtn === null || addTodoBtn === void 0 ? void 0 : addTodoBtn.removeAttribute("disabled");
                    clearTodoListBtn === null || clearTodoListBtn === void 0 ? void 0 : clearTodoListBtn.removeAttribute("disabled");
                    readTodosFirestore(uid)
                        .then((todos) => {
                        todosArr = todos;
                        renderTodoList();
                    })
                        .catch((error) => {
                        const errorStr = `Failed to read from DB!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
                        console.error(errorStr);
                        alert(errorStr);
                    });
                })
                    .catch((error) => {
                    const errorStr = `Failed to login to server!\n\nError Code: ${error.code}\nError Message: ${error.message}`;
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
function sortAscending(a, b) {
    if (a === b) {
        return 0;
    }
    else if (a < b) {
        return -1;
    }
    else {
        return 1;
    }
}
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
    return __awaiter(this, void 0, void 0, function* () {
        if (todoDialogTextArea === null || todoDialogTextArea.value === "") {
            return;
        }
        switch (todoDialogMode) {
            case modeEnum.ADD:
                addTodo(todoDialogTextArea.value);
                break;
            case modeEnum.UPDATE:
                if (dialogTodo) {
                    updateTodo(dialogTodo.id, todoDialogTextArea.value);
                }
                break;
            case modeEnum.UNKNOWN:
                console.error("todoDialogOkClicked - Error: todoDialogMode is modeEnum.UNKNOWN");
                break;
        }
        e.preventDefault();
        closeTodoDialog();
    });
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
