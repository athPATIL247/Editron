import "../styling/Sidebar.css";
import { FaFileUpload, FaFileCode } from "react-icons/fa";
import { IoIosRefreshCircle, IoMdDownload } from "react-icons/io";
import { FaCircleInfo, FaCirclePlus } from "react-icons/fa6";
import { FcInfo } from "react-icons/fc";
import { RxAvatar } from "react-icons/rx";
import { useRef } from "react";
import { getFileContent, getRoomFiles, uploadFile } from "../api/api";
import { useEffect } from "react";
import { useState } from "react";

export const Sidebar = ({ roomDetails, code, setCode, setActiveFileName, activeFileName }) => {
    const [files, setFiles] = useState([]);
    const [modalType, setModalType] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const fileInputRef = useRef(null);
    const { roomId, password, owner, contributors } = roomDetails || {};

    const closeModal = () => {
        setModalType(null);
        setInputValue("");
    };

    useEffect(() => {
        console.log("active file changed");
    }, [activeFileName]);

    const fetchFiles = async () => {
        try {
            const res = await getRoomFiles(roomId);
            setFiles(res.data.files);
            // console.log(res.data.files);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (roomId) fetchFiles();
    }, [roomId]);

    const getUsernameFromCookie = () => {
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith('username='));
        return match ? decodeURIComponent(match.split('=')[1]) : null;
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check if file is a text/code file
        if (!file.type.includes('text/') && !file.name.match(/\.(cpp|py|js|java|c|h|hpp|cs|php|rb|go|rs|swift|kt|ts|jsx|tsx)$/)) {
            alert('Please select a valid code file');
            return;
        }

        try {
            const content = await file.text();
            const res = await uploadFile({ fileName: file.name, associatedRoomId: roomId, uploadedBy: getUsernameFromCookie(), fileContent: content });
            console.log("File uploaded succesfully: ", res);
            setActiveFileName(file.name);
            fetchFiles();
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleUploadIconClick = () => {
        fileInputRef.current.click();
    };

    const handleFileClick = async (e) => {
        const filename = e.target.innerText.trim();
        setActiveFileName(filename);
        try {
            const res = await getFileContent(filename);
            setCode(res.data.content);
        } catch (error) {
            setCode("Failed to load the contents of the file");
        }
    }

    const handleCreateNewFile = async () => {
        if (newFileName.length === 0) toast.alert("File Name cannot be empty");
        if (!newFileName.match(/\.(cpp|py|js|java|c|h|hpp|cs|php|rb|go|rs|swift|kt|ts|jsx|tsx)$/)) { toast.alert("Extention Not Valid"); }
        await uploadFile({ fileName: newFileName, associatedRoomId: roomId, uploadedBy: getUsernameFromCookie(), fileContent: "" });
        setActiveFileName(newFileName);
        setNewFileName("");
        setCode("");
        fetchFiles();
        closeModal();
    }

    const copyToClipboard = (element) => {
        const text = element.target.innerText;
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied: " + text);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    const handleDownload = () => {
        if (!activeFileName || !code) return;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <>
            <div className="company-logo">
                <img src="/logo.png" alt="editron" />
            </div>
            <div className="sidebar">
                <div className="file-section">
                    <div className="file-section-header">
                        <h2>FILES:</h2>
                        <div className="file-icons">
                            <FaFileUpload size={19} onClick={handleUploadIconClick} style={{ cursor: 'pointer' }} />
                            <IoIosRefreshCircle size={21} onClick={fetchFiles} style={{ cursor: "pointer" }} />
                            <FaCirclePlus size={19} onClick={() => setModalType(true)} style={{ cursor: 'pointer' }} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".cpp,.py,.js,.java,.c,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.ts,.jsx,.tsx"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="files">
                        {files.map((file, index) => (
                            activeFileName === file.fileName ?
                                <div key={index} className="display-files" style={{ color: "yellowgreen" }}><FaFileCode /> <p onClick={(e) => handleFileClick(e)}>{file.fileName}</p> <IoMdDownload onClick={handleDownload} style={{ cursor: 'pointer' }} /> </div>
                                :
                                <div key={index} className="display-files"><FaFileCode /> <p onClick={(e) => handleFileClick(e)}>{file.fileName} </p></div>
                        ))}
                    </div>
                </div>
                <hr />
                <div className="file-section" style={{ height: "fit-content" }}>
                    <div className="room-section-header">
                        <h2 style={{ fontSize: "1.3rem" }}>ABOUT ROOM</h2>
                        <div className="info-icon">
                            <FcInfo size={25} />
                        </div>
                    </div>
                    <div className="room-config">
                        <h4>Room ID: <span onClick={(e) => copyToClipboard(e)} style={{ cursor: "pointer" }}>{roomId}</span></h4>
                        <h4>Password: <span>{password}</span></h4>
                        <h4>Owner: <span>{owner}</span></h4>
                    </div>
                </div>
                <hr />
                <div className="contributors">
                    <div className="contributor-header">
                        <h2>CONTRIBUTORS</h2>
                    </div>
                    {contributors?.map((contributor, index) => (
                        <div key={index} className="display-contributor">
                            <RxAvatar /> <p>{contributor.username}</p>
                        </div>
                    ))}
                </div>
            </div>

            {modalType && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2>FileName.ext</h2>
                        <input
                            type="text"
                            placeholder="Enter File Name"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button onClick={handleCreateNewFile}>Create</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}