const express = require('express');
const router = express.Router();
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Sample training data
const intents = [
  {
    tag: "courses",
    patterns: ["courses offered", "what can I learn", "available programs"],
    responses: ["We offer: Web Dev, Data Science, AI/ML"]
  },
  {
    tag: "enrollment",
    patterns: ["how to enroll", "sign up process", "join course"],
    responses: ["Go to Courses page > Select course > Click Enroll"]
  }
];

router.post('/', (req, res) => {
  const { message } = req.body;
  const tokens = tokenizer.tokenize(message.toLowerCase());
  let reply = "I didn't understand that. Can you rephrase?";

  // Basic NLP matching
  intents.forEach(intent => {
    if (intent.patterns.some(pattern => 
        tokens.some(token => pattern.includes(token)))) {
      reply = intent.responses[0];
    }
  });

  res.json({ reply });
});

module.exports = router;