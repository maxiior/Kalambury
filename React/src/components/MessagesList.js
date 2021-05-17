import "./styles/messageslist.css";
import { getNumberIterator } from './Iterator';

const messagesIterator = getNumberIterator();

const MessagesList = ({ messages }) => {
  return (
    <div className="messages-list">
      {messages
        .slice(0)
        .reverse()
        .map((msg) => (
          <div key={messagesIterator.next()} className="message">
            <div>
              <span className="messages-username">{msg.User} :</span> {msg.Message}
            </div>
          </div>
        ))}
    </div>
  );
};

export default MessagesList;