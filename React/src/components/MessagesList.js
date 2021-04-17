import './styles/messageslist.css';

const MessagesList = ({messages, setMessage}) => {

    return (
        <div className='messages-list'>
            {messages.slice(0).reverse().map((m) => (
                <div key={m.id} className="message">
                    <div>{m.text}</div>
                </div>
            ))}
        </div>
    )
}

export default MessagesList
