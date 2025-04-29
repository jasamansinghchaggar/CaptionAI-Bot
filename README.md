# CaptionAI Bot

CaptionAI Bot is an AI-powered caption generator that creates engaging, creative captions for your social media posts, images, or any content. It leverages Google's Gemini API to generate high-quality, context-aware captions tailored to your specific requirements.

## Features

- Generate captions in different styles (funny, formal, casual, inspirational)
- Control caption length (short, medium, long)
- Simple and intuitive chat interface
- Responsive design for mobile and desktop
- Smooth animations powered by GSAP

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express
- **Animation**: GSAP
- **AI**: Google Gemini API

## Prerequisites

- Node.js (v14 or higher)
- Google Gemini API key (Get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

1. Clone the repository:
   ```bash
   https://github.com/jasamansinghchaggar/CaptionAI-Bot.git
   cd captionai-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google Gemini API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

## Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
captionai-bot/
├── public/                # Frontend static files
│   ├── index.html         # Main HTML file
│   ├── script.js          # Frontend JavaScript
│   └── style.css          # CSS styles
├── main.js                # Express server and API endpoints
├── package.json           # Project dependencies and scripts
├── .env                   # Environment variables (API keys)
└── README.md              # Project documentation
```

## Usage

1. Open the application in your browser
2. Choose the caption style and length from the dropdowns
3. Type what you need a caption for (e.g., "a sunset photo at the beach")
4. Click "Send" or press Enter
5. The AI will generate a caption based on your requirements

## License

ISC

## Author

Jasaman Singh