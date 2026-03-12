# Required Installations

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

# Running the Project

1. Clone the project:
    ```bash
    git clone https://github.com/emektarkubra/base-code-react.git
    ```

2. Navigate to the project directory:
    ```bash
    cd base-code-react
    ```

3. nstall the dependencies:
    ```bash
    npm install
    ```

4. Start Keycloak with Docker using the links below and update the initOptions:
    - <a href="https://www.keycloak.org/getting-started/getting-started-docker" target="_blank">Keycloak Docker Getting Started Guid</a>
    - <a href="https://medium.hexadefence.com/securing-a-react-app-using-keycloak-ac0ee5dd4bfc" target="_blank">Securing a React App Using Keycloak</a>

5. Open the project with Visual Studio Code:
    ```bash
    code .
    ```
6. Update the Docker container ID in the start.sh file. (Only applicable for macOS; different files should be added for different versions)

7. Start the project:
    ```bash
    npm run dev
    ```
