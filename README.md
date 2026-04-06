# 📋 TaskFlow - Modern Task Manager

[![Tests](https://github.com/JAntonioCoelho/taskflow/workflows/Tests/badge.svg)](https://github.com/JAntonioCoelho/taskflow/actions)
[![Security](https://github.com/JAntonioCoelho/taskflow/workflows/Security/badge.svg)](https://github.com/JAntonioCoelho/taskflow/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A modern, sleek task management application with dark/light mode, inspired by Spotify and Instagram design.

## ✨ Features

- ✅ Create, edit, and delete tasks
- ⭐ Mark tasks as priority
- ⚡ Set tasks for today
- 🌓 Dark Mode / Light Mode toggle
- 📊 Detailed statistics dashboard
- 📱 Fully responsive design
- 💾 Local storage (100% private data)
- 🎨 Modern, clean interface
- 🔒 Automatic security scanning
- ✅ Automated testing

## 🚀 Live Demo

Visit: [https://JAntonioCoelho.github.io/taskflow/](https://JAntonioCoelho.github.io/taskflow/)

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3 (CSS Variables, Grid, Flexbox)
- **JavaScript**: ES6+ (LocalStorage API)
- **CI/CD**: GitHub Actions
- **Testing**: Jest
- **Security**: CodeQL, npm audit

## 📦 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/JAntonioCoelho/taskflow.git
cd taskflow
```

2. Open in browser:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Visit: `http://localhost:8000`

### Deploy to GitHub Pages

1. Fork this repository
2. Go to Settings → Pages
3. Source: **GitHub Actions**
4. Push any change to `main` branch
5. Your site will be live at: `https://JAntonioCoelho.github.io/taskflow/`

## 🎯 Usage

### Adding Tasks
1. Type your task in the input field
2. Press Enter or click "Add"
3. Task appears in your list

### Managing Tasks
- **Complete**: Click the circle checkbox
- **Priority**: Click the ⭐ button
- **Today**: Click the ⚡ button
- **Edit**: Click the ✏️ button
- **Delete**: Click the 🗑️ button

### Organizing
- Use the sidebar to switch between lists
- Create custom lists with ➕ New List
- Filter by "All", "Today", or "Priority"
- View statistics in the Stats tab

### Theme Toggle
Click the 🌙/☀️ button in the sidebar to switch between dark and light modes.

## 🧪 Testing

Run tests locally:
```bash
npm install
npm test
```

Tests run automatically on every push via GitHub Actions.

## 🔒 Security

Automatic security scanning includes:
- npm audit for dependency vulnerabilities
- CodeQL static analysis
- XSS vulnerability checks
- SQL injection pattern detection
- Secret scanning
- Weekly automated security scans

## 📊 Statistics

The app tracks:
- Total tasks created
- Completed tasks
- Priority tasks (active)
- Today's tasks (active)
- Completion rate percentage
- Pending tasks

## 🔐 Privacy

All data is stored **locally** in your browser using `localStorage`:
- ✅ No data sent to external servers
- ✅ 100% private and secure
- ✅ Data stays on your device
- ✅ No tracking or analytics

**Note**: Data is device-specific. Using the app on different devices creates separate task lists.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspired by Spotify and Instagram
- Icons: Native emoji
- Open source community

## 👤 Author

**José Coelho**
- GitHub: [@JAntonioCoelho](https://github.com/JAntonioCoelho)

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 💡 Feature Requests

Have an idea? Open an issue with the `enhancement` label!

---

⭐ If you find this project useful, please consider giving it a star!
