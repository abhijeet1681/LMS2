class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  greet = () => {
    const message = this.createChatBotMessage("Hello there!");
    this.addMessageToState(message);
  };

  handleCourseQuery = () => {
    const message = this.createChatBotMessage(
      "We offer courses in Web Development, Data Science, and more!",
      { widget: "courseLink" }
    );
    this.addMessageToState(message);
  };

  handleDefault = (userMessage) => {
    // Send to backend for NLP processing
    fetch('http://localhost:5000/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    })
    .then(res => res.json())
    .then(data => this.addMessageToState(this.createChatBotMessage(data.reply)));
  };

  addMessageToState = (message) => {
    this.setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };
}

export default ActionProvider;