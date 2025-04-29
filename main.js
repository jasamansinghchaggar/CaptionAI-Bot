// Express server for CaptionAI Bot
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Load environment variables (trimming whitespace from values)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.trim() : '';

// Check for API key on startup
if (!GOOGLE_API_KEY) {
    console.error('WARNING: GOOGLE_API_KEY not found in .env file');
    console.error('The application will not function correctly without an API key');
}

// Middleware
app.use(express.json());

// CORS handling for development/production
app.use((req, res, next) => {
    // Allow your frontend origin or use environment variable 
    res.header('Access-Control-Allow-Origin', '*'); // In production, replace with specific origin
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    // Basic security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Serve static files from public directory only (more secure)
app.use(express.static(path.join(__dirname, 'public')));

// Caption API endpoint
app.post('/api/caption', async (req, res) => {
    const { prompt, responseType, captionLength } = req.body;
    
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid prompt.' });
    }
    
    if (!responseType || !['funny', 'formal', 'casual', 'inspirational'].includes(responseType)) {
        return res.status(400).json({ error: 'Invalid response type.' });
    }
    
    if (!captionLength || !['short', 'medium', 'long'].includes(captionLength)) {
        return res.status(400).json({ error: 'Invalid caption length.' });
    }

    // API key validation
    if (!GOOGLE_API_KEY) {
        console.error('API request failed: Missing API key');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    // Compose prompt for Gemini
    const systemPrompt = `You are CaptionAI, a specialized caption generator. Follow these instructions precisely:

1. RESPONSE FORMAT: Provide ONLY the caption text in markdown format. Do not include any introductory text like "Here's a caption" or "Here are the results".

2. CAPTION TYPE: Generate a ${responseType} caption that is:
   ${responseType === 'funny' ? '- Humorous, witty, and playful language that would make someone laugh' : ''}
   ${responseType === 'formal' ? '- Professional, sophisticated language appropriate for business or official contexts' : ''}
   ${responseType === 'casual' ? '- Relaxed, conversational, everyday language as if talking to a friend' : ''}
   ${responseType === 'inspirational' ? '- Uplifting, motivational language that inspires action or positive emotions' : ''}

3. CAPTION LENGTH: Generate a ${captionLength} caption that is:
   ${captionLength === 'short' ? '- 1-2 concise sentences (15-25 words)' : ''}
   ${captionLength === 'medium' ? '- 3-4 well-crafted sentences (40-60 words)' : ''}
   ${captionLength === 'long' ? '- 5-7 detailed sentences (80-120 words)' : ''}

4. CONTENT: Base your caption specifically on this subject: "${prompt}"

5. MARKDOWN: Format the response using appropriate markdown styling (bold, italic, etc.) where it enhances readability.

Respond ONLY with the caption itself in markdown format, nothing else. Do not include examples of other styles or lengths in your response.`;

    try {
        // Updated API endpoint for gemini-2.0-flash model
        const geminiRes = await axios({
            method: 'post',
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            params: {
                key: GOOGLE_API_KEY
            },
            headers: { 'Content-Type': 'application/json' },
            data: {
                contents: [{ parts: [{ text: systemPrompt }] }]
            }
        });
        
        const geminiData = geminiRes.data;
        
        // Proper error handling for unexpected API responses
        if (!geminiData.candidates || geminiData.candidates.length === 0) {
            console.error('API returned unexpected response format:', geminiData);
            return res.status(500).json({ error: 'Invalid response from AI service.' });
        }
        
        const caption = geminiData.candidates[0]?.content?.parts?.[0]?.text || '';
        
        if (!caption) {
            return res.status(500).json({ error: 'Generated caption was empty.' });
        }
        
        res.json({ caption });
    } catch (err) {
        // Detailed error logging
        console.error('API request failed:', err.message);
        if (err.response) {
            console.error('API response status:', err.response.status);
            console.error('API response data:', err.response.data);
        }
        
        // Client-safe error response
        res.status(500).json({ 
            error: 'Failed to generate caption. Please try again later.' 
        });
    }
});

// Catch-all route to serve the frontend for any unmatched routes (SPA support)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'An unexpected error occurred.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`CaptionAI Bot server running on http://localhost:${PORT}`);
});