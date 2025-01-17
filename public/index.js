import { getTodosLS, setTodosLS } from "./ls.js";
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
// Main Window elements
const addTodoBtn = document.getElementById("add-todo-btn");
const clearTodoListBtn = document.getElementById("clear-todo-list-btn");
const todoUL = document.getElementById("todo-list");
// ToDo Dialog elements
const todoDialog = document.getElementById("todo-dialog");
const todoDialogTextArea = document.getElementById("todo-dialog-textarea");
const todoDialogOkBtn = document.getElementById("todo-dialog-ok-btn");
const todoDialogCancelBtn = document.getElementById("todo-dialog-cancel-btn");
// Add Main Window event listeners
if (addTodoBtn)
    addTodoBtn.addEventListener('click', AddTodoBtnClicked);
else
    console.error("addTodoBtn===null");
if (clearTodoListBtn)
    clearTodoListBtn.addEventListener('click', clearTodoListClicked);
else
    console.error("clearTodoListBtn===null");
if (todoUL)
    todoUL.addEventListener('click', todoListClicked);
else
    console.error("todoUL===null");
// Main Window event listeners
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
