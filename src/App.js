import { useState, useEffect, useRef } from "react";
import * as tmImage from "@teachablemachine/image";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { Audio } from "react-loader-spinner";
import { div } from "@tensorflow/tfjs-core";
import Spinner from "./components/Spinner";

function App() {
  const [tmModel, setTmModel] = useState(null);
  const [mobileNetModel, setMobileNetModel] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  const imageRef = useRef();
  const textInputRef = useRef();
  const fileInputRef = useRef();

  const loadMobileNetModel = async () => {
    const mnModel = await mobilenet.load();
    setMobileNetModel(mnModel);
  };

  const loadTmModel = async () => {
    setIsModelLoading(true);
    try {
      const tmModel = await tmImage.load(
        "https://teachablemachine.withgoogle.com/models/rUuqjz_Rg/model.json",
        "https://teachablemachine.withgoogle.com/models/rUuqjz_Rg/metadata.json"
      );
      setTmModel(tmModel);

      await loadMobileNetModel(); // Loading the MobileNet model
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setIsModelLoading(false);
    }
  };

  const uploadImage = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageURL(url);
    } else {
      setImageURL(null);
    }
  };

  const identify = async () => {
    setLoadingResults(true);

    if (!tmModel || !mobileNetModel) return;

    const tmResults = await tmModel.predict(imageRef.current);

    const hasHighProbability = tmResults.some(
      // (pred) => pred.probability >= 1
      (pred) => pred.probability >= 0.9
    );

    if (hasHighProbability) {
      setResults(
        tmResults.map((pred) => ({
          className: pred.className,
          probability: pred.probability,
        }))
      );
    } else {
      const mnResults = await mobileNetModel.classify(imageRef.current);
      setResults(
        mnResults.map((res) => ({
          className: res.className,
          probability: res.probability,
        }))
      );
    }
    setLoadingResults(false);
  };

  const handleOnChange = (e) => {
    setImageURL(e.target.value);
    setResults([]);
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    loadTmModel();
  }, []);

  useEffect(() => {
    if (imageURL) {
      setHistory([imageURL, ...history]);
    }
  }, [imageURL]);

  if (isModelLoading) {
    return <Spinner spinnerText={"Loading Models..."} />;
  }

  return (
    <div className="App">
      <h1 className="header">Image Identification</h1>
      <div className="main-container">
        <main>
          <div className="inputHolder">
            <input
              type="file"
              accept="image/*"
              capture="camera"
              className="uploadInput"
              onChange={uploadImage}
              ref={fileInputRef}
            />
            <button className="uploadImage" onClick={triggerUpload}>
              Upload Image
            </button>
            <span className="or">OR</span>
            <input
              type="text"
              placeholder="Paster image URL"
              ref={textInputRef}
              onChange={handleOnChange}
            />
          </div>
          <div className="mainWrapper">
            <div className="mainContent">
              <div className="imageHolder">
                {imageURL && (
                  <img
                    src={imageURL}
                    alt="Upload Preview"
                    crossOrigin="anonymous"
                    ref={imageRef}
                  />
                )}
              </div>

              <div className="resultsHolder">
                {loadingResults && (
                  <Spinner spinnerText={"Loading Results ..."} />
                )}

                {results.length > 0 && (
                  <>
                    {results.map((result, index) => {
                      const topScore = (result.probability * 100).toFixed(2);
                      return (
                        <div
                          className={
                            topScore > 44 ? `result top-score` : "result"
                          }
                          key={result.className}
                        >
                          <span className="name">{result.className}</span>
                          <span className="confidence">
                            Confidence level:{" "}
                            {(result.probability * 100).toFixed(2)}%
                            {topScore > 44 && (
                              <span className="bestGuess">Best Guess</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
            {imageURL && (
              <button className="button" onClick={identify}>
                Identify Image
              </button>
            )}
          </div>
          {history.length > 0 && (
            <div className="recentPredictions">
              <h2>Recent Images</h2>
              <div className="recentImages">
                {history.map((image, index) => {
                  return (
                    <div className="recentPrediction" key={`${image}${index}`}>
                      <img
                        src={image}
                        alt="Recent Prediction"
                        onClick={() => setImageURL(image)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
