import { useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { Sidebar } from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { useEffect, useState } from "react";
import { getRoomDetails } from "../api/api";
import "../styling/RoomLayout.css";
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons

export const RoomLayout = () => {
    const params = useParams();
    const [code, setCode] = useState();
    const [activeFileName, setActiveFileName] = useState("");
    const [msgModal, setMsgModal] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 900);

    const [roomDetails, setRoomDetails] = useState({});

    const fetchRoomDetails = async () => {
        try {
            const res = await getRoomDetails({ roomId: params.id });
            setRoomDetails(res.data.roomDetails);
        } catch (error) {
            console.log("error: ", error);
        }
    }

    
    const getUsernameFromCookie = () => {
        const match = document.cookie
        .split('; ')
        .find(row => row.startsWith('username='));
        return match ? decodeURIComponent(match.split('=')[1]) : null;
    };
    
    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 900) {
                setSidebarVisible(true);
            } else {
                setSidebarVisible(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
        console.log("Active File: ", activeFileName);
    }, [activeFileName]);
    
    useEffect(() => {
        fetchRoomDetails();
    }, [params.id]);
    
    useEffect(() => {
        fetchRoomDetails();
    }, []);

    return (
        <div>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <FaBars />
            </button>

            <div className="main-container">
                <div className={`sidebar-container ${sidebarVisible ? 'active' : ''}`}>
                    {sidebarVisible && window.innerWidth < 900 && (
                        <button className="sidebar-close" onClick={toggleSidebar}>
                            <FaTimes />
                        </button>
                    )}
                    <Sidebar
                        roomDetails={roomDetails}
                        code={code}
                        setCode={setCode}
                        setActiveFileName={setActiveFileName}
                        activeFileName={activeFileName}
                        getUsernameFromCookie={getUsernameFromCookie}
                    />
                </div>
                <CodeEditor
                    code={code}
                    setCode={setCode}
                    activeFileName={activeFileName}
                    msgModal={msgModal}
                    setMsgModal={setMsgModal}
                />
            </div>

            {msgModal && (
                <div className="chatOverlay">
                    <ChatBox
                        getUsernameFromCookie={getUsernameFromCookie}
                        setMsgModal={setMsgModal}
                    />
                </div>
            )}
        </div>
    );
};