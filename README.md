# OrganizItt - React Native File Explorer and Camera App

This React Native app demonstrates a file explorer with functionalities for creating, deleting, and managing files and folders. It also includes a camera feature to capture photos and manage images. Built using Expo and React Native, the app integrates with `expo-camera` for camera functionalities and `expo-file-system` for file management.

## Features

- **File Explorer**: Navigate, create, delete, and view files and folders.
- **File Handling**: Supports text and image files. You can view and edit text files, and view images.
- **Camera**: Capture images and flip between front and back cameras.

## Prerequisites

- [Node.js](https://nodejs.org/) (v12 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (Install via `npm install -g expo-cli`)

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/venusai-mabbu/OrganizItt.git
   cd OrganizItt

2. **Install Dependencies**

Make sure you are in the project directory and install the required packages:

bash
Copy code
npm install
Install Expo CLI

If you haven't installed Expo CLI yet, you can do so with:

bash
Copy code
npm install -g expo-cli
Install Expo Camera and File System

**Install the Expo Camera and File System libraries used in the app:**

bash
Copy code
expo install expo-camera expo-file-system expo-image-picker
Configuration
Configure Expo Environment

Ensure that your environment is set up for using Expo. You can start the development server with:

bash
Copy code
expo start
This will open a new tab in your default web browser with the Expo DevTools interface.

Expo Permissions

The app requests camera permissions using Expo’s Camera API. Ensure your device or emulator has camera access.

**Running the App**
To start the app in development mode, use:

bash
Copy code
expo start
You can then choose to run the app on an iOS simulator, Android emulator, or a physical device by scanning the QR code provided in the Expo DevTools.

**Usage**
File Explorer
Navigate Files: Use the file explorer to browse directories and files. Tap on items to view or edit them.
Create Files/Folders: Use the buttons provided to create new files or folders.
Delete Files/Folders: Long-press on an item to open the delete confirmation dialog.
View/Edit Files: Tap on text files to view and edit content. Images will be displayed in a modal.
Camera
Open Camera: Tap the camera button to open the camera interface.
Capture Image: Use the camera to take photos. Captured images can be saved and managed within the app.
Flip Camera: Use the flip button to switch between the front and back cameras.

