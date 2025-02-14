import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Gemini AI client setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Serve index.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Generate headline endpoint
app.post('/generate', async (req, res) => {
    try {
        // Extract form data
        const { companyName, product, platform, contentType } = req.body;

        // Construct prompt based on input
        const prompt = `Generate a ${contentType.toLowerCase()} for a ${platform} post about ${companyName}'s ${product}. 
        Be creative and engaging. Focus on ${contentType === 'Headlines' ? 'capturing attention' : 'driving action'}.`;

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Send generated content
        res.json({ 
            content: text,
            platform: platform,
            contentType: contentType
        });

    } catch (error) {
        console.error('Headline generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate content', 
            details: error.message 
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});