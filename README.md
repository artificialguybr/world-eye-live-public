# WorldEyeMap 🌍

Real-time webcam viewer featuring 600+ YouTube live streams and up to 1000 Windy webcams from around the world.

## ✨ Features

- **1600+ Live Streams**: 600+ YouTube webcams + up to 1000 Windy webcams from worldwide locations
- **Interactive World Map**: Visual exploration of cameras by geographic location
- **Immersive View**: Full-screen live streaming experience
- **Shuffle Mode**: Randomly explore different locations with one click
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Sleek dark mode interface for comfortable viewing
- **Secure API Integration**: Windy API key protected via Vercel Edge Functions (on-demand details)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/world-eyemap.git
cd world-eyemap

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🌐 Vercel Deployment

This app uses Vercel Edge Functions to securely proxy requests to the Windy Webcam API.

**For detailed deployment instructions, see [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)**

### Quick Setup:

1. Deploy to Vercel: `vercel` or use the dashboard
2. Add environment variable: `WINDY_API_KEY` (get from [api.windy.com/keys](https://api.windy.com/keys))
3. Redeploy: `vercel --prod`

## 🎬 How to Use

1. **Map View**: Click on camera markers on the world map to select a location
2. **List View**: Click the "List" button to browse all available cameras
3. **Shuffle**: Click "Shuffle" to randomly discover new locations
4. **Immersive Mode**: Select any camera to enter full-screen viewing

## 🗺️ Camera Categories

- 🏙️ **City**: Urban landmarks and city centers
- 🏖️ **Beach**: Coastal destinations and seaside views
- ⛰️ **Nature**: Mountains, forests, and natural landmarks
- 🏛️ **Historical**: Monuments and historical sites
- 🌅 **Scenic**: Beautiful landscapes and scenic viewpoints

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Maps**: MapLibre-GL with custom styling
- **Styling**: Tailwind CSS 4
- **Build**: Vite 6
- **Edge Functions**: Vercel Edge Runtime

## 📊 Cost & Limits (Vercel Free Tier)

| Resource | Free Limit | Typical Usage |
|----------|------------|---------------|
| Edge Functions | 1M invocations/month | ~50K for 5K users |
| Bandwidth | 100 GB/month | ~10-20 GB |
| CPU Time | 4 hours/month | ~30 minutes |

**Estimated cost for 5,000 users/month: $0**

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## 🌟 Acknowledgments

- YouTube camera feeds are sourced from various publicly available live streams
- Windy webcam integration powered by [Windy.com](https://www.windy.com)
- Built with modern web technologies for optimal performance

---

Built with modern web technologies for optimal performance.
