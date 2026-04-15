import { useState, useRef, useEffect } from "react";
import { useCrowdData } from "../hooks/useCrowdData";

const SYSTEM_PROMPT = `You are SVOS Assistant, an AI guide for a large sports venue. 
You help attendees navigate, find shortest queues, and have the best experience.
You have access to LIVE crowd data for each zone in the venue.
Keep answers SHORT (2-3 sentences max), friendly, and actionable.
Always recommend the least crowded option when asked.
Current venue: SVOS Arena | Capacity: 55,000 | Event: Live Match`;

export default function AIAssistant() {
  const { zones, recommendations } = useCrowdData();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your SVOS guide 👋 Ask me anything — best food stall, nearest exit, wait times, or help navigating the venue.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    const zoneData = zones
      .map((z) => `${z.name}: density ${z.density}%, wait ${z.waitTime} min, alert: ${z.alert}`)
      .join("\n");
    return `LIVE ZONE DATA:\n${zoneData}`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: buildContext(),
        }),
      });

      const data = await response.json();
      const reply = data.reply || "Sorry, I couldn't process that. Try again!";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection issue. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Where's the shortest food queue?",
    "Nearest restroom?",
    "How do I exit quickly?",
    "Any crowd alerts?",
  ];

  return (
    <div className="ai-assistant">
      <div className="assistant-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="ai-avatar">🚀</div>
          <div>
            <div className="font-head" style={{ fontSize: 14 }}>SVOS Assistant</div>
            <div className="text-xs text-muted">Powered by Google Gemini · Real-time</div>
          </div>
        </div>
        <span className="badge green">● Online</span>
      </div>

      <div className="quick-actions">
        {quickActions.map((q) => (
          <button key={q} className="quick-btn" onClick={() => { setInput(q); }}>
            {q}
          </button>
        ))}
      </div>

      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="msg-avatar">AI</div>
            )}
            <div className="msg-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <div className="msg-avatar">AI</div>
            <div className="msg-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything about the venue..."
        />
        <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}
