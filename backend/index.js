const chatbotRoutes = require('./routes/chatbotRoutes');

// After app initialization
app.use(bodyParser.json());
app.use('/api/chatbot', chatbotRoutes);