import Carousel from "./Carousel";
import Camera from "parsegraph-camera";
import TimingBelt from "parsegraph-timingbelt";
import { BasicProjector, Projection } from "parsegraph-projector";
import CarouselAction from "./CarouselAction";
import { DefaultBlockPalette } from "parsegraph-block";
import { Projector, Projected } from "parsegraph-projector";
import Method from "parsegraph-method";
import { makeInverse3x3, matrixTransform2D } from "parsegraph-matrix";
import Color from "parsegraph-color";
import { GraphPainter } from "parsegraph-graphpainter";
import ActionCarousel from "./ActionCarousel";
import { Viewport } from "parsegraph-graphpainter";

const BACKGROUND_COLOR = new Color(
  0,
  47 / 255,
  57 / 255,
  1
  // 45/255, 84/255, 127/255, 1
);

class BG implements Projected {
  _update: Method;
  _camera: Camera;
  _text: string;

  constructor(cam: Camera) {
    this._update = new Method();
    this._camera = cam;
    this._text = "";
  }

  setOnScheduleUpdate(func: Function, obj?: object) {
    this._update.set(func, obj);
  }

  scheduleUpdate() {
    this._update.call();
  }

  tick() {
    return false;
  }

  paint(proj: Projector) {
    proj.glProvider().gl();
    proj.overlay();
    return false;
  }

  addText(str: string) {
    this._text += str + "\n";
    this.scheduleUpdate();
  }

  render(proj: Projector) {
    const cam = this._camera;
    proj.render();
    cam.setScale(1.0);
    cam.setSize(proj.width(), proj.height());
    cam.setOrigin(proj.width() / 2, proj.height() / 2);
    cam.zoomToPoint(1.0, proj.width() / 2, proj.height() / 2);
    proj.overlay().resetTransform();
    proj.overlay().clearRect(0, 0, proj.width(), proj.height());
    const gl = proj.glProvider().gl();
    gl.viewport(0, 0, proj.width(), proj.height());
    gl.clearColor(
      BACKGROUND_COLOR.r(),
      BACKGROUND_COLOR.g(),
      BACKGROUND_COLOR.b(),
      1
    );
    gl.clear(gl.COLOR_BUFFER_BIT);
    proj.overlay().fillStyle = "white";
    proj.overlay().font = "36px sans";
    proj.overlay().textBaseline = "top";
    proj.overlay().fillText(this._text, 0, 0);
    proj.overlay().textBaseline = "bottom";
    proj
      .overlay()
      .fillText(`${proj.width()}x${proj.height()}`, 0, proj.height());
    return false;
  }

  dispose() {}

  unmount() {}
}

document.addEventListener("DOMContentLoaded", () => {

  const palette = new DefaultBlockPalette();

  const belt = new TimingBelt();

  const proj = new BasicProjector();

  const rootBlock = palette.spawn("b");
  rootBlock.value().setLabel("Hello!");
  const viewport = new Viewport(rootBlock, BACKGROUND_COLOR);
  const carousel = new Carousel(viewport.camera());
  const ac = new ActionCarousel(carousel);
  ["Cut", "Copy", "Paste", "Delete"].forEach((cmd) => {
    ac.addAction(cmd, () => {
      alert(cmd);
    });
  });
  ac.install(rootBlock);

  rootBlock.value().setOnScheduleUpdate(() => viewport.scheduleUpdate());

  belt.addRenderable(new Projection(proj, viewport));
  belt.addRenderable(new Projection(proj, carousel));

  const root = document.getElementById("demo");
  root.appendChild(proj.container());
});
