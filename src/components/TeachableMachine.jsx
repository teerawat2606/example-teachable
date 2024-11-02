import React, { useEffect, useRef, useState } from "react"
import * as tmImage from "@teachablemachine/image"

const MODEL_URL = "/public/model/" // Update this with the URL of your model

const TeachableMachineImage = () => {
  const [isModelLoading, setModelLoading] = useState(true)
  const [predictions, setPredictions] = useState([])
  const webcamRef = useRef(null)
  let webcam
  let model

  // Initialize the model and webcam
  useEffect(() => {
    async function loadModel() {
      try {
        model = await tmImage.load(
          MODEL_URL + "model.json",
          MODEL_URL + "metadata.json"
        )
        const maxPredictions = model.getTotalClasses()
        setModelLoading(false)

        webcam = new tmImage.Webcam(640, 480, true) // width, height, flip
        await webcam.setup() // request webcam access
        if (webcamRef.current) {
          webcamRef.current.appendChild(webcam.canvas)
          webcam.play()
          window.requestAnimationFrame(loop)
        }
      } catch (error) {
        console.error("Failed to load model or webcam setup:", error)
      }
    }

    loadModel()

    return () => {
      if (webcam) {
        webcam.stop()
      }
    }
  }, [])

  // Loop to continuously capture webcam data and classify images
  const loop = async () => {
    webcam.update() // update the webcam frame
    await predict()
    window.requestAnimationFrame(loop)
  }

  // Make prediction using the loaded model
  const predict = async () => {
    const prediction = await model.predict(webcam.canvas)
    const newPredictions = prediction.map((pred) => ({
      className: pred.className,
      probability: (pred.probability.toFixed(2) * 100).toFixed(2),
    }))
    setPredictions(newPredictions)
  }

  return (
    <div>
      <div ref={webcamRef}></div>
      {isModelLoading ? (
        <p>Loading model...!!!!</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {predictions.map((pred, index) => {
            if (pred.probability > 80) {
              return (
                <div key={index}>
                  <h1
                    style={{ color: "red" }}
                  >{`${pred.className}: ${pred.probability}%`}</h1>{" "}
                </div>
              )
            }
            return (
              <div key={index}>{`${pred.className}: ${pred.probability}%`}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TeachableMachineImage
