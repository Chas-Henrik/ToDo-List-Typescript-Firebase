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
// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkLzs8sAZ1dlk2-kRa2KMcb01wwqBVfrk",
    authDomain: "todo-list-64101.firebaseapp.com",
    projectId: "todo-list-64101",
    storageBucket: "todo-list-64101.firebasestorage.app",
    messagingSenderId: "708703569768",
    appId: "1:708703569768:web:84f83f52c173235241b8dd"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export function createTodoFirestore(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add a new document with a generated id.
        const todo = { id: '', text: '', done: false };
        try {
            const docRef = yield addDoc(collection(db, 'users', uid, 'todos'), todo);
            todo.id = docRef.id;
            return todo;
        }
        catch (error) {
            console.error("Error", error);
            return null;
        }
    });
}
export function readTodoFirestore(uid, id) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get a todo from your database
        try {
            const docRef = doc(db, 'users', uid, 'todos', id);
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
export function readTodosFirestore(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get a list of todos from your database
        try {
            const todosQuery = query(collection(db, 'users', uid, 'todos'));
            const querySnapshot = yield getDocs(todosQuery);
            if (!querySnapshot.empty) {
                return querySnapshot.docs.map(doc => doc.data());
            }
            else {
                return [];
            }
        }
        catch (error) {
            console.error("Error", error);
            return [];
        }
    });
}
export function updateTodoFirestore(uid, todo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add or update a document in collection "todos"
        try {
            yield setDoc(doc(db, 'users', uid, 'todos', todo.id), todo);
        }
        catch (error) {
            console.error("Error", error);
        }
    });
}
export function updateDoneFirestore(uid, todo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add or update a document in collection "todos"
        try {
            const todoRef = doc(db, 'users', uid, 'todos', todo.id);
            yield updateDoc(todoRef, { Done: todo.done });
        }
        catch (error) {
            console.error("Error", error);
        }
    });
}
export function deleteTodoFirestore(uid, todo) {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete a todo in your database
        try {
            yield deleteDoc(doc(db, 'users', uid, 'todos', todo.id));
        }
        catch (error) {
            console.error("Error", error);
        }
    });
}
export function deleteTodosFirestore(uid, todos) {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete a todo in your database
        try {
            for (const todo of todos) {
                yield deleteTodoFirestore(uid, todo);
            }
        }
        catch (error) {
            console.error("Error", error);
        }
    });
}
