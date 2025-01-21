# ToDo list typescript firebase

This is a single-page, 'Todo list application' that uses Google Firestore to store the logged-in user's Todo list.

The design is a 'Mobile First' responsive design that also support Tablet's and Desktop's. Breakpoints have been set at 650px for Tablet's & Small Desktop's, and 1024px for Medium & Large Desktop's.  
  
The site uses HTML5, CSS & TypeScript and the following functionality is supported (apart from displaying the Todo list):
1. Add a new Todo item.
2. Delete a new Todo item.
3. Update a Todo item (by clicking the todo text).
4. Mark Todo item as done.
5. Clearing the while Todo list.
6. Simple authentication with E-mail & password.
  
***
*Known problems:*
1. The site has not been published (I don't know how to deploy Vite-Firebase projects on GitHub or Netlify).
2. The source code contains a unprotected plain text key (`apiKey`) which compromises security. Fortunately the security breach is minor, see [https://infosecwriteups.com/is-it-safe-to-expose-your-firebase-api-key-bf2a318c0f29](https://infosecwriteups.com/is-it-safe-to-expose-your-firebase-api-key-bf2a318c0f29) for more information.
  
*Notes:*
1. The whole Todo list is re-rendered when a Todo item is added, updated or deleted and this is not optimal from a performance perspective (especially if the Todo list becomes large).
2. The Todo list is sorted each time it's rendered which could also become a performance issue if the Todo list grows larger.
  
***