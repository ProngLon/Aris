console.log("Hi!Aris!");
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.183.2/examples/jsm/loaders/GLTFLoader.js";
import { AnimationMixer } from "https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.js";

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75, // 视野角度
  window.innerWidth / window.innerHeight, // 屏幕宽高比
  0.1, // 近平面（最近距离）
  1000, // 远平面（最远距离）
);
//创建光照
const light = new THREE.AmbientLight(0xffffff, 3); // 白色光，强度为3
scene.add(light);

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 加载模型
const loader = new GLTFLoader();
loader.load("./models/aris.glb", (gltf) => {
  scene.add(gltf.scene);
});

//动画
const mixer = new AnimationMixer(scene);
loader.load("./models/aris.glb", (gltf) => {
  const animations = gltf.animations; // 获取模型的动画数组
  mixer.clipAction(animations[0]).play(); // 播放第一个动画
});

scene.add(camera);

camera.position.set(0, 2, 2); // 设置相机位置x、y、z
camera.lookAt(0, 0, 0); // 设置相机看向模型

// 渲染场景
function animate() {
  requestAnimationFrame(animate); // 循环调用动画函数
  mixer.update(0.01); // 更新动画
  renderer.render(scene, camera, light); // 渲染场景
}
animate();
