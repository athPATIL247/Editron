import { useState, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import styles from '../styling/ChatBox.module.css';
import { getMessages, sendMessage } from '../api/api';
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router-dom';
import { ImCross } from "react-icons/im";

const ChatBox = ({ getUsernameFromCookie, setMsgModal }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const socket = useSocket();
    const { id: roomId } = useParams();

    // Socket connection effect
    useEffect(() => {
        if (!socket || !roomId) return;

        // Join chat room
        socket.emit('join-chat', roomId);

        // Listen for new messages
        const handleNewMessage = (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
        };

        socket.on('chat-message', handleNewMessage);

        // Cleanup function
        return () => {
            socket.off('chat-message', handleNewMessage);
        };
    }, [socket, roomId]);

    // Fetch messages effect
    useEffect(() => {
        const fetchMessages = async () => {
            if (!roomId) return;

            try {
                const res = await getMessages(roomId);
                console.log(res.data.messages[0]);
                setMessages(res.data.messages[0].messages);
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };

        fetchMessages();
    }, [roomId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        await sendMessage({
            time: newMessage.time, text: message, roomId
        });

        // Emit message to socket
        socket?.emit('send-message', { roomId, message: newMessage });

        // Update local state
        setMessages(prev => [...prev, { ...newMessage, sender: { username: getUsernameFromCookie() } }]);
        setMessage('');
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <h2>Chat Room</h2>
                <h2><ImCross onClick={() => setMsgModal(false)}/></h2>
            </div>

            <div className={styles.messagesContainer}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`${styles.message} ${msg.sender?.username === getUsernameFromCookie() ? styles.ownMessage : ''}`}
                    >
                        <div className={styles.messageHeader}>
                            <span className={styles.sender}>{msg.sender?.username}</span>
                            <span className={styles.time}>{msg.time}</span>
                        </div>
                        <div className={styles.messageText}>{msg.text}</div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className={styles.inputContainer}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className={styles.messageInput}
                />
                <button type="submit" className={styles.sendButton}>
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default ChatBox; 