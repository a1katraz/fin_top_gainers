// server.js
const express = require('express');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Type } = require('@google/genai');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const API_KEY = "key"; 
const genAI = new GoogleGenerativeAI(API_KEY);

let history = [];

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
        temperature: 1.0,
        top_p: 0.95,
        top_k: 40,
        max_output_tokens: 8192,
        response_mime_type: "application/json",
        // Making  a response schema in Javascript wasd riddled with errors, so I have specified it in the prompt
        /*responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING,  },
                    has_stock_recommendation: { type: Type.BOOLEAN }                        
                    }, 
                },
            propertyOrdering: ["title", "has_stock_recommendation"],
        }, 
        */   
    },
    safetySettings: [],
    systemInstruction: "You are a helpful assistant that provides concise and accurate responses to user queries. You should always respond in a friendly and professional manner.",
});


app.post('/chat', async (req, res) => {
    try {
        //const prompt = req.body.prompt;
        //console.log("User input:", prompt);
        //console.log("Data received:", req.body.data);
        if (!req.body.prompt || !req.body.data) {
            return res.status(400).json({ error: "Prompt and data are required." });
        }

        let history = [];

        const messages = history.map(turn => ({
            role: turn.role,
            parts: turn.parts.map(part => ({ text: part.text }))
        }));

        messages.push({ role: "user", parts: [{ text: req.body.prompt }] });
        for (const item of req.body.data) {
            messages.push({ role: "user", parts: [{ text: item.title }] });
        }

        const result = await model.generateContent({ contents: messages });
        const modelResponse = result.response.text();

        //console.log("Model response:", modelResponse);

        history.push({ role: 'user', parts: [{ text: req.body.prompt }] });
        history.push({ role: 'model', parts: [{ text: modelResponse }] });

        res.json({ response: modelResponse });
    } catch (error) {
        console.error("Error during conversation:", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});