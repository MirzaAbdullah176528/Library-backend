const express = require('express')
const router = express.Router()
const cors = require('cors')
const dotenv = require('dotenv')
const { GoogleGenerativeAI } = require('@google/generative-ai'); 


dotenv.config();


const port = process.env.PORT || 5000;

router.use(cors());
router.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


router.post('/', async (req, res) => {
  try {
    const { topic, name , category , author} = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

    const prompt = `
      You are a helpful assistant.
      User Request: ${topic}.
      Book Name: ${name || 'choose on your own'}
      Category: ${category || 'choose on your own'}
      author: ${author || 'choose on your own'}

      RULE MUST FOLLOW:
        LOGIC & RULES:
        1. **Priority Handling:** - If "Constraint Book Name" or "Constraint Category" are provided (not empty), you MUST use those exact values. Do not alter them.
          - If they are empty, analyze the "User Request" to extract the specific book or category.
          - If specific details are not found in the request, recommend a high-quality book/category that best fits the "User Request".

        2. **Description:** - Generate a concise, engaging summary (approx. 50 words) relevant to the context.

      Output format you should follow: 
      Return:
      json
      {
        "name": "Book Name",
        "category": "Category Name",
        "author": "author"
        "description": "..."
      }`  

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, data: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate content' 
    });
  }
});


router.post('/summaries' , async (req , res) => {
  const { name , category , author } = req.body

  if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

  const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

  const prompt = `
    You are an expert librarian and literary critic. Provide a concise, engaging summary of the following book:
    Title: ${name || ''}
    
    ${author ? `Author: ${author}` : ""}
    ${category ? `Category: ${category}` : ""}

    Write a 3 to 4 sentence summary that captures the main plot, core themes, and the overall tone of the book or noval or research paper. Do not include spoilers for the ending.
  `

  const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, data: text });

})

module.exports = router