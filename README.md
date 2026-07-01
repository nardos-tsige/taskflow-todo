# 📋 TaskFlow - Todo List App

A simple, practice todo list application built with vanilla JavaScript, Webpack, and localStorage.

## 🎯 Purpose

This project was built as a practice exercise to learn:
- Vanilla JavaScript (ES6+)
- Webpack bundling
- localStorage for data persistence
- CSS Flexbox/Grid layout
- Responsive design
- Git/GitHub workflow

## ✨ Features

- ✅ Create, edit, and delete tasks
- 📂 Multiple projects/lists
- 🎯 Priority levels (High, Medium, Low)
- 📅 Due dates
- 💾 Auto-save to localStorage
- 📱 Responsive design

## 🛠️ Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Webpack 5
- date-fns
- Font Awesome Icons

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/nardos-tsige/taskflow-todo.git

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

````
# 📁 Project Structure
taskflow-todo/
├── src/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── index.js      # App entry
│   │   ├── project.js    # Project logic
│   │   ├── todo.js       # Todo logic
│   │   ├── storage.js    # localStorage
│   │   └── dom.js        # UI rendering
│   └── index.html
├── dist/                 # Production build
├── webpack.config.js
├── package.json
└── README.md
