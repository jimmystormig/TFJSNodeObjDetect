const {createCanvas, Image} = require('canvas');
const fs = require('fs');
const path = require('path');

exports.loadImage = function (imagePath) {
    return new Promise(async (resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
        img.src = imagePath;
    });
}

exports.DrawPredictionsToCanvas = function (context, predictions){
    predictions.forEach(prediction => {
        DrawRectangleAndLabel(context, prediction.box.left, prediction.box.top, prediction.box.right, prediction.box.bottom, prediction.label, prediction.score);
    });
}

exports.CreateCanvasWithContext = function (img) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'yellow';
    ctx.drawImage(img, 0, 0);
    return {
        context: ctx,
        canvas: canvas
    };
}

exports.SavePredictionImage = function (canvas, imagePath, exportDir, model){
    return new Promise(async (resolve, reject) => {
        var exportPath = ExportPath(imagePath, exportDir, model);
        const out = fs.createWriteStream(exportPath);
        const stream = canvas.createJPEGStream()
        stream.pipe(out)
        out.on('error', (error) => resolve(error));
        out.on('finish', () => resolve(exportPath));
    });
}

function DrawRectangleAndLabel(context, left, top, right, bottom, label, score) {
    context.rect(left, top, right - left, bottom - top);
    context.stroke();
    context.fillText(score.toFixed(3) + ' ' + label, left, top - 10);
}

function ExportPath(imagePath, exportDir, suffix) {
    const filename = path.basename(imagePath);
    const fileExt = path.extname(filename);
    const detectImage = filename.replace(fileExt, "_" + suffix + fileExt);
    return path.join(exportDir, detectImage);
}