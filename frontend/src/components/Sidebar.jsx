import "../styling/Sidebar.css";
import { FaFileUpload, FaFileCode } from "react-icons/fa";
import { IoIosRefreshCircle, IoMdDownload } from "react-icons/io";
import { FaCircleInfo, FaCirclePlus } from "react-icons/fa6";
import { FcInfo } from "react-icons/fc";
import { RxAvatar } from "react-icons/rx";
import { useRef } from "react";
import { getFileContent, getRoomFiles, uploadFile, deleteFile, deleteFolder } from "../api/api";
import { useEffect } from "react";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FaFolder, FaTrash, FaFolderPlus } from "react-icons/fa";
import { toast } from "react-toastify";

export const Sidebar = ({ roomDetails, code, setCode, setActiveFileName, activeFileName, getUsernameFromCookie }) => {
    const [files, setFiles] = useState([]);
    const [modalType, setModalType] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const fileInputRef = useRef(null);
    const { roomId, password, owner, contributors } = roomDetails || {};

    const toggleFolder = (folderName) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderName)) {
                next.delete(folderName);
            } else {
                next.add(folderName);
            }
            return next;
        });
    };

    const organizeFiles = (filesList) => {
        const folders = {};
        const rootFiles = [];
        const folderNames = new Set(); // Track all folder names, even if empty

        filesList.forEach(file => {
            const fileName = file.fileName;
            
            if (fileName.includes('/')) {
                const [folderName, ...rest] = fileName.split('/');
                const fileInFolder = rest.join('/');
                
                // Track folder name even if it's just .gitkeep (empty folder)
                folderNames.add(folderName);
                
                // Skip .gitkeep files from display, but keep the folder
                if (fileInFolder === '.gitkeep') {
                    // Initialize folder if it doesn't exist
                    if (!folders[folderName]) {
                        folders[folderName] = [];
                    }
                    return; // Don't add .gitkeep to the file list
                }
                
                if (!folders[folderName]) {
                    folders[folderName] = [];
                }
                folders[folderName].push({ ...file, fileName: fileInFolder, fullPath: fileName });
            } else {
                rootFiles.push(file);
            }
        });

        // Ensure all tracked folders exist in the folders object (for empty folders)
        folderNames.forEach(folderName => {
            if (!folders[folderName]) {
                folders[folderName] = []; // Empty folder
            }
        });

        return { folders, rootFiles };
    };


    const closeModal = () => {
        setModalType(false);
        setNewFileName("");
        setNewFolderName("");
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

    useEffect(() => {
        const handleFilesUpdated = async () => {
            if (roomId) {
                try {
                    const res = await getRoomFiles(roomId);
                    const updatedFiles = res.data.files;
                    setFiles(updatedFiles);
                    
                    // Auto-expand folders when new files are added
                    const { folders } = organizeFiles(updatedFiles);
                    setExpandedFolders(prev => {
                        const next = new Set(prev);
                        Object.keys(folders).forEach(folder => next.add(folder));
                        return next;
                    });
                } catch (err) {
                    console.error(err);
                }
            }
        };
        window.addEventListener('filesUpdated', handleFilesUpdated);
        return () => window.removeEventListener('filesUpdated', handleFilesUpdated);
    }, [roomId]);

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

    const handleFileClick = async (e, fullPath = null) => {
        const filename = fullPath || e.target.innerText.trim();
        setActiveFileName(filename);
        try {
            const res = await getFileContent(filename);
            setCode(res.data.content);
        } catch (error) {
            setCode("Failed to load the contents of the file");
        }
    }

    const handleCreateNewFile = async () => {
        if (newFileName.length === 0) {
            toast.error("File Name cannot be empty");
            return;
        }
        if (!newFileName.match(/\.(cpp|py|js|java|c|h|hpp|cs|php|rb|go|rs|swift|kt|ts|jsx|tsx|md|html|css|json)$/)) {
            toast.error("Extension Not Valid");
            return;
        }
        try {
        await uploadFile({ fileName: newFileName, associatedRoomId: roomId, uploadedBy: getUsernameFromCookie(), fileContent: "" });
        setActiveFileName(newFileName);
        setNewFileName("");
        setCode("");
        fetchFiles();
        closeModal();
            toast.success("File created successfully");
        } catch (error) {
            toast.error("Failed to create file");
        }
    }

    const handleCreateFolder = async () => {
        if (newFolderName.length === 0) {
            toast.error("Folder Name cannot be empty");
            return;
        }
        
        // Validate folder name - allow letters, numbers, underscores, hyphens, and spaces
        const trimmedName = newFolderName.trim();
        if (trimmedName.length === 0) {
            toast.error("Folder Name cannot be empty");
            return;
        }
        
        // Sanitize folder name: replace invalid characters with underscores
        // Allow: letters, numbers, underscores, hyphens, spaces
        // Invalid: special chars like /, \, :, *, ?, ", <, >, |
        let folderName = trimmedName.replace(/[<>:"/\\|?*]/g, '_');
        
        // Check if folder already exists
        const { folders } = organizeFiles(files);
        if (folders[folderName]) {
            toast.error(`Folder "${folderName}" already exists`);
            return;
        }
        
        // Create a placeholder file to represent the folder
        const placeholderFile = `${folderName}/.gitkeep`;
        try {
            await uploadFile({ 
                fileName: placeholderFile, 
                associatedRoomId: roomId, 
                fileContent: "" 
            });
            
            // Close modal and reset state
            setNewFolderName("");
            closeModal();
            
            // Refresh files and auto-expand the new folder
            await fetchFiles();
            
            // Auto-expand the newly created folder
            setExpandedFolders(prev => {
                const next = new Set(prev);
                next.add(folderName);
                return next;
            });
            
            toast.success(`Folder "${folderName}" created successfully`);
        } catch (error) {
            console.error('Folder creation error:', error);
            toast.error(error.response?.data?.error || "Failed to create folder");
        }
    }

    const handleDeleteFileClick = async (fileName, e) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
            return;
        }
        try {
            await deleteFile({ fileName });
            toast.success("File deleted successfully");
            if (activeFileName === fileName) {
                setActiveFileName("");
                setCode("");
            }
            fetchFiles();
        } catch (error) {
            toast.error("Failed to delete file");
        }
    }

    const handleDeleteFolderClick = async (folderName, e) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete the folder "${folderName}" and all its files?`)) {
            return;
        }
        try {
            const res = await deleteFolder({ folderName, roomId });
            toast.success(res.data.message || "Folder deleted successfully");
            // Clear active file if it was in this folder
            if (activeFileName && activeFileName.startsWith(`${folderName}/`)) {
                setActiveFileName("");
                setCode("");
            }
            fetchFiles();
        } catch (error) {
            toast.error("Failed to delete folder");
        }
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
                <p className="company-name">౿ᑯꪱᜒ𝗍𝗋𝗈𐓣</p>
            </div>
            <div className="sidebar">
                <div className="file-section">
                    <div className="file-section-header">
                        <h2>FILES:</h2>
                        <div className="file-icons">
                            <FaFileUpload size={19} onClick={handleUploadIconClick} style={{ cursor: 'pointer' }} title="Upload File" />
                            <IoIosRefreshCircle size={21} onClick={fetchFiles} style={{ cursor: "pointer" }} title="Refresh" />
                            <FaCirclePlus size={19} onClick={() => setModalType('file')} style={{ cursor: 'pointer' }} title="Create File" />
                            <FaFolderPlus size={19} onClick={() => setModalType('folder')} style={{ cursor: 'pointer', color: '#4CAF50' }} title="Create Folder" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".cpp,.py,.js,.java,.c,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.ts,.jsx,.tsx"
                            onChange={handleFileChange}
                            placeholder="Upload code file"
                        />
                    </div>
                    <div className="files">
                        {/* Root files */}
                        {organizeFiles(files).rootFiles.map((file, index) => (
                            activeFileName === file.fileName ?
                                <div key={index} className="display-files" style={{ color: "yellowgreen", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaFileCode /> <p onClick={(e) => handleFileClick(e)} style={{ margin: 0, flex: 1 }}>{file.fileName}</p>
                                    <IoMdDownload onClick={handleDownload} style={{ cursor: 'pointer' }} title="Download" />
                                    <FaTrash onClick={(e) => handleDeleteFileClick(file.fileName, e)} style={{ cursor: 'pointer', color: '#ff4444' }} size={14} title="Delete" />
                                </div>
                                :
                                <div key={index} className="display-files" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaFileCode /> <p onClick={(e) => handleFileClick(e)} style={{ margin: 0, flex: 1 }}>{file.fileName}</p>
                                    <FaTrash onClick={(e) => handleDeleteFileClick(file.fileName, e)} style={{ cursor: 'pointer', color: '#ff4444' }} size={14} title="Delete" />
                                </div>
                        ))}
                        
                        {/* Folders */}
                        {Object.entries(organizeFiles(files).folders).map(([folderName, folderFiles]) => (
                            <div key={folderName}>
                                <div 
                                    className="display-files folder-header" 
                                    onClick={() => toggleFolder(folderName)}
                                    style={{ cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {expandedFolders.has(folderName) ? 
                                        <IoIosArrowDown size={16} /> : 
                                        <IoIosArrowForward size={16} />
                                    }
                                    <FaFolder size={16} style={{ color: '#FFA500' }} />
                                    <span style={{ marginLeft: '5px', flex: 1 }}>{folderName}</span>
                                    <FaTrash onClick={(e) => handleDeleteFolderClick(folderName, e)} style={{ cursor: 'pointer', color: '#ff4444' }} size={14} title="Delete Folder" />
                                </div>
                                {expandedFolders.has(folderName) && (
                                    folderFiles.length > 0 ? (
                                        folderFiles.map((file, index) => (
                                            <div key={index} className="display-files" style={{ marginLeft: '20px', paddingLeft: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {activeFileName === file.fullPath ?
                                                    <>
                                                        <FaFileCode /> <p onClick={(e) => handleFileClick(e, file.fullPath)} style={{ color: "yellowgreen", margin: 0, flex: 1 }}>{file.fileName}</p>
                                                        <IoMdDownload onClick={handleDownload} style={{ cursor: 'pointer' }} title="Download" />
                                                        <FaTrash onClick={(e) => handleDeleteFileClick(file.fullPath, e)} style={{ cursor: 'pointer', color: '#ff4444' }} size={14} title="Delete" />
                                                    </> :
                                                    <>
                                                        <FaFileCode /> <p onClick={(e) => handleFileClick(e, file.fullPath)} style={{ margin: 0, flex: 1 }}>{file.fileName}</p>
                                                        <FaTrash onClick={(e) => handleDeleteFileClick(file.fullPath, e)} style={{ cursor: 'pointer', color: '#ff4444' }} size={14} title="Delete" />
                                                    </>
                                                }
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ marginLeft: '20px', paddingLeft: '10px', color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
                                            (empty folder)
                                        </div>
                                    )
                                )}
                            </div>
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
                        <h4>Owner: <span>{owner?.username}</span></h4>
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

            {modalType === 'file' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New File</h2>
                        <input
                            type="text"
                            placeholder="Enter file name (e.g., main.cpp)"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateNewFile()}
                        />

                        <div className="modal-actions">
                            <button onClick={handleCreateNewFile}>Create</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {modalType === 'folder' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Folder</h2>
                        <input
                            type="text"
                            placeholder="Enter folder name (e.g., my_project)"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />

                        <div className="modal-actions">
                            <button onClick={handleCreateFolder}>Create</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}