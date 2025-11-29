🍁 Maple Notes (DevOps Edition)

Maple Notes is a full-stack note-taking application designed as a playground for learning DevOps, Containerization, and Cloud Infrastructure. It features a beautiful, glassmorphic autumn-themed UI and a robust microservices architecture.

🏗 Tech Stack

Frontend: React (Vite), Tailwind CSS 

Backend: Python Flask

Database: MongoDB (Containerized)

Infrastructure: Docker, Terraform, Ansible

🚀 Getting Started (Local Development)

Follow these steps to run the application on your local machine.

Prerequisites

Docker Desktop installed and running.

Node.js (v18+) installed.

Python (v3.9+) installed.

Step 1: Start the Database (MongoDB)

We use Docker to run the database instance to keep your local environment clean.

Open a terminal in the project root.

Run the MongoDB container:

docker run -d -p 27017:27017 --name maple-mongo mongo:latest


This starts MongoDB in the background on port 27017.

Step 2: Start the Backend (Flask)

Open a new terminal and navigate to the backend folder:

cd backend


Create and activate a virtual environment (optional but recommended):

python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate


Install dependencies:

pip install -r requirements.txt


Start the server:

python app.py


The backend will start running at http://127.0.0.1:5000.

Step 3: Start the Frontend (React)

Open a third terminal and navigate to the frontend folder:

cd frontend


Install Node dependencies:

npm install


Start the development server:

npm run dev


Open your browser and navigate to the link shown (usually http://localhost:5173).




