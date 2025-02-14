import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize environment variables
dotenv.config();
// Log environment variables for debugging
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate content endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { companyName, product, platform, contentType } = req.body;
        
        // Validate required fields
        if (!companyName || !product || !platform || !contentType) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields' 
            });
        }

        // Get the appropriate model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Generate the prompt
        const prompt = contentType === 'headlines'
            ? `Generate 5 engaging headlines for ${companyName}'s ${product} that would work well on ${platform}. 
               Format the response as a numbered list with only the headlines.`
            : `Generate 3 compelling calls-to-action (CTAs) for ${companyName}'s ${product} that would work well on ${platform}. 
               Make them action-oriented and specific to the platform's audience. 
               Format the response as a numbered list with only the CTAs.`;

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Format the response
        const formattedContent = text
            .split('\n')
            .filter(line => line.trim() && /^\d+\./.test(line))
            .map(line => line.replace(/^\d+\.\s*/, '').trim());

        res.json({
            success: true,
            content: formattedContent,
            type: contentType
        });

    } catch (error) {
        console.error('Generation error:', error);
        console.error('Error details:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to generate content',
            message: error.message
        });
    }
});

export default app;