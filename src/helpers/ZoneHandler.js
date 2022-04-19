export default class ZoneHandler {
    constructor(scene) {
        this.renderZone = (x, y, width, height) => {
            let dropZone = scene.add.zone(x, y, width, height).setRectangleDropZone(width, height);
            dropZone.setData({
                "cards": 0
            });

            return dropZone;
        }

        this.renderOutline = (graphic, dropZone, color) => {
            let dropZoneOutline = graphic;
            dropZoneOutline.lineStyle(4, color);
            dropZoneOutline.strokeRect(
                dropZone.x - dropZone.input.hitArea.width / 2,
                dropZone.y - dropZone.input.hitArea.height / 2,
                dropZone.input.hitArea.width,
                dropZone.input.hitArea.height
            );
            return dropZoneOutline;
        }
    }
}