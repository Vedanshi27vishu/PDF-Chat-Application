const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const fetch = require('node-fetch'); 
require('dotenv').config();

const app = express();


app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const GEMINI_API_KEY = 'AIzaSyAK6QA71bLkJ5skc_e2VMIF2o40MyLFuv0';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGeminiAPI(prompt) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const body = JSON.stringify({
    "contents": [
      {
        "parts": [
          {"text": prompt}
        ]
      }
    ]
  });

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return reply || "No response found.";
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    throw new Error(`Failed to fetch response: ${error.message}`);
  }
}
const pdfStore = {};
function getMostRelevantPage(question, pages) {
  let bestIdx = 0;
  let bestScore = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const pageText = pages[i].toLowerCase();
    const questionWords = question.toLowerCase().split(/\s+/);
    
    let score = 0;
    questionWords.forEach(word => {
      if (word.length > 2) {
        if (pageText.includes(word)) {
          score += 1;
        }
      }
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  
  return bestIdx;
}

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working with Gemini API via HTTP!' });
});

app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname);
    
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer, {
      pagerender: async (pageData) => {
        try {
          const textContent = await pageData.getTextContent();
          return textContent.items.map(item => item.str).join(' ');
        } catch (err) {
          console.warn('Error parsing page:', err.message);
          return '';
        }
      }
    });

    let text = pdfData.text || '';
    console.log('Extracted text length:', text.length);
    let pages = [];
    pages = text.split(/\f+/).filter(p => p.trim().length > 50);
    if (pages.length < 2) {
      pages = text.split(/(?:^|\n)\s*(?:Page\s+\d+|p\.\s*\d+|\d+\s*\/\s*\d+)/i)
        .filter(p => p.trim().length > 50);
    }
    if (pages.length < 2) {
      pages = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    }
    if (pages.length < 2) {
      const chunkSize = Math.max(1000, Math.floor(text.length / 5));
      pages = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        pages.push(text.substring(i, i + chunkSize));
      }
    }

    const pdfId = Date.now().toString();
    pdfStore[pdfId] = { 
      pages, 
      filename: req.file.originalname,
      uploadTime: new Date().toISOString()
    };
    
    fs.unlinkSync(req.file.path);
    
    console.log(`PDF processed: ${pages.length} pages extracted`);
    
    res.json({ 
      pdfId, 
      numPages: pages.length,
      filename: req.file.originalname
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to process PDF file',
      details: error.message 
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { pdfId, question } = req.body;
    
    if (!pdfId || !question) {
      return res.status(400).json({ error: 'Missing pdfId or question' });
    }
    
    const pdfData = pdfStore[pdfId];
    if (!pdfData) {
      return res.status(404).json({ error: 'PDF not found. Please upload the PDF again.' });
    }
    
    const { pages } = pdfData;
    console.log(`Processing question for PDF ${pdfId}: "${question}"`);
    
    const pageIdx = getMostRelevantPage(question, pages);
    const relevantText = pages[pageIdx];
    
    console.log(`Using page ${pageIdx + 1} for answer`);
    const prompt = `Based on the following text from page ${pageIdx + 1} of a PDF document, please answer the question. If the answer is not clearly available in the text, say so.

Text from page ${pageIdx + 1}:
${relevantText.substring(0, 2000)}

Question: ${question}

Please provide a clear and concise answer based only on the information provided in the text above.`;

    const answer = await callGeminiAPI(prompt);
    
    console.log('Generated answer:', answer);
    
    res.json({
      answer: answer.trim(),
      page: pageIdx + 1, 
      source: `Page ${pageIdx + 1} of ${pdfData.filename || 'uploaded document'}`
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid API key') || error.message.includes('400')) {
      res.status(500).json({ 
        error: 'Gemini API key is invalid or missing',
        details: 'Please check your GEMINI_API_KEY in the .env file'
      });
    } else if (error.message.includes('429') || error.message.includes('RATE_LIMIT')) {
      res.status(500).json({ 
        error: 'Gemini API rate limit exceeded',
        details: 'Please try again in a moment'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to process your question',
        details: error.message 
      });
    }
  }
});

app.get('/api/pdf/:pdfId', (req, res) => {
  const { pdfId } = req.params;
  const pdfData = pdfStore[pdfId];
  
  if (!pdfData) {
    return res.status(404).json({ error: 'PDF not found' });
  }
  
  res.json({
    pdfId,
    numPages: pdfData.pages.length,
    filename: pdfData.filename,
    uploadTime: pdfData.uploadTime
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});