import { Todos, Todo } from "./types.js"
import { FirebaseApp, initializeApp } from '../node_modules/firebase/app';
import { Firestore, getFirestore, collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query } from "../node_modules/firebase/firestore/lite";
import { Auth, getAuth } from "../node_modules/firebase/auth";

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
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);


export async function createTodoFirestore(uid: string): Promise<Todo|null> {
    // Add a new document with a generated id.
    const todo:Todo = {id:'', text:'', done:false};
    try {
        const docRef = await addDoc(collection(db, 'users', uid, 'todos'), todo);
        todo.id = docRef.id;
        return todo;
    } catch (error) {
        console.error("Error", error);
        return null;
    }
}

export async function readTodoFirestore(uid: string, id:string): Promise<Todo|null> {
    // Get a todo from your database
    try {
        const docRef = doc(db, 'users', uid, 'todos', id);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
            return docSnap.data() as Todo;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error", error);
        return null;
    }
}

export async function readTodosFirestore(uid: string): Promise<Todo[]> {
    // Get a list of todos from your database
    try {
        const todosQuery = query(collection(db, 'users', uid, 'todos'));
        const querySnapshot = await getDocs(todosQuery);
        if(!querySnapshot.empty) {
            return querySnapshot.docs.map(doc => doc.data() as Todo);
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error", error);
        return [];
    }
}

export async function updateTodoFirestore(uid: string, todo:Todo): Promise<void> {
    // Add or update a document in collection "todos"
    try {
        await setDoc(doc(db, 'users', uid, 'todos', todo.id), todo);
    } catch (error) {
        console.error("Error", error);
    }
}

export async function updateDoneFirestore(uid: string, todo:Todo): Promise<void> {
    // Add or update a document in collection "todos"
    try {
        const todoRef = doc(db, 'users', uid, 'todos', todo.id);
        await updateDoc(todoRef, {Done: todo.done});
    } catch (error) {
        console.error("Error", error);
    }
}

export async function deleteTodoFirestore(uid: string, todo:Todo): Promise<void> {
    // Delete a todo in your database
    try {
        await deleteDoc(doc(db, 'users', uid, 'todos', todo.id));
    } catch (error) {
        console.error("Error", error);
    }
}

export async function deleteTodosFirestore(uid: string, todos:Todo[]): Promise<void> {
    // Delete a todo in your database
    try {
        for(const todo of todos) {
            await deleteTodoFirestore(uid, todo);
        }
    } catch (error) {
        console.error("Error", error);
    }
}
