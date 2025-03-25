import React, { useState } from "react";

const BlobTest = () => {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file!");

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch('/api/blobtest', {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        setFileUrl(result.url);
    };

    return (
        <div>
            <h1>Upload to Azure Blob Storage</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {fileUrl && (
                <p>Uploaded File: <a href={fileUrl} target="_blank" rel="noopener noreferrer">View File</a></p>
            )}
        </div>
    );
};

export default BlobTest;
