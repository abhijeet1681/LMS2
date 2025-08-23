class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lowerCase = message.toLowerCase();
    if (lowerCase.includes("hello") || lowerCase.includes("hi")) {
      this.actionProvider.greet();
    } else if (lowerCase.includes("course")) {
      this.actionProvider.handleCourseQuery();
    } else {
      this.actionProvider.handleDefault(message);
    }
  }
}

export default MessageParser;