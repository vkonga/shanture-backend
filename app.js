const express = require("express");
const {open} = require("sqlite");
const cors = require('cors');
const sqlite3 = require("sqlite3");
const path = require("path");
const multer = require("multer");

const storage = multer.memoryStorage(); // configure multer to store files in memory
const upload = multer({storage});
const app = express();
let db = null;
const dbPath = path.join(__dirname,"lists.db");
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

const initializeServer = async () => {
   try {
     db = await open({
        filename:dbPath,
        driver: sqlite3.Database
    });
    app.listen(3000, () => {
        console.log("Server Running at localhost 3000");
    });
    } catch (e){
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    };
};
initializeServer();

// Endpoint to get all tasks
app.get("/", async (request, response) => {

    const getTasks = `
        SELECT * FROM tasks 
        ORDER BY id;
    `;
    const tasksArray = await db.all(getTasks);
    response.send(tasksArray);
});

// Endpoint to create a new task
app.post("/add-task/", async (request, response) => {
    const taskDetails = request.body;
    const {id,taskName,taskStatus} = taskDetails;
    const addTask = `
        INSERT INTO 
            tasks (id,task_name,task_status)
        VALUES (
            ${id},'${taskName}','${taskStatus}'
        );
    `;
     const taskResponse = await db.run(addTask);
     response.send(taskResponse);
});

// Endpoint to update an existing task
app.put("/update-task/:id", async (request, response) => {
    const {id} = request.params;
    const taskDeatils = request.body;
    const {taskName,taskStatus} = taskDeatils;

    const updateTask = `
        UPDATE tasks
        SET 
            id = ${id}, task_name = '${taskName}',  task_status = '${taskStatus}'
        WHERE id = ${id};
    `;
    const updateResponse = await db.run(updateTask);
    response.send("Updated Successfully");
});

// Endpoint to delete a task
app.delete("/delete-task/:id/", async (request,response) => {
    const {id} = request.params;
    const deleteTask = `
        DELETE FROM tasks
        WHERE id = ${id};
    `;
    await db.run(deleteTask);
    response.send("Task Deleted Successfully");
});

// Endpoint to sve a PDF file to the database
app.post("/pdfs/", upload.single("pdf"), async (request, response) => {

    if (!request.file) {
        return response.status(400).send("No file uploaded.");
      }
    const pdfData = request.file.buffer;

    const pdfSave = `
        INSERT INTO pdfdocument (data)
        VALUES '${pdfData}'
    `;
    const pdfResponse = await db.run(pdfSave);
    response.send(pdfResponse);
});