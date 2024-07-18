import { QRCode } from "react-qrcode-logo";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import './TestForm.css';

export default function TestForm() {
  const [qrCodeData, setQRCodeData] = useState({});
  const [isQRScanned, setIsQRScanned] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [images, setImages] = useState([]);

  const logoPath = "/TechBazaar.png";
  const userId = "1234567890";

  function generateQRCode(data) {
    // Generate QR code data based on form data (if needed)
    const qrCodeValue = `${process.env.REACT_APP_BASE_URL}/upload?token=1234567890`;
    setQRCodeData({
      logo: logoPath,
      value: qrCodeValue,
    });
  }

  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_URL, {
      query: {userId},
    });
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
    socket.on("uploadComplete", (data) => {
      console.log("Image Upload Completed: ", data);
      if (data && data.length > 0) {
        setImages(data);
        setIsUploadComplete(true);
      }
    });
    socket.on("uploadStarted", (data) => {
      console.log("Image Upload Started: ", data);
      setIsQRScanned(true);
    });
    socket.on("qrScanned", (data) => {
      console.log("Form Page: QR Code Scanned: ", data);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-100 vh-100 d-flex justify-content-center align-items-center bg-dark text-white">
      <div class="container">
        <div className="row justify-content-center">
          <form className="d-flex flex-column gap-3 col-8 p-3">
            <div className="row">
              <div className="col-12">
                <h4 className="text-center">Test Form</h4>
              </div>
              <hr />
            </div>
            <div className="row align-items-center">
              <div className="col-4 text-center">
                <label for="title" className="form-label">
                  Title
                </label>
              </div>
              <div className="col-8">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="title"
                />
              </div>
            </div>
            <div className="row align-items-center">
              {/* Price */}
              <div className="col-4 text-center">
                <label for="price" className="form-label">
                  Price
                </label>
              </div>
              <div className="col-8">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  id="price"
                />
              </div>
            </div>
            <div className="row align-items-center py-5 border rounded-3">
              <div className="col-12 mx-auto text-center align-items-center justify-content-center d-flex">
              {isUploadComplete ? (
                <div className="d-flex justify-content-center align-items-center">
                  {images.map((image, index) => (
                    <div className="qr_container text-center" key={index}>
                      <img
                        src={`${process.env.REACT_APP_BUCKET_URL}/${image}`}
                        alt={`Uploaded ${index}`}
                        className="rounded-3 object-fit-contain w-100 h-100"
                      />
                    </div>
                  ))}
                </div>
              ) :
              isQRScanned ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>
                      <span className="ms-2">QR Code Scanned. Please Upload Image(s) to Continue</span>
                    </div>
                  </div>
                ) : Object.keys(qrCodeData).length > 0 ? (
                  <div className={`qr_container`}>
                    <QRCode
                    value={qrCodeData.value}
                    size={256}
                    eyeRadius={48}
                    fgColor="#100045"
                    eyeColor="#9e3ce7"
                    ecLevel="Q"
                    logoImage={qrCodeData.logo}
                    qrStyle="dots"
                    logoPadding={8}
                    logoPaddingStyle="circle"
                    logoWidth={64}
                    logoHeight={64}
                    removeQrCodeBehindLogo={true}
                  />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-3"
                    onClick={generateQRCode}
                  >
                    Generate QR Code
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
