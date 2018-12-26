const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const express = require('express');
const app = express();
const port = 3001;
const rfcnResnet101CocoService = require('./models/RfcnResnet101CocoService');
const imager = require('./imager');

app.post('/predict', async (req, res) => {
    try {
        var result = await Predict(req.query.image, req.query.exportdir, req.query.model);
        res.send(result);
    } catch (error) {
        res.status(400);
        res.send(error);
    }
});

app.listen(port, async () => {
    await rfcnResnet101CocoService.loadModel();
    console.log(`TfObjDetect listening on port ${port}!`);
});

async function Predict(imagePath, exportDir, model) {
    return new Promise(async (resolve, reject) => {

        if(model != "rfcn_resnet101_coco") {
            reject("Model '" + model + "' not supported");
            return;
        }

        let img;
        try {
            console.time("load_image");
            img = await imager.loadImage(imagePath);
            console.timeEnd("load_image");
            console.log(`image ${imagePath} loaded`);
        } catch (error) {
            reject(error);
        }

        let canvasWithContext = imager.CreateCanvasWithContext(img);       
        let tensors = tf.fromPixels(canvasWithContext.canvas);
        console.log(`image converted to tensors`);

        console.time("predict_resnet");
        let predictionResult = await rfcnResnet101CocoService.predict(tensors);
        console.timeEnd("predict_resnet");

        let exportPath;
        try {
            console.time("save_image");
            imager.DrawPredictionsToCanvas(canvasWithContext.context, predictionResult.predictions);
            exportPath = await imager.SavePredictionImage(canvasWithContext.canvas, imagePath, exportDir, model);
            console.timeEnd("save_image");
            console.log(`image ${exportPath} saved`);
        } catch (error) {
            reject(error);
        }

        resolve({ 
            "predictions": predictionResult.predictions,
            'pathToPredictionImage': exportPath,
            'anyPersonDetected': predictionResult.anyPersonDetected
        });
    });
}