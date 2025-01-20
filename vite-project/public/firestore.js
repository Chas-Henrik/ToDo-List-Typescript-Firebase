var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query } from "firebase/firestore/lite";
import { getAuth } from "firebase/auth";
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
export const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export function createTodoFirestore() {
    return __awaiter(this, void 0, void 0, function* () {
        // Add a new document with a generated id.
        const todo = { id: -1, text: '', done: false };
        try {
            const docRef = yield addDoc(collection(db, "todos"), todo);
            todo.id = parseInt(docRef.id);
            return todo;
        }
        catch (error) {
            console.error("Error", error);
            return null;
        }
    });
}
export function readTodoFirestore(id) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get a todo from your database
        try {
            const docRef = doc(db, "todos", `${id}`);
            const docSnap = yield getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error("Error", error);
            return null;
        }
    });
}
export function readTodosFirestore() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get a list of todos from your database
        try {
            const todosQuery = query(collection(db, 'todos'));
            const querySnapshot = yield getDocs(todosQuery);
            return querySnapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            console.error("Error", error);
            return [];
        }
    });
}
export function updateTodoFirestore(todo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add or update a document in collection "todos"
        try {
            yield setDoc(doc(db, 'todos', `${todo.id}`), todo);
        }
        catch (error) {
            console.error("Error", error);
        }
    });
}
export function updateDoneFirestore(todo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add or update a document in collection "todos"
        try {
            const todoRef = doc(db, 'todos', `${todo.id}`);
            yield updateDoc(todoRef, { Done: todo.done });
        }
        catch (error) {
            console.error("Error", error);
        }
    });
}
export function deleteTodoFirestore(todo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete a todo in your database
        try {
            yield deleteDoc(doc(db, "todos", `${todo.id}`));
        }
        catch (error) {
            console.error("Error", error);
        }
    });
}
export function deleteTodosFirestore(todos) {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete a todo in your database
        try {
            for (const todo of todos) {
                yield deleteTodoFirestore(todo);
            }
        }
        catch (error) {
            console.error("Error", error);
        }
    });
}
