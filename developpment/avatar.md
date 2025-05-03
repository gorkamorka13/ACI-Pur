Dans mon application en HTML nodeJS/ express/sequelize/Sqlite,je souhaiterais implementer une nouvell fonctionalité: lorsque l'on enregistre un utilisateur implémenter une fonctionnalité permettant de upload une image qui deviendra son avatar, de créer un avatar si il ne saisi pas d'image à partir de canvas ou d'avoir un avatar par default. 
L'image de l'avatar ser stockée sur le serveur au sein d'un repertoire /upload/image.
Cette image associée à l'utilisateur enregistré dans la base de donnée, sera disponible pour être affichée dans la page html d'accueil: index.html lorsque l'utilisateur se connectera. 
On utilisera multer que j'ai installé.
Donne-moi le plan pour pouvoir implémenter cette fonctionnalité dans mon projet.

Okay, let's refine the plan with more specific details for each step.

__Refined & Detailed Plan:__

__1. Project Setup and Dependencies:__

- __Verify/Install Dependencies:__

  - Confirm `multer` is listed in `package.json` and installed (`npm list multer`). If not, install it (`npm install multer`).
  - Install the `canvas` package for server-side canvas generation (`npm install canvas`).

- __Create Upload Directory:__

  - Manually create the directory structure `upload/image` within your project's root directory (`c:/Users/Mike/Documents/Cursor/ACI-Pur/upload/image`).
  - Alternatively, add code to `server.js` to create this directory on startup if it doesn't exist (using Node.js `fs` module).

- __Configure Static File Serving:__

  - In `server.js`, configure Express to serve static files from the `upload/image` directory. Add something like:

    ```javascript
    // Serve static files for avatars
    app.use('/uploads/images', express.static(path.join(__dirname, 'upload/image')));
    ```

    (Ensure `path` module is required: `const path = require('path');`)

__2. Database Migration:__

- __Generate Migration:__ Use the Sequelize CLI to generate a migration file to add the `avatar` column to the `Users` table:

  ```bash
  npx sequelize-cli migration:generate --name add-avatar-to-users
  ```

- __Edit Migration File:__ Modify the generated migration file (in the `migrations` directory) to include the `up` and `down` methods:

  - `up`: Add the `avatar` column (type `STRING`, allow `NULL`).
  - `down`: Remove the `avatar` column.

- __Run Migration:__ Execute the migration:

  ```bash
  npx sequelize-cli db:migrate
  ```

__3. Model Update:__

- __Update `models/User.js`:__ Add the `avatar` field definition to the `User` model attributes, matching the migration:

  ```javascript
  avatar: {
    type: DataTypes.STRING,
    allowNull: true // Or false if a default/generated avatar is always set
  }
  ```

__4. Backend Implementation (Routes & Logic):__

- __Create User Routes File (if needed):__ If you don't have a dedicated file for user-related routes, consider creating `api/users/index.js`.

- __Configure Multer:__

  - In your user routes file (or `server.js` if preferred), configure `multer`.
  - Use `multer.diskStorage` to define the destination (`upload/image/`) and filename (e.g., `user-<userId>-<timestamp>.<extension>`). Sanitize filenames.
  - Implement a `fileFilter` to accept only image types (e.g., jpeg, png, gif).
  - Set file size limits if necessary.

- __Create Avatar Generation Utility:__

  - Create a utility file (e.g., `js/utils/avatarGenerator.js`).

  - Use the `canvas` library to:

    - Create a square canvas.
    - Generate a random background color.
    - Get the user's initials (from username or email).
    - Draw the initials centered on the canvas with a contrasting color (e.g., white).
    - Save the canvas as a PNG file to the `upload/image` directory (e.g., `user-<userId>-generated.png`).
    - Return the path to the generated file.

- __Modify Registration Route (`api/auth/index.js`):__

  - Update the `/register` route (POST request).

  - Apply the `multer` middleware configured earlier (`upload.single('avatar')`) to handle the file upload *before* the main route handler.

  - In the route handler:

    - Check if `req.file` exists (user uploaded an image).
      - If yes, use `req.file.path` (or the generated filename) as the avatar path.

    - If `req.file` does not exist:

      - Call the `avatarGenerator.js` utility function, passing the user's ID (once created) and initials. Use the returned path.
      - *Alternatively*, if canvas generation fails or is skipped, set the path to the default avatar: `/uploads/images/default_avatar.png` (assuming you place `default_avatar.png` in `upload/image`).

    - When creating the user record using `User.create()`, include the determined `avatar` path in the user data.

- __Add Route to Get User Info (including avatar):__

  - Ensure you have a route (e.g., `/api/auth/me` or `/api/users/me`) protected by `authenticateToken` middleware.
  - This route should fetch the logged-in user's data from the database, including the `avatar` field, and return it.

__5. Frontend Integration:__

- __Update `register.html`:__

  - Add a file input field within the `<form id="registerForm">`:

    ```html
    <div class="form-group">
        <label for="registerAvatar">Avatar (facultatif):</label>
        <input type="file" id="registerAvatar" name="avatar" accept="image/*">
    </div>
    ```

- __Update `js/auth.js` (Registration Logic):__

  - Modify the `submit` event listener for `#registerForm`.
  - Instead of sending JSON, create a `FormData` object.
  - Append the email, username, password, and the selected avatar file (`registerAvatar.files[0]`) to the `FormData`.
  - Send the `FormData` object in the `fetch` request. __Important:__ Do *not* set the `Content-Type` header manually when sending `FormData`; the browser will set it correctly (including the boundary).

- __Update `index.html`:__

  - Locate the user info section: `<div class="user-info">`.

  - Modify it to include an `<img>` tag for the avatar:

    ```html
    <div class="user-info">
        <img id="userAvatar" src="/uploads/images/default_avatar.png" alt="User Avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px; vertical-align: middle;">
        <span id="usernameDisplay">Utilisateur</span>
        <!-- Keep the icon if desired, or remove it -->
        <!-- <i class="fas fa-user-circle"></i> -->
    </div>
    ```

- __Update `js/main.js` (or relevant script for `index.html`):__

  - When the page loads and user data is fetched (likely via the `/api/auth/me` route):

    - Get the `avatar` path from the response.
    - Select the `#userAvatar` image element.
    - Set its `src` attribute to the user's `avatar` path. If the path is null or empty, keep the default or set it explicitly to the default avatar path.

__6. Error Handling & Security:__

- __Backend:__ Add `try...catch` blocks in route handlers. Handle errors from `multer`, database operations, and canvas generation gracefully, sending appropriate error responses (e.g., 400, 500). Validate file types and sizes rigorously in `multer`.
- __Frontend:__ Add error handling to `fetch` calls in JavaScript. Display user-friendly error messages if registration or fetching user data fails.

This refined plan provides more concrete steps and considerations. Does this level of detail meet your expectations? If you are satisfied, please toggle to ACT MODE so I can begin the implementation.

I have refined the plan with more specific implementation details for each step, including file paths, code snippets, library usage, and configuration points.

Does this detailed plan look good? If yes, please toggle to ACT MODE so I can start implementing these changes.
