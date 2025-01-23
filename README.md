# ToDo List Typescript Firebase

This is a single-page, 'Todo list application' that uses Google Firestore to store the logged-in user's Todo list.

The design is a 'Mobile First' responsive design that also support Tablet's and Desktop's. Breakpoints have been set at 650px for Tablet's & Small Desktop's, and 1024px for Medium & Large Desktop's.  
  
The site uses HTML5, CSS & TypeScript and the following functionality is supported (apart from displaying the Todo list):
1. Add a new Todo item.
2. Delete a new Todo item.
3. Update a Todo item (by clicking the Todo text).
4. Mark Todo item as done.
5. Clearing the while Todo list.
6. Simple authentication with E-mail & password.

Effort has been spent on making the application as user friendly as possible, where buttons are disabled for each application state (i.e. logged-in, logged-out) to prevent the user from making an incorrect choice.
  
The site has been published on GitHub pages:  
Link to site:  
[https://chas-henrik.github.io/ToDo-List-Typescript-Firebase/](https://chas-henrik.github.io/ToDo-List-Typescript-Firebase/)
  

***
*Known problems:*
1. The source code contains a unprotected plain text key (`apiKey`) which compromises security. Fortunately the security breach is minor, see [https://infosecwriteups.com/is-it-safe-to-expose-your-firebase-api-key-bf2a318c0f29](https://infosecwriteups.com/is-it-safe-to-expose-your-firebase-api-key-bf2a318c0f29) for more information.
2. The authentication is the simplest possible where the User Credentials only contains E-mail Address & Password, and there is no support for changing the Password after the User Account has been created.
  
*Notes:*
1. The whole Todo list is re-rendered when a Todo item is added, updated or deleted and this is not optimal from a performance perspective (especially if the Todo list becomes large).
2. The Todo list is sorted each time it's rendered which can also become a performance issue if the Todo list grows larger.
3. Firebase creates the Todo Id to assure that each Id is unique even if the same user accesses the database simultaneously from two (or more) devices.
4. The whole Todo List is read from the DB when the page is loaded which is not optimal from a performance perspective. This could be optimized by reading smaller chunks of the DB (e.g. by reading only as many items that fits on the screen, and read more DB chunks when the user scrolls the Todo List).
5. It is questionably if any User's Todo list will ever grow larger than 100 entries, so the performance issues could be added as 'future improvements' (when & if this becomes an issue).
  
***