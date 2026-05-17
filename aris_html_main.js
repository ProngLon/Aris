import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.183.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.183.0/examples/jsm/loaders/GLTFLoader.js";
import { AnimationMixer } from "https://cdn.jsdelivr.net/npm/three@0.183.0/build/three.module.js";
import { EXRLoader } from "https://cdn.jsdelivr.net/npm/three@0.183.0/examples/jsm/loaders/EXRLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.183.0/examples/jsm/controls/OrbitControls.js";
import { Raycaster } from "https://cdn.jsdelivr.net/npm/three@0.183.0/build/three.module.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "https://cdn.jsdelivr.net/npm/three@0.183.0/examples/jsm/renderers/CSS2DRenderer.js";
import { Vector2 } from "https://cdn.jsdelivr.net/npm/three@0.183.0/build/three.module.js";

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75, // 视野角度
  window.innerWidth / window.innerHeight, // 屏幕宽高比
  0.1, // 近平面（最近距离）
  1000, // 远平面（最远距离）
);

//CSS2D渲染器
const css_renderer = new CSS2DRenderer();
css_renderer.setSize(window.innerWidth, window.innerHeight);
css_renderer.domElement.style.pointerEvents = "none"; // 让点击穿透到 WebGL
document.body.appendChild(css_renderer.domElement); // 将CSS2D渲染器的DOM元素添加到页面中

//HDR天空
const hdrLoader = new EXRLoader();
hdrLoader.load("hdr/skyn1.exr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping; // 设置纹理映射方式
  texture.encoding = THREE.sRGBEncoding; // 设置纹理编码方式
  scene.background = texture; // 将HDR纹理设置为场景背景
  scene.environment = texture; // 将HDR纹理设置为环境光照
});
//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 柔和阴影

//启用PBR
renderer.outputEncoding = THREE.sRGBEncoding; // 设置输出编码方式
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 设置色调映射方式
renderer.toneMappingExposure = 1.0; // 设置色调映射曝光度
renderer.physicallyCorrectLights = true; // 启用物理正确的光照计算
document.body.appendChild(renderer.domElement);

//旋转相机（仅测试）
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); // 设置控制器的目标点为模型位置
controls.update(); //

const objects = []; // 用于射线检测
const partMap = new Map(); // 物体 -> 卡片对象，方便切换显示

//创建卡片
function createPart(parentObject, position, title, description) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "card";
  cardDiv.innerHTML = `<strong>${title}</strong><br>${description}`;
  const card = new CSS2DObject(cardDiv);
  card.position.copy(position); // 设置卡片位置
  card.visible = false; // 初始状态不可见
  scene.add(card); // 将卡片添加到场景
  partMap.set(parentObject, card); // 将对象与卡片关联
}

// 加载模型
const loader = new GLTFLoader();
loader.load("models/aris.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      objects.push(child);
      const title = "Aris";
      const description = "模型作者：冬瓜炒菜";
      createPart(child, child.position, title, description); // 创建卡片并关联到网格
      child.castShadow = true; // 启用投射阴影
      child.receiveShadow = true; // 启用接收阴影
    }
  });
});

//射线交互
const raycaster = new Raycaster();
const mouse = new THREE.Vector2();
let currentPart = null; // 当前选中的部件

function onMouseClick(event) {
  // 将鼠标位置转换为归一化设备坐标（NDC）
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera); // 从相机位置发出射线
  const intersects = raycaster.intersectObjects(objects); // 检测与场景中所有对象的交点
  if (intersects.length > 0) {
    const intersected = intersects[0].object; // 获取第一个交点的对象
    if (partMap.has(intersected) && currentPart !== intersected) {
      if (currentPart) {
        partMap.get(currentPart).visible = false; // 隐藏当前卡片
      }
      partMap.get(intersected).visible = true; // 显示新卡片
      currentPart = intersected; // 更新当前选中对象
    }
  } else {
    if (currentPart) {
      partMap.get(currentPart).visible = false; // 隐藏当前卡片
      currentPart = null; // 重置当前选中对象
    }
  }
}
window.addEventListener("mousemove", onMouseClick);
//动画

scene.add(camera);

camera.position.set(0, 2, 2); // 设置相机位置x、y、z
camera.lookAt(0, 0, 0); // 设置相机看向模型

// 渲染场景
function animate() {
  requestAnimationFrame(animate); // 循环调用动画函数
  //mixer.update(0.01); // 更新动画
  renderer.render(scene, camera); // 渲染场景
  css_renderer.render(scene, camera); // 渲染CSS2D标签
}
animate();
