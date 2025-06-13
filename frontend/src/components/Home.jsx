import { useState } from "react";
import "../styling/Home.css";
import { createRoom, joinRoom } from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const Home = () => {
    const navigate = useNavigate();
    const [modalType, setModalType] = useState(null); // 'create' or 'join'
    const [inputValue, setInputValue] = useState({
        roomId: "",
        password: ""
    });
    const getUsernameFromCookie = () => {
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith('username='));

        return match ? decodeURIComponent(match.split('=')[1]) : null;
    };

    const closeModal = () => {
        setModalType(null);
        setInputValue("");
    };

    const handleSubmit = async () => {
        // console.log("username: ", getUsernameFromCookie());
        if (modalType === "create") {
            console.log("Create room:", inputValue);
            try {
                const roomDetails = await createRoom({
                    roomName: inputValue.roomId, password: inputValue.password, owner: getUsernameFromCookie()
                });
                console.log("roomDetails: ", roomDetails);
                toast.success("Room Created Successfully");
                navigate(`/room/${roomDetails.data.roomDetails.roomId}`);
            } catch (error) {
                toast.error("Room Creation Failed");
                console.log(error);
            }
        } else {
            console.log("Join room with ID:", inputValue);
            try {
                const roomDetails = await joinRoom({
                    roomId: inputValue.roomId, password: inputValue.password, username: getUsernameFromCookie()
                });
                console.log("roomDetails: ", roomDetails);
                toast.success(`Joined as ${getUsernameFromCookie()}`);
                navigate(`/room/${roomDetails.data.roomDetails.roomId}`);
            } catch (error) {
                toast.error("Invalid Credentials");
                console.log(error);
            }
        }
        closeModal();
    };

    return (
        <section className="home-container">
            <video autoPlay muted loop playsInline className="bg-video">
                <source src="/home-bg-video.mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="logo">
                <img src="/logo.png" alt="" />
            </div>

            <div className="home-box">
                <button className="home-btn" onClick={() => setModalType("create")}>
                    Create New Room
                </button>
                <button className="home-btn" onClick={() => setModalType("join")}>
                    Join Room
                </button>
            </div>

            {modalType && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2>{modalType === "create" ? "Name Your Room" : "Enter Room ID"}</h2>
                        <input
                            type="text"
                            value={inputValue.roomId}
                            onChange={(e) => setInputValue({ ...inputValue, roomId: e.target.value })}
                            placeholder={modalType === "create" ? "Room name..." : "Room ID..."}
                        />

                        <h2>{modalType === "create" ? "Set password" : "Enter Password"}</h2>
                        <input
                            type="text"
                            value={inputValue.password}
                            onChange={(e) => setInputValue({ ...inputValue, password: e.target.value })}
                            placeholder={modalType === "create" ? "Room name..." : "Room ID..."}
                        />
                        <div className="modal-actions">
                            <button onClick={handleSubmit}>Submit</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};