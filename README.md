# 🐶 MAX — Your Pocket-Sized Companion

An Augmented Reality (AR) Virtual Pet application that allows users to place, interact with, and experience a realistic 3D dog companion in the real world using WebXR and Three.js.

## 🚀 Overview

Kairos AR Companion combines Augmented Reality, 3D graphics, and modern web technologies to create an immersive virtual pet experience. Users can place a 3D dog model on detected surfaces and interact with it naturally through their mobile device.

---

## ✨ Features

- 🐕 Realistic 3D Dog Model
- 📱 Mobile WebXR Support
- 🌍 Real-World Surface Detection
- 🎯 AR Hit Testing & Anchoring
- 🌑 Dynamic Shadow Rendering
- 🖐️ Interactive AR Experience
- 📐 Automatic Ground Placement
- ⚡ Fast and Responsive UI

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite

### AR & 3D
- Three.js
- React Three Fiber
- React Three Drei
- WebXR

### Deployment
- Vercel

---

## 📂 Project Structure

```bash
kairos-ar-companion/
│
├── public/
│   ├── dog.glb
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── Dog.jsx
│   │   ├── ARScene.jsx
│   │   └── Ground.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
[git clone https://github.com/Kairos-BSST/<repository-name>.git](https://github.com/Kairos-BSST/ar-virtual-pet.git)
cd ar-virtual-pet
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 📱 How It Works

1. Open the application on a WebXR-compatible device.
2. Grant camera permissions.
3. Scan the environment to detect horizontal surfaces.
4. Tap on a detected surface.
5. The virtual dog appears anchored to the real-world floor.
6. Move around and interact with your AR companion.

---

## 🎯 Future Enhancements

- Voice Commands
- AI-Based Pet Interaction
- Pet Animations
- Feeding System
- Gesture Recognition
- Multiplayer AR Experience
- Virtual Pet Customization

---

## 🌐 Browser Support

| Browser | Support |
|----------|----------|
| Chrome Android | ✅ |
| Edge Android | ✅ |
| Samsung Internet | ✅ |
| Safari iOS | Limited |
| Desktop Browsers | Partial |

---

## 👥 Collaborators

Developed by: 
- Trisha Deshmukh
- Bliss Gonsalves
- Sanika Mane
- Shravani Joshi
to explore the possibilities of Augmented Reality and immersive digital experiences.

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ If you found this project useful, consider giving it a star on GitHub.
