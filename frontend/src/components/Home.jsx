import { useEffect, useRef, useState } from "react";
import "../styling/Home.css";
import { createRoom, joinRoom } from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export const Home = () => {
    const navigate = useNavigate();
    const [modalType, setModalType] = useState(null); // 'create' or 'join'
    const [avtarNumber, setAvtarNumber] = useState(Number(Math.floor(Math.random() * 10) + 1));
    const profileImage = useRef(null);
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
        if (modalType === "create") {
            try {
                const roomDetails = await createRoom({
                    roomName: inputValue.roomId, password: inputValue.password
                });
                toast.success(`Room Created Successfully as ${roomDetails.data.roomDetails.owner?.username || getUsernameFromCookie()}`);
                navigate(`/room/${roomDetails.data.roomDetails.roomId}`);
            } catch (error) {
                toast.error("Room Creation Failed");
            }
        } else {
            try {
                const roomDetails = await joinRoom({
                    roomId: inputValue.roomId, password: inputValue.password
                });
                toast.success(`Joined as ${roomDetails.data.roomDetails.contributors?.slice(-1)[0]?.username || getUsernameFromCookie()}`);
                navigate(`/room/${roomDetails.data.roomDetails.roomId}`);
            } catch (error) {
                toast.error("Invalid Credentials");
            }
        }
        closeModal();
    };

    const handleAvtarChange = (x) => {
        let next = avtarNumber + x;
        if (next === 11) next = 1;
        if (next === 0) next = 10;
        setAvtarNumber(next);
    }

    useEffect(() => {
    }, [avtarNumber]);

    const handleProfileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(png|jpg|jpeg|img)$/)) {
            alert('Please select a valid image');
            return;
        }

        try {
        } catch (error) {
            console.error('Error uploading file:', error);
        }
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
                <div className="avtar">
                    <FaChevronLeft size={40} className="chevron-icon" onClick={() => handleAvtarChange(-1)} />
                    <img src={`/avtars/${avtarNumber}.png`} alt="" width={160} onClick={() => profileImage.current.click()} />
                    <FaChevronRight size={40} className="chevron-icon" onClick={() => handleAvtarChange(1)} />
                </div>
                <button className="home-btn" onClick={() => setModalType("join")}>
                    Join Room
                </button>
            </div>

            <input
                type="file"
                ref={profileImage}
                style={{ display: 'none' }}
                accept=".img,.png,.jpg,.jpeg"
                onChange={handleProfileChange}
            />

            {modalType && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2>{modalType === "create" ? "Name Your Room" : "Enter Room ID"}</h2>
                        <input
                            type="text"
                            value={inputValue.roomId}
                            onChange={(e) => setInputValue({ ...inputValue, roomId: e.target.value })}
                            placeholder={modalType === "create" ? "Enter room name" : "Enter room ID"}
                        />

                        <h2>{modalType === "create" ? "Set password" : "Enter Password"}</h2>
                        <input
                            type="password"
                            value={inputValue.password}
                            onChange={(e) => setInputValue({ ...inputValue, password: e.target.value })}
                            placeholder="Enter password"
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