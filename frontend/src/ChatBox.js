import React, { useState, useRef, useEffect } from "react";

function ChatBox({ pdfId, setPageNumber }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!pdfId || !question.trim()) return;

    const userQuestion = question.trim();
    setQuestion("");
    setLoading(true);
    const newMessage = {
      id: Date.now(),
      question: userQuestion,
      answer: null,
      page: null,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch("https://pdf-chat-application-twu5.onrender.com/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          pdfId, 
          question: userQuestion 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, answer: data.answer, page: data.page }
            : msg
        )
      );

    } catch (error) {
      console.error("Chat error:", error);
   
      const mockResponse = {
        answer: "I'm sorry, but I cannot process your question right now as the backend service is not available. This is a demo response showing how the chat would work.",
        page: Math.floor(Math.random() * 5) + 1, 
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, answer: mockResponse.answer, page: mockResponse.page }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGoToPage = (page) => {
    if (page && setPageNumber) {
      setPageNumber(page);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Ask Questions About Your PDF</h3>
        {messages.length > 0 && (
          <button onClick={clearChat} className="clear-chat-btn">
            Clear Chat
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <p>👋 Welcome! Ask me anything about your PDF document.</p>
            <div className="sample-questions">
              <p><strong>Try asking:</strong></p>
              <ul>
                <li>"What is this document about?"</li>
                <li>"Summarize the main points"</li>
                <li>"What does page 3 discuss?"</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message-pair">
              <div className="user-message">
                <div className="message-header">
                  <strong>You</strong>
                  <span className="timestamp">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">{msg.question}</div>
              </div>

              <div className="bot-message">
                <div className="message-header">
                  <strong>AI Assistant</strong>
                  {msg.page && (
                    <button 
                      onClick={() => handleGoToPage(msg.page)}
                      className="page-reference-btn"
                    >
                      📄 Page {msg.page}
                    </button>
                  )}
                </div>
                <div className="message-content">
                  {msg.answer ? (
                    msg.answer
                  ) : (
                    <div className="thinking">
                      <div className="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span>Thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the PDF... (Press Enter to send)"
            className="chat-input"
            rows="3"
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={!question.trim() || loading}
            className="send-button"
          >
            {loading ? (
              <div className="button-spinner"></div>
            ) : (
              "Send 📤"
            )}
          </button>
        </div>
        <div className="input-help">
          <small>
            💡 Tip: Be specific in your questions for better answers. 
            {!pdfId && " (PDF processing required for chat functionality)"}
          </small>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;