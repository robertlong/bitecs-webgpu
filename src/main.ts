import "./style.css";
import gltfUrl from "./triangle.gltf?url";
import { WebIO } from "@gltf-transform/core";
import { MaterialsUnlit } from "@gltf-transform/extensions";

async function main() {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw new Error("No adapter detected");
  }

  const device = await adapter.requestDevice();

  if (!device) {
    throw new Error("No device detected");
  }

  const canvas = document.querySelector<HTMLCanvasElement>("canvas");

  if (!canvas) {
    throw new Error("No canvas element");
  }

  const context = canvas.getContext("webgpu");

  if (!context) {
    throw new Error("WebGPU context not supported");
  }

  context.configure({
    device,
    format: "bgra8unorm",
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });

  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: "depth24plus-stencil8",
    dimension: "2d",
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });
  const depthTextureView = depthTexture.createView();
  const colorTexture = context.getCurrentTexture();
  const colorTextureView = colorTexture.createView();

  const io = new WebIO();
  io.registerExtensions([MaterialsUnlit]);
  const doc = await io.read(gltfUrl);
  const root = doc.getRoot();
  const triangleMesh = root.listMeshes()[0];
  const trianglePrimitives = triangleMesh.listPrimitives();
  const positionAccessor = trianglePrimitives[0].getAttribute("POSITION")!;
  const positionArr = positionAccessor.getArray();

  console.log(positionArr);
}

main().catch(console.error);
