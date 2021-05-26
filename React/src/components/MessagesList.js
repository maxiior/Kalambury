import "./styles/messageslist.css";
import { getNumberIterator } from "./Iterator";

const messagesIterator = getNumberIterator();

const MessagesList = ({ messages }) => {
  return (
    <div className="messages-list">
      {messages
        .slice(0)
        .reverse()
        .map((msg) => (
          <div key={messagesIterator.next()} className="message">
            {msg.User === "2daef51c-be1b-11eb-8529-0242ac130003" ? (
              <div>
                <span className="goddie-message">
                  Wiadomość od Pana Boga : {msg.Message}
                </span>
              </div>
            ) : (
              <div>
                <span className="messages-username">{msg.User} :</span>{" "}
                {msg.Message}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default MessagesList;
