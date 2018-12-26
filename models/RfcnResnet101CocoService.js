const labels = require('./mscoco_label_map.pbtxt.json');
const tf = require('@tensorflow/tfjs');
global.fetch = require('node-fetch');

let model;

exports.loadModel = async function() {
    return new Promise(async (resolve, reject) => {
        const resnetModelDir = "file:///" + __dirname + "/rfcn_resnet101_coco_20180128/";
        model = await tf.loadFrozenModel(resnetModelDir + "tensorflowjs_model.pb", resnetModelDir + "weights_manifest.json");
        resolve();
    });
}

exports.predict = async function (tensors) {
    var pixelsShape = tensors.shape;
    var height = pixelsShape[0];
    var width = pixelsShape[1];

    let input = tf.reshape(tensors, [-1, height, width, pixelsShape[2]]);
    var prediction = await model.executeAsync(input);

    var detection_boxes = await prediction[0].data();
    var detection_scores = await prediction[1].data();
    var detection_classes = await prediction[2].data();
    var num_detections = await prediction[3].data();

    let anyPersonDetected = false;
    let predictions = [];
    for (let i = 0; i < num_detections[0]; i++) {
        var classId = detection_classes[i];

        var label = labels.find(l => l.id === classId).display_name;

        if(classId === 1){
            anyPersonDetected = true;
        }

        var boxIndex = i > 0 ? i * 4 : 0;
        var left = detection_boxes[boxIndex + 1] * width;
        var top = detection_boxes[boxIndex] * height;
        var bottom = detection_boxes[boxIndex + 2] * height;
        var right = detection_boxes[boxIndex + 3] * width;
        
        predictions.push({
            "classId": classId,
            "label": label,
            "score": detection_scores[i],
            "box": {
                "left": left,
                "top": top,
                "bottom": bottom,
                "right": right
            }
        });
    }

    return {
        predictions: predictions,
        anyPersonDetected: anyPersonDetected
    }
}