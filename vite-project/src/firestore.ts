import { Todos, Todo } from "./types.js"
import { initializeApp } from 'firebase/app';
import { Firestore, getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { getAuth } from "firebase/auth";

const defaultTodos: Todos = {
    nextId: 0,
    todos: []
}

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
const auth = getAuth(app);

export const db: Firestore = getFirestore(app);

// Get a list of cities from your database
async function getCities(db: Firestore) {
    const citiesCol = collection(db, 'cities');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    return cityList;
}

// Get a list of cities from your database
export async function getTodosFirestore(db: Firestore): Promise<Todos> {
    const todosCol = collection(db, 'todos');
    const todoSnapshot = await getDocs(todosCol);
    const todoList = todoSnapshot.docs.map(doc => doc.data());
    
    return defaultTodos;
}
