import React, { useEffect, useState, useRef } from "react";
import one from '../images/one.jpg'
import two from '../images/two.jpg'
import three from '../images/three.jpg'
import four from '../images/four.jpg'
import { Form } from "react-bootstrap";
import axios from "axios"

const Content = () => {
  
  const [data, setData] = useState(null);
  const images = [
    one,
    two,
    three,
    four
  ];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [timeLimit, setTimeLimit] = useState({
    days: 0
  });
  const handleTimeChange = (e, field) => {
    setTimeLimit({
      ...timeLimit,
      [field]: parseInt(e.target.value),
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const [showOptions, setShowOptions] = useState(false);

  const handleUploadClick = () => {
    setShowOptions(true);
  };

  const openFileInput = (captureType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (captureType) input.setAttribute("capture", captureType);
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileSelect(e);
      }
    };
    input.click();
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
        },
      };
  
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Camera access error:", error);
  
      if (error.name === "NotAllowedError") {
        alert("Camera access is blocked. Enable it in browser settings.");
      } else if (error.name === "OverconstrainedError") {
        alert("Back camera not available. Using front camera instead.");
        startCameraWithFrontCamera();
      }
    }
  };
  
  const startCameraWithFrontCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Front camera access failed:", error);
    }
  };
  

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
  };
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) {
        alert("No file selected!");
        return;
    }
    const formData = new FormData();
    formData.append("shirt_image", file);
    try {
        const response = await axios.post("http://localhost:8000/api/measure-shirt/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log(response.data);
        alert(`Chest Width: ${response.data.chest_width_cm} cm, Suggested Size: ${response.data.suggested_size}`);
        setShowModal(false);
        setData(response.data.suggested_size)
    } catch (error) {
        console.error("Error:", error);
        alert("Error uploading file!");
    }
};


  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container-fluid m-0 p-0 overflow-hidden">
        <div className="row mt-0 mt-lg-4">
          <p className="shirtName">Puma Men's Regular Fit T-shirt</p>
            <div className="col-lg-6 d-flex"> 
              <div className="thumbnailSide">
                  {images.map((img, index) => (
                  <img
                      key={index}
                      src={img}
                      alt="Thumbnail"
                      className="img-thumbnail my-1 ms-2 p-0"
                      onClick={() => setSelectedImage(img)}
                  />
                  ))}
              </div>
              <img src={selectedImage} width={650} alt="Product" className="img-fluid mainIamge" />
            </div>

            <div className="col-lg-4 d-flex flex-column align-items-start py-4 details">
                <div className="mb-2">
                  <h6 className= 'd-none d-lg-block mb-4'>Puma Men's Regular Fit T-shirt</h6>
                  <span className="first">Colour: <b>Electric Blue lemonade-white-black</b></span>
                </div>

                <div className="sizeDiv">
                  <span>Size:</span> <button>XS</button> <button>S</button> <button>M</button> <button>L</button> <button>XL</button> <button>XXL</button> <br />
                </div>

                <div className="mt-4 mb-2 ms-0 measureSection">  
                <input
                    type="file"
                    accept="image/*"
                    id="fileInput"
                    className="d-none"
                    onChange={handleImageChange}
                  />
                  
                  {!data ? <button className="mb-3 measureBtn" onClick={() => setShowModal(true)}>
                      Measure Your Size
                    </button> : <div>Your measured size is {data}</div>}
                    {/* Bootstrap Modal */}
                    {showModal && (
                      <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title">Select an Option</h5>
                              <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                              ></button>
                            </div>
                            <div className="modal-body text-center">
                            <button className="btn btn-primary" onClick={startCamera}>
                                Open Camera
                              </button>

                              <div className="mt-2 d-flex justify-content-center align-items-center">
                                <video ref={videoRef} autoPlay playsInline width="300" height="400"></video>
                                <canvas ref={canvasRef} width="300" height="400" className="d-none"></canvas>
                              </div>

                              <button className="btn measureBtnOption" onClick={captureImage}>
                                Capture Photo
                              </button>

                              {capturedImage && (
                                <div className="">
                                  <h5>Captured Image:</h5>
                                  <img src={capturedImage} alt="Captured" width="200" height='150' />
                                </div>
                              )}
                              <button className="mx-2 measureBtnOption" onClick={() => openFileInput(null)}>
                                Choose Photo
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Background blur effect when modal is open */}
                    {showModal && <div className="modal-backdrop fade show"></div>}
                  
                   <br />
                </div>
                <hr className="hrOne" />

                <div className="price">
                  <span className="me-1 tag">-55%</span>  <label><sup>₹</sup>669</label> <br />
                  <small>M.R.P.: <span className="mrp">₹1,499</span></small><br />
                  <label className="taxes">Inclusive of all taxes</label>
                </div>
                <hr className="hrOne" />

                <div className="product">
                  <strong>Product details</strong>
                  <table>
                    <tr>
                      <td><b>Fit type</b></td>
                      <td>Regular Fit</td>
                    </tr>

                    <tr>
                      <td><b>Sleeve type</b></td>
                      <td>Short Sleeve</td>
                    </tr>

                    <tr>
                      <td><b>Collar style</b></td>
                      <td>Band Collar</td>
                    </tr>

                    <tr>
                      <td><b>Length</b></td>
                      <td>Standard Length</td>
                    </tr>

                    <tr>
                      <td><b>Neck style</b></td>
                      <td>Crew Neck</td>
                    </tr>
                  </table>
                </div>
            </div>

            <div className="col-lg-2">
                <div className="">
                  <div className="d-flex flex-column justify-content-left align-items-start text-align-start ps-3 border">
                    <label className="ms-1"><sup>₹</sup>669<sup>00</sup></label>
                    <span className="my-3">FREE delivery on <strong>next four days</strong></span>
                    <span className="mb-5">or Fastest delivery on <strong>next two days</strong> with premium</span>

                    <h6>In stock</h6>
                    <table>
                      <tr>
                        <td width='40%'>Payment</td> <td>Secure Transaction</td>
                      </tr>

                      <tr>
                        <td>Ships from</td> <td>Inferals</td>
                      </tr>

                      <tr>
                        <td>Sold by</td> <td>Puma Sports India</td>
                      </tr>
                    </table>

                    <span className="mt-3 cashBack">₹20 cashback for every extra unit you buy (Upto ₹60)</span>

                    <strong className="mt-3 mb-2">Quantity</strong>
                    <Form.Select value={timeLimit.days} onChange={(e) => handleTimeChange(e, 'days')}>
                                <option value={0}>0</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                <option value={6}>6</option>
                                <option value={7}>7</option>
                                <option value={8}>8</option>
                                <option value={9}>9</option>
                                <option value={10}>10</option>
                                <option value={11}>11</option>
                                <option value={12}>12</option>
                                <option value={13}>13</option>
                                <option value={14}>14</option>
                                <option value={15}>15</option>
                                <option value={16}>16</option>
                                <option value={17}>17</option>
                                <option value={18}>18</option>
                                <option value={19}>19</option>
                                <option value={20}>20</option>
                                <option value={21}>21</option>
                                <option value={22}>22</option>
                                <option value={23}>23</option>
                                <option value={24}>24</option>
                                <option value={25}>25</option>
                                <option value={26}>26</option>
                                <option value={27}>27</option>
                                <option value={28}>28</option>
                                <option value={29}>29</option>
                                <option value={30}>30</option>
                                <option value={31}>31</option>
                    </Form.Select>

                    <button className="my-3 one">Add to cart</button>
                    <button className="mb-3 two">Buy now</button>
                  </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Content;
