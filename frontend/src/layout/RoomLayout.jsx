import { useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { Sidebar } from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { useEffect, useState } from "react";
import { getRoomDetails } from "../api/api";
import "../styling/RoomLayout.css";

export const RoomLayout = () => {
    const params = useParams();
    const [code, setCode] = useState();
    const [activeFileName, setActiveFileName] = useState("");
    const [msgModal, setMsgModal] = useState(false);

    const [roomDetails, setRoomDetails] = useState({});
    // console.log(params);
    const fetchRoomDetails = async () => {
        try {
            const res = await getRoomDetails({ roomId: params.id });
            // console.log(res.data.roomDetails);
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

    useEffect(() => {
        console.log("Active File: ", activeFileName);
    }, [activeFileName]);

    useEffect(() => {
        fetchRoomDetails();
    }, [params.id]);

    return (
        <div>
            <div className="main-container">
                <Sidebar roomDetails={roomDetails} code={code} setCode={setCode} setActiveFileName={setActiveFileName} activeFileName={activeFileName} getUsernameFromCookie={getUsernameFromCookie} />
                <CodeEditor code={code} setCode={setCode} activeFileName={activeFileName} msgModal={msgModal} setMsgModal={setMsgModal} />
            </div>
            {
                msgModal &&
                <div className="chatOverlay">
                    <ChatBox getUsernameFromCookie={getUsernameFromCookie} setMsgModal={setMsgModal} />
                </div>
            }
        </div>
    )
}