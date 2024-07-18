import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Upload() {
  const [searchParams] = useSearchParams(); // [URLSearchParams object, setter function]
  const [socket, setSocket] = useState(null);
  const [images, setImages] = useState([]); // State to store captured images
  const [imageFiles, setImageFiles] = useState([]); // State to store original File objects
  const userId = searchParams.get("token");

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL, {
      query: { userId },
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (socket) {
      socket.emit("startedUpload", { userId });
    }
  }, [socket, userId]);

  function fileSelectHandler() {
    // Select files from mobile
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.click();

    // Listen for file selection
    fileInput.addEventListener("change", handleFileChange);
  }

  function captureImageHandler() {
    // Take Image from Camera
    const cameraInput = document.createElement("input");
    cameraInput.type = "file";
    cameraInput.accept = "image/*";
    cameraInput.capture = "environment";
    cameraInput.click();

    // Listen for the change event on the camera input
    cameraInput.addEventListener("change", handleCapture);
  }

  function handleFileChange(event) {
    const files = Array.from(event.target.files);
    console.log("Selected Files: ", files);

    // Handle file upload logic here
    if (files.length > 0) {
      setImageFiles((prevFiles) => [...prevFiles, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result;
          console.log("Image Data: ", imageData);
          setImages((prevImages) => [...prevImages, imageData]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  function handleCapture(event) {
    const files = event.target.files;
    console.log("Captured Image: ", files);

    if (files.length > 0) {
      setImageFiles((prevFiles) => [...prevFiles, ...files]);
      const image = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        console.log("Image Data: ", imageData);
        setImages((prevImages) => [...prevImages, imageData]);
      };
      reader.readAsDataURL(image);
    }
  }

  function removeImage(index) {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }

  function finalizeUpload() {
    // Add Images to FormData
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    axios.post(`${process.env.REACT_APP_BACKEND_URL}/mobile-uploads?token=1234567890`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then((response) => {
      console.log("Upload Response: ", response.data);
      setImages([]);
      setImageFiles([]);
    }).catch((error) => {
      console.error("Upload Error: ", error);
    });

    // Optionally reset images state after upload
    
  }

  return (
    <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-dark text-white p-4">
      <div className="col-lg-6 col-md-8 col-sm-10 col-12 text-center">
        <h1>Upload Component</h1>
        <hr className="bg-white" />
        {/* File Upload from Mobile*/}
        <input
          type="file"
          className="form-control bg-dark text-white d-none"
          name=""
          id=""
          placeholder=""
          aria-describedby="fileHelpId"
          accept="image/*"
        />
        {/* Button to manually select files */}
        <div className="d-flex justify-content-center align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={fileSelectHandler}
          >
            Select Files
          </button>
          {/* Button to Capture using Camera */}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={captureImageHandler}
          >
            Capture Image
          </button>
        </div>
      </div>

      {/* Render Images if available */}
      {images.length > 0 && (
        <div className="col-lg-6 col-md-8 col-sm-10 col-12 mt-4">
          <h2 className="text-center">Preview</h2>
          <hr className="bg-white" />
          <div className="row gap-2 align-items-center justify-content-center">
            {images.map((image, index) => (
              <div className="col-3 border p-2 rounded-3 border-secondary position-relative text-center mb-2" key={index}>
                <img
                  src={image}
                  alt={`Uploaded ${index}`}
                  className="rounded-3 object-fit-contain w-100"
                  height={96}
                  width={96}
                />
                <button
                  type="button"
                  className="btn btn-close position-absolute top-0 end-0 rounded-circle bg-danger"
                  aria-label="Close"
                  onClick={() => removeImage(index)}
                />
              </div>
            ))}
          </div>
          {/* Finalize button */}
          <div className="d-flex justify-content-center mt-3">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={finalizeUpload}
            >
              Finalize Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
