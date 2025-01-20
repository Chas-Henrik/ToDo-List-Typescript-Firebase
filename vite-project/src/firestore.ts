import { Todos, Todo } from "./types.js"
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore, collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query } from "firebase/firestore/lite";
import { Auth, getAuth } from "firebase/auth";

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
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);


export async function createTodoFirestore(): Promise<Todo|null> {
    // Add a new document with a generated id.
    const todo:Todo = {id:-1, text:'', done:false};
    try {
        const docRef = await addDoc(collection(db, "todos"), todo);
        todo.id = parseInt(docRef.id);
        return todo;
    } catch (error) {
        console.error("Error", error);
        return null;
    }
}

export async function readTodoFirestore(id:number): Promise<Todo|null> {
    // Get a todo from your database
    try {
        const docRef = doc(db, "todos", `${id}`);
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

export async function readTodosFirestore(): Promise<Todo[]> {
    // Get a list of todos from your database
    try {
        const todosQuery = query(collection(db, 'todos'));
        const querySnapshot = await getDocs(todosQuery);
        return querySnapshot.docs.map(doc => doc.data() as Todo);
    } catch (error) {
        console.error("Error", error);
        return [];
    }
}

export async function updateTodoFirestore(todo:Todo): Promise<void> {
    // Add or update a document in collection "todos"
    try {
        await setDoc(doc(db, 'todos', `${todo.id}`), todo);
    } catch (error) {
        console.error("Error", error);
    }
}

export async function updateDoneFirestore(todo:Todo): Promise<void> {
    // Add or update a document in collection "todos"
    try {
        const todoRef = doc(db, 'todos', `${todo.id}`);
        await updateDoc(todoRef, {Done: todo.done});
    } catch (error) {
        console.error("Error", error);
    }
}

export async function deleteTodoFirestore(todo:Todo): Promise<void> {
    // Delete a todo in your database
    try {
        await deleteDoc(doc(db, "todos", `${todo.id}`));
    } catch (error) {
        console.error("Error", error);
    }
}

export async function deleteTodosFirestore(todos:Todo[]): Promise<void> {
    // Delete a todo in your database
    try {
        for(const todo of todos) {
            await deleteTodoFirestore(todo);
        }
    } catch (error) {
        console.error("Error", error);
    }
}
