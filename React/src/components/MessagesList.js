import "./styles/messageslist.css";

const MessagesList = ({ messages }) => {
  return (
    <div className="messages-list">
      {messages
        .slice(0)
        .reverse()
        .map((m) => (
          <div key={m.id} className="message">
            <div>
              <span className="messages-username">{m.User} :</span> {m.Message}
            </div>
          </div>
        ))}
    </div>
  );
};

export default MessagesList;
