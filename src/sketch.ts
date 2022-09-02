import { Axis } from "./axis";
import { Branch } from "./branch";
import { Ground } from "./ground";
import { LinearGradient, LinearGradientAttributes } from "./gradient";
import { Text } from "./text";
import Drawable from "./drawable";

import p5, { Font, Vector } from "p5";

/**
 * Canvas handler.
 */
export default class Sketch {
    /** Pre-configured objects to be drawn on the canvas. */
    objects: Drawable[];

    minTreeZ = 200;
    maxTreeZOffset: number;
    titleFont: Font;
    subtitleFont: Font;
    backgroundColorValue = "#644063";

    /**
     * Sets the preload(), setup(), and draw() methods on a p5 instance.
     * @param p p5 instance.
     */
    constructor(p: p5) {
        p.preload = () => this.preload(p);
        p.setup = () => this.setup(p);
        p.draw = () => this.draw(p);
    }

    private preload(p: p5): void {
        this.titleFont = p.loadFont("fonts/noto/NotoSansMono-Bold.ttf");
        this.subtitleFont = p.loadFont("fonts/noto/NotoSansMono-Regular.ttf");
    }

    /**
     * Called once in the initialization of the canvas by the p5 instance to
     * define initial environment properties and load any required resources.
     * @param p p5 instance.
     */
    private setup(p: p5): void {
        p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
        window.onresize = () => this.onresize(p);
        this.maxTreeZOffset = p.height * 6;
        this.createObjects(p);
    }

    /**
     * (Re)creates drawable objects.
     * @param p p5 instance.
     */
    private createObjects(p: p5): void {
        this.objects = [];

        // Title.
        // TODO(Natalie): Properly horizontally center text.
        let titleContent = "Welcome to Antheia";
        let titleSize = p.height / 20;
        let titleStartX = (-titleContent.length * titleSize) / 4;
        let titleStartY = titleSize - (p.height / 4);
        let labelContent = "A graphical demo of a psuedo-randomly generated garden.";
        let labelSize = titleSize / 2;
        let labelStartX = (-labelContent.length * labelSize) / 4;
        let labelStartY = titleStartY + labelSize + 12;
        this.objects.push(new Text({
            content: titleContent,
            font: this.titleFont,
            startX: titleStartX,
            startY: titleStartY,
            size: titleSize,
            fillColorAttribs: {red: 255, green: 255, blue: 255}
        }));
        this.objects.push(new Text({
            content: labelContent,
            font: this.subtitleFont,
            startX: labelStartX,
            startY: labelStartY,
            size: labelSize,
            fillColorAttribs: {red: 255, green: 255, blue: 255}
        }));

        // Ground.
        let groundWidthLength = 2 * (this.minTreeZ + this.maxTreeZOffset);
        let groundDepth = 100;
        this.objects.push(new Ground({
            colorAttribs: { red: 10, green: 50, blue: 10 },
            translation: new Vector(
                0,
                p.height / 2
            ),
            width: groundWidthLength,
            length: groundWidthLength,
            depth: groundDepth
        }));

        // Skybox.
        // TODO(Natalie): Fix corner rendering glitches on camera rotation.
        let skyboxWidth = 2 * (this.minTreeZ + this.maxTreeZOffset);
        let skyboxAttribs: LinearGradientAttributes = {
            startX: -skyboxWidth / 2,
            startY: -1500 - groundDepth,
            width: skyboxWidth,
            height: this.maxTreeZOffset / 2,
            colorFrom: p.color(this.backgroundColorValue),
            colorTo: p.color("#000000"),
            axis: Axis.Y
        }
        let skyboxTranslateZ = -this.minTreeZ - this.maxTreeZOffset;
        for (let orientY = 2; orientY >= -1; --orientY) {
            this.objects.push(new LinearGradient(skyboxAttribs,
                skyboxTranslateZ,
                orientY * p.PI / 2
            ))
        }

        // Trees.
        // TODO(Natalie): Extend drawing to left and right of the initial camera.
        // TODO(Natalie): Prevent re-calculation of pseudo-random attributes on
        // resize.
        let translations: Vector[] = [];
        for (let orientZ = 1; orientZ >= -1; orientZ -= 2) {
            for (let orientX = 1; orientX >= -1; orientX -= 2) {
                for (let i = 0; i < 10;) {
                    let trunkHeight =
                        100 + (Math.random() * 200);
                    let baseTranslateZ =
                        200 + (Math.random() * this.maxTreeZOffset);

                    let translation = new Vector(
                        orientX * ((Math.random() - 0.5) * p.width * 2),
                        (p.height / 2) - (trunkHeight / 2),
                        orientZ * baseTranslateZ
                    );

                    if (translations.indexOf(translation) != -1)
                        continue;
                    translations.push(translation);

                    this.objects.push(new Branch({
                        radius: 4 + (Math.random() * 2),
                        length: trunkHeight,
                        minLength: 4 + (baseTranslateZ * 0.01),
                        colorAttribs: { red: 200, green: 200, blue: 200 },
                        altColorAttribs: {
                            red: 200 + Math.random() * 55,
                            green: 0,
                            blue: 200 + Math.random() * 55
                        },
                        minLengthAltColor: 10 + (Math.random() * 70),
                        angleDeviation: p.PI / (3 + (Math.random() * 8)),
                        lengthMultiplier: 2 / 3,
                        radiusMultiplier: 2 / 3
                    }, translation));

                    ++i;
                }
            }
        }
    }

    /**
     * Called directly after setup to handle drawing to the canvas. The contents
     * of the function are continuously executed until the program is stopped or
     * p5.noLoop() is called.
     * @param p p5 instance.
     */
    private draw(p: p5): void {
        p.background(this.backgroundColorValue);

        // Configure 3D controls.
        p.orbitControl(5, 5, 0.05);

        // Draw pre-configured objects.
        this.objects.forEach(function (object, _index, _array): void {
            object.draw(p);
        });

        // TODO(Natalie): Animated clouds.
        // TODO(Natalie): Lighting.
    }

    /**
     * Called upon resize of the window. Resizes the canvas to the current
     * window size and recreates objects.
     * @param p p5 instance.
     */
    private onresize(p: p5): void {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        this.createObjects(p);
    }
}