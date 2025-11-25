# Doxa Backend

## Overview
This is a custom **Document-Oriented Database Management System (DBMS) with integrated file management system API** built using Node.js, Express, TypeScript, and MongoDB.  
Users can:
- Create databases
- Create collections and define its schema inside a database
- Create, update, and delete documents and also upload files into a document if specified in the collection schema
- Upload files of any type (images, videos, PDFs, zip files, etc.)
- View files (only if the file is an image or video)
- Use a REST API to manage all operations

## Tech Stack
- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- Cloudinary (file storage)
- Express Validator
- Postman (API testing)
- Multer (file uploads)
- REST API (JSON responses)

## Features
- Create logical databases
- Create collections inside a database
- CRUD operations on documents
- File uploads (any type)
- Image & video preview support
- Cloudinary integration for file storage
- Input validations using Express Validator
- Structured modular Express architecture
