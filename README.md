# ToDo List Typescript Firebase

This is a single-page, 'Todo list application' that uses Google Firestore to store the User's Todo list.

The design is a 'Mobile First' responsive design that also support Tablet's and Desktop's. Breakpoints have been set at 650px for Tablet's & Small Desktop's, and 1024px for Medium & Large Desktop's.  
  
The site uses HTML5, CSS & TypeScript and the following functionality is supported (apart from displaying the Todo list):
1. Add a new Todo item.
2. Delete a new Todo item.
3. Update a Todo item (by clicking on the Todo text).
4. Mark Todo item as done.
5. Clearing the while Todo list.
6. Simple authentication with E-mail & password.
7. The Todo items are timestamped and the Todo list is sorted by creation time in descending order (i.e. the newest todo first).

Effort has been made making the application as user friendly as possible, where buttons are disabled for each application state (i.e. logged-in, logged-out) to prevent the user from making an invalid choice.
Effort has also been made to read the todo list in smaller chunks when the User login to optimize performance and speed up 'the user's perceived load time'.
  
The site has been published on GitHub pages:  
Link to site:  
[https://chas-henrik.github.io/ToDo-List-Typescript-Firebase/](https://chas-henrik.github.io/ToDo-List-Typescript-Firebase/)
  

***
*Known problems:*
1. The authentication is the simplest possible where the User Credentials only contains E-mail Address & Password, and there is also no support for changing the Password after the User Account has been created.
2. The application is not optimal from a performance perspective.
  
*Notes:*
1. The whole Todo list is re-rendered when a Todo item is added, updated or deleted and this is not optimal from a performance perspective (especially if the Todo list becomes large).
2. The Todo list is sorted each time it's re-rendered which could become a performance issue as the Todo list grows larger.
3. Firebase creates the Todo Id to assure that each Id is unique even if the same user accesses the database simultaneously from two (or more) devices.
4. It is questionably if any User's Todo list will ever grow larger than 100 entries, so the performance issues could be added as 'future improvements' (when & if this become an issue).
5. The Todo list is only read from the database at User Login and no effort has been made to keep the local content 'up to date' after that (in case the database us updated from another device). It is unlikely that the user updates the Todo list on multiple devices simultaneously though.
  
***