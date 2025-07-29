                                       PDF Chat Application
                                       by Vedanshi Aggarwal

A user-friendly web application built with React and Node.js that allows you to upload PDF documents, read them in an integrated viewer, and chat with an AI assistant that answers your questions about the document. Each answer cites relevant pages, and you can easily navigate to those pages in the viewer!

Features
Upload PDFs up to 10MB in size.

View PDFs right within the app — navigate pages, zoom in/out, download, or open in a new tab.

Ask questions via a chat interface about the PDF's content.

Citations in chat responses link directly to referenced pages.

Clean, responsive UI with personalized purple and pastel tones.

Easy to use on desktop or tablet.

Prerequisites
Node.js (version 16 or above recommended)

npm (comes with Node.js)

A modern browser like Chrome, Firefox, or Edge

Installation & Setup
1. Clone or download the source code
Extract the project folder to your desired location.

2. Backend Setup (if you have a backend separately)
(This project includes the backend code for PDF processing and AI integration, if applicable – please refer to backend setup instructions if separate.)

3. Frontend setup
Open your terminal (VSCode terminal, PowerShell, or Command Prompt) and navigate to the frontend folder of the project.

bash
cd frontend
4. Clean old installs (optional but recommended)
Before installing, remove any existing modules to avoid conflicts:

bash
rm -r -fo node_modules      # Or PowerShell equivalent: Remove-Item -Recurse -Force node_modules
rm -fo package-lock.json   # Or: Remove-Item -Force package-lock.json
5. Install dependencies
bash
npm install
6. Start the app
bash
npm start
The app should now launch automatically in your browser at http://localhost:3000.

Usage
Upload your PDF by clicking or dragging it into the upload area.

Once uploaded, view the PDF on the left — navigate pages using arrows or input a page number.

Ask your questions about the document on the right chat panel.

Chat answers will include page citations; clicking a citation will jump to that page in the PDF viewer.

If you want to upload a different file, click “Upload New File”.

Notes & Limitations
The current chat AI uses keyword matching to find relevant pages and Google’s Gemini API for generating answers.

The app only accepts PDF files and files up to 10MB.

Selectable text inside the PDF viewer is disabled for a clean look; this avoids duplicate text artifacts.

Uploaded PDFs are handled in-memory on the backend; restarting the server will clear uploaded files.

For very large PDFs or complex documents, the page relevance might not be perfect — future improvements can include vector-based semantic search.

Currently no user authentication or file encryption — it’s a demo app for assignment purposes.

Future Improvements
Integrate vector embeddings (e.g., LlamaIndex/LlamaParse) for better and more accurate AI search within PDFs.

Add user accounts and secure file storage.

Support multi-file uploads and session history.

Dark mode toggle for UI.

Progressive loading & performance optimization for very large PDFs.

Troubleshooting
If the PDF does not display correctly, please check console errors and ensure your file is a valid PDF.

If chat answers do not show up, verify backend is running and API key is set correctly in environment.

Restart the app if you change files or dependencies.

Ensure your browser allows loading PDF and has no ad-blockers interfering.

Credits
Developed by Vedanshi Aggarwal as part of the assignment for Playpower Lab.

AI integration via Google Gemini API.

PDF rendering powered by react-pdf.

Styling inspired by modern pastel theme with personal touch.

Thank you for checking out my app!
Feel free to reach out if you want to discuss the code or improvements. 😊