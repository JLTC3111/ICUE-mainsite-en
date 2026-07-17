import{r as x,j as it}from"./index-wNu0m-Yv.js";import{V as T,as as W,S as w,bg as rt,bh as at,bi as nt,au as ot,aS as O,v as ue,bj as m,bk as de,aJ as Te,a4 as Ge,Y as ke,f as Ve,b3 as oe,K as le,aV as k,af as lt,aG as Re,d as We,am as Ye,b0 as Y,aH as Xe,a2 as ct,bl as ut,G as Ke,ab as je,B as dt,e as Pe,bm as Fe,aU as ft,N as ht,m as vt,aN as pt,a3 as A}from"./three.module-Cjd5mhDv.js";/**
 * postprocessing v6.39.2 build Sun Jun 28 2026
 * https://github.com/pmndrs/postprocessing
 * Copyright 2015-2026 Raoul van Rüschen
 * @license Zlib
 */var mt=(()=>{const e=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),t=new Float32Array([0,0,2,0,0,2]),s=new dt;return s.setAttribute("position",new Pe(e,3)),s.setAttribute("uv",new Pe(t,2)),s})(),B=class Ee{static get fullscreenGeometry(){return mt}constructor(t="Pass",s=new Te,i=new Ge){this.name=t,this.renderer=null,this.scene=s,this.camera=i,this.screen=null,this.rtt=!0,this.needsSwap=!0,this.needsDepthBlit=!1,this.needsDepthTexture=!1,this.enabled=!0}get renderToScreen(){return!this.rtt}set renderToScreen(t){if(this.rtt===t){const s=this.fullscreenMaterial;s!==null&&(s.needsUpdate=!0),this.rtt=!t}}set mainScene(t){}set mainCamera(t){}setRenderer(t){this.renderer=t}isEnabled(){return this.enabled}setEnabled(t){this.enabled=t}get fullscreenMaterial(){return this.screen!==null?this.screen.material:null}set fullscreenMaterial(t){let s=this.screen;s!==null?s.material=t:(s=new ke(Ee.fullscreenGeometry,t),s.frustumCulled=!1,this.scene===null&&(this.scene=new Te),this.scene.add(s),this.screen=s)}getFullscreenMaterial(){return this.fullscreenMaterial}setFullscreenMaterial(t){this.fullscreenMaterial=t}getDepthTexture(){return null}setDepthTexture(t,s=de){}render(t,s,i,r,a){throw new Error("Render method not implemented!")}setSize(t,s){}initialize(t,s,i){}dispose(){for(const t of Object.keys(this)){const s=this[t];(s instanceof O||s instanceof Ke||s instanceof je||s instanceof Ee)&&this[t].dispose()}this.fullscreenMaterial!==null&&this.fullscreenMaterial.dispose()}},gt=class extends B{constructor(){super("ClearMaskPass",null,null),this.needsSwap=!1}render(e,t,s,i,r){const a=e.state.buffers.stencil;a.setLocked(!1),a.setTest(!1)}},St=`#ifdef COLOR_WRITE
#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#endif
#ifdef DEPTH_WRITE
#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}
#endif
#ifdef USE_WEIGHTS
uniform vec4 channelWeights;
#endif
uniform float opacity;varying vec2 vUv;void main(){
#ifdef COLOR_WRITE
vec4 texel=texture2D(inputBuffer,vUv);
#ifdef USE_WEIGHTS
texel*=channelWeights;
#endif
gl_FragColor=opacity*texel;
#ifdef COLOR_SPACE_CONVERSION
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
#else
gl_FragColor=vec4(0.0);
#endif
#ifdef DEPTH_WRITE
gl_FragDepth=readDepth(vUv);
#endif
}`,Ze="varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}",$e=class extends k{constructor(){super({name:"CopyMaterial",defines:{COLOR_SPACE_CONVERSION:"1",DEPTH_PACKING:"0",COLOR_WRITE:"1"},uniforms:{inputBuffer:new m(null),depthBuffer:new m(null),channelWeights:new m(null),opacity:new m(1)},blending:Y,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:St,vertexShader:Ze}),this.depthFunc=ut}get inputBuffer(){return this.uniforms.inputBuffer.value}set inputBuffer(e){const t=e!==null;this.colorWrite!==t&&(t?this.defines.COLOR_WRITE=!0:delete this.defines.COLOR_WRITE,this.colorWrite=t,this.needsUpdate=!0),this.uniforms.inputBuffer.value=e}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(e){const t=e!==null;this.depthWrite!==t&&(t?this.defines.DEPTH_WRITE=!0:delete this.defines.DEPTH_WRITE,this.depthTest=t,this.depthWrite=t,this.needsUpdate=!0),this.uniforms.depthBuffer.value=e}set depthPacking(e){this.defines.DEPTH_PACKING=e.toFixed(0),this.needsUpdate=!0}get colorSpaceConversion(){return this.defines.COLOR_SPACE_CONVERSION!==void 0}set colorSpaceConversion(e){this.colorSpaceConversion!==e&&(e?this.defines.COLOR_SPACE_CONVERSION=!0:delete this.defines.COLOR_SPACE_CONVERSION,this.needsUpdate=!0)}get channelWeights(){return this.uniforms.channelWeights.value}set channelWeights(e){e!==null?(this.defines.USE_WEIGHTS="1",this.uniforms.channelWeights.value=e):delete this.defines.USE_WEIGHTS,this.needsUpdate=!0}setInputBuffer(e){this.uniforms.inputBuffer.value=e}getOpacity(e){return this.uniforms.opacity.value}setOpacity(e){this.uniforms.opacity.value=e}},xt=class extends B{constructor(e,t=!0){super("CopyPass"),this.fullscreenMaterial=new $e,this.needsSwap=!1,this.renderTarget=e,e===void 0&&(this.renderTarget=new O(1,1,{minFilter:ue,magFilter:ue,stencilBuffer:!1,depthBuffer:!1}),this.renderTarget.texture.name="CopyPass.Target"),this.autoResize=t}get resize(){return this.autoResize}set resize(e){this.autoResize=e}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}setAutoResizeEnabled(e){this.autoResize=e}render(e,t,s,i,r){this.fullscreenMaterial.inputBuffer=t.texture,e.setRenderTarget(this.renderToScreen?null:this.renderTarget),e.render(this.scene,this.camera)}setSize(e,t){this.autoResize&&this.renderTarget.setSize(e,t)}initialize(e,t,s){s!==void 0&&(this.renderTarget.texture.type=s,s!==W?this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1":e!==null&&e.outputColorSpace===w&&(this.renderTarget.texture.colorSpace=w))}},ze=new Ve,qe=class extends B{constructor(e=!0,t=!0,s=!1){super("ClearPass",null,null),this.needsSwap=!1,this.color=e,this.depth=t,this.stencil=s,this.overrideClearColor=null,this.overrideClearAlpha=-1}setClearFlags(e,t,s){this.color=e,this.depth=t,this.stencil=s}getOverrideClearColor(){return this.overrideClearColor}setOverrideClearColor(e){this.overrideClearColor=e}getOverrideClearAlpha(){return this.overrideClearAlpha}setOverrideClearAlpha(e){this.overrideClearAlpha=e}render(e,t,s,i,r){const a=this.overrideClearColor,n=this.overrideClearAlpha,o=e.getClearAlpha(),c=a!==null,u=n>=0;c?(e.getClearColor(ze),e.setClearColor(a,u?n:o)):u&&e.setClearAlpha(n),e.setRenderTarget(this.renderToScreen?null:t),e.clear(this.color,this.depth,this.stencil),c?e.setClearColor(ze,o):u&&e.setClearAlpha(o)}},Tt=class extends B{constructor(e,t){super("MaskPass",e,t),this.needsSwap=!1,this.clearPass=new qe(!1,!1,!0),this.inverse=!1}set mainScene(e){this.scene=e}set mainCamera(e){this.camera=e}get inverted(){return this.inverse}set inverted(e){this.inverse=e}get clear(){return this.clearPass.enabled}set clear(e){this.clearPass.enabled=e}getClearPass(){return this.clearPass}isInverted(){return this.inverted}setInverted(e){this.inverted=e}render(e,t,s,i,r){const a=e.getContext(),n=e.state.buffers,o=this.scene,c=this.camera,u=this.clearPass,h=this.inverted?0:1,d=1-h;n.color.setMask(!1),n.depth.setMask(!1),n.color.setLocked(!0),n.depth.setLocked(!0),n.stencil.setTest(!0),n.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),n.stencil.setFunc(a.ALWAYS,h,4294967295),n.stencil.setClear(d),n.stencil.setLocked(!0),this.clearPass.enabled&&(this.renderToScreen?u.render(e,null):(u.render(e,t),u.render(e,s))),this.renderToScreen?(e.setRenderTarget(null),e.render(o,c)):(e.setRenderTarget(t),e.render(o,c),e.setRenderTarget(s),e.render(o,c)),n.color.setLocked(!1),n.depth.setLocked(!1),n.stencil.setLocked(!1),n.stencil.setFunc(a.EQUAL,1,4294967295),n.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),n.stencil.setLocked(!0)}},Se=1/1e3,Et=1e3,Rt=class{constructor(){this.startTime=performance.now(),this.previousTime=0,this.currentTime=0,this._delta=0,this._elapsed=0,this._fixedDelta=1e3/60,this.timescale=1,this.useFixedDelta=!1,this._autoReset=!1}get autoReset(){return this._autoReset}set autoReset(e){typeof document<"u"&&document.hidden!==void 0&&(e?document.addEventListener("visibilitychange",this):document.removeEventListener("visibilitychange",this),this._autoReset=e)}get delta(){return this._delta*Se}get fixedDelta(){return this._fixedDelta*Se}set fixedDelta(e){this._fixedDelta=e*Et}get elapsed(){return this._elapsed*Se}update(e){this.useFixedDelta?this._delta=this.fixedDelta:(this.previousTime=this.currentTime,this.currentTime=(e!==void 0?e:performance.now())-this.startTime,this._delta=this.currentTime-this.previousTime),this._delta*=this.timescale,this._elapsed+=this._delta}reset(){this._delta=0,this._elapsed=0,this.currentTime=performance.now()-this.startTime}getDelta(){return this.delta}getElapsed(){return this.elapsed}handleEvent(e){document.hidden||(this.currentTime=performance.now()-this.startTime)}dispose(){this.autoReset=!1}},bt=class{constructor(e=null,{depthBuffer:t=!0,stencilBuffer:s=!1,multisampling:i=0,frameBufferType:r}={}){this.renderer=null,this.inputBuffer=this.createBuffer(t,s,r,i),this.outputBuffer=this.inputBuffer.clone(),this.copyPass=new xt,this.depthTexture=null,this.depthRenderTarget=null,this.passes=[],this.timer=new Rt,this.autoRenderToScreen=!0,this.setRenderer(e)}get multisampling(){return this.inputBuffer.samples}set multisampling(e){const t=this.inputBuffer,s=this.multisampling;s>0&&e>0?(this.inputBuffer.samples=e,this.outputBuffer.samples=e,this.inputBuffer.dispose(),this.outputBuffer.dispose()):s!==e&&(this.inputBuffer.dispose(),this.outputBuffer.dispose(),this.inputBuffer=this.createBuffer(t.depthBuffer,t.stencilBuffer,t.texture.type,e),this.outputBuffer=this.inputBuffer.clone())}getTimer(){return this.timer}getRenderer(){return this.renderer}setRenderer(e){if(this.renderer=e,e!==null){const t=e.getSize(new T),s=e.getContext().getContextAttributes().alpha,i=this.inputBuffer.texture.type;i===W&&e.outputColorSpace===w&&(this.inputBuffer.texture.colorSpace=w,this.outputBuffer.texture.colorSpace=w,this.inputBuffer.dispose(),this.outputBuffer.dispose()),e.autoClear=!1,this.setSize(t.width,t.height);for(const r of this.passes)r.initialize(e,s,i)}}replaceRenderer(e,t=!0){const s=this.renderer,i=s.domElement.parentNode;return this.setRenderer(e),t&&i!==null&&(i.removeChild(s.domElement),i.appendChild(e.domElement)),s}createDepthTexture(){const e=this.inputBuffer,t=new rt;this.depthTexture=t,e.stencilBuffer?(t.format=at,t.type=nt):t.type=ot;const s=t.clone();return s.name="EffectComposer.StableDepth",this.depthRenderTarget=new O(e.width,e.height,{depthBuffer:!0,stencilBuffer:e.stencilBuffer,depthTexture:s}),s}blitDepthBuffer(e){const t=this.renderer,s=this.depthRenderTarget,i=t.properties,r=t.getContext();t.setRenderTarget(s);const a=i.get(e).__webglFramebuffer,n=i.get(s).__webglFramebuffer,o=e.stencilBuffer?r.DEPTH_BUFFER_BIT|r.STENCIL_BUFFER_BIT:r.DEPTH_BUFFER_BIT;r.bindFramebuffer(r.READ_FRAMEBUFFER,a),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,n),r.blitFramebuffer(0,0,e.width,e.height,0,0,s.width,s.height,o,r.NEAREST),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),t.setRenderTarget(null)}deleteDepthTexture(){if(this.depthTexture!==null){this.depthTexture.dispose(),this.depthTexture=null,this.depthRenderTarget.dispose(),this.depthRenderTarget=null,this.inputBuffer.depthTexture=null,this.outputBuffer.depthTexture=null;for(const e of this.passes)e.setDepthTexture(null)}}createBuffer(e,t,s,i){const r=this.renderer,a=r===null?new T:r.getDrawingBufferSize(new T),n={minFilter:ue,magFilter:ue,stencilBuffer:t,depthBuffer:e,type:s},o=new O(a.width,a.height,n);return i>0&&(o.samples=i),s===W&&r!==null&&r.outputColorSpace===w&&(o.texture.colorSpace=w),o.texture.name="EffectComposer.Buffer",o.texture.generateMipmaps=!1,o}setMainScene(e){for(const t of this.passes)t.mainScene=e}setMainCamera(e){for(const t of this.passes)t.mainCamera=e}addPass(e,t){const s=this.passes,i=this.renderer,r=i.getDrawingBufferSize(new T),a=i.getContext().getContextAttributes().alpha,n=this.inputBuffer.texture.type;if(e.renderer=i,e.setSize(r.width,r.height),e.initialize(i,a,n),this.autoRenderToScreen&&(s.length>0&&(s[s.length-1].renderToScreen=!1),e.renderToScreen&&(this.autoRenderToScreen=!1)),t!==void 0?s.splice(t,0,e):s.push(e),this.autoRenderToScreen&&(s[s.length-1].renderToScreen=!0),e.needsDepthTexture||this.depthTexture!==null)if(this.depthTexture===null){const o=this.createDepthTexture();for(e of s)e.setDepthTexture(o)}else{const o=this.depthRenderTarget.depthTexture;e.setDepthTexture(o)}}removePass(e){const t=this.passes,s=t.indexOf(e);if(s!==-1&&t.splice(s,1).length>0){if(this.depthTexture!==null){const a=(o,c)=>o||c.needsDepthTexture;if(!t.reduce(a,!1)){const o=this.depthRenderTarget.depthTexture;e.getDepthTexture()===o&&e.setDepthTexture(null),this.deleteDepthTexture()}}this.autoRenderToScreen&&s===t.length&&(e.renderToScreen=!1,t.length>0&&(t[t.length-1].renderToScreen=!0))}}removeAllPasses(){const e=this.passes;this.deleteDepthTexture(),e.length>0&&(this.autoRenderToScreen&&(e[e.length-1].renderToScreen=!1),this.passes=[])}render(e){const t=this.renderer,s=this.copyPass;let i=this.inputBuffer,r=this.outputBuffer,a,n=!1;e===void 0&&(this.timer.update(),e=this.timer.getDelta());for(const o of this.passes)if(o.enabled){if(i.depthTexture=this.depthTexture,r.depthTexture=null,o.render(t,i,r,e,n),o.needsDepthBlit&&this.depthRenderTarget!==null&&this.blitDepthBuffer(i),o.needsSwap){if(n){s.renderToScreen=o.renderToScreen;const c=t.getContext(),u=t.state.buffers.stencil;u.setFunc(c.NOTEQUAL,1,4294967295),s.render(t,i,r,e,n),u.setFunc(c.EQUAL,1,4294967295)}a=i,i=r,r=a}o instanceof Tt?n=!0:o instanceof gt&&(n=!1)}}setSize(e,t,s){const i=this.renderer,r=i.getSize(new T);(e===void 0||t===void 0)&&(e=r.width,t=r.height),(r.width!==e||r.height!==t)&&i.setSize(e,t,s);const a=i.getDrawingBufferSize(new T);this.inputBuffer.setSize(a.width,a.height),this.outputBuffer.setSize(a.width,a.height),this.depthRenderTarget!==null&&this.depthRenderTarget.setSize(a.width,a.height);for(const n of this.passes)n.setSize(a.width,a.height)}reset(){this.dispose(),this.autoRenderToScreen=!0}dispose(){for(const e of this.passes)e.dispose();this.passes=[],this.inputBuffer!==null&&this.inputBuffer.dispose(),this.outputBuffer!==null&&this.outputBuffer.dispose(),this.deleteDepthTexture(),this.copyPass.dispose(),this.timer.dispose(),B.fullscreenGeometry.dispose()}},G={NONE:0,DEPTH:1,CONVOLUTION:2},p={FRAGMENT_HEAD:"FRAGMENT_HEAD",FRAGMENT_MAIN_UV:"FRAGMENT_MAIN_UV",FRAGMENT_MAIN_IMAGE:"FRAGMENT_MAIN_IMAGE",VERTEX_HEAD:"VERTEX_HEAD",VERTEX_MAIN_SUPPORT:"VERTEX_MAIN_SUPPORT"},Mt=class{constructor(){this.shaderParts=new Map([[p.FRAGMENT_HEAD,null],[p.FRAGMENT_MAIN_UV,null],[p.FRAGMENT_MAIN_IMAGE,null],[p.VERTEX_HEAD,null],[p.VERTEX_MAIN_SUPPORT,null]]),this.defines=new Map,this.uniforms=new Map,this.blendModes=new Map,this.extensions=new Set,this.attributes=G.NONE,this.varyings=new Set,this.uvTransformation=!1,this.readDepth=!1,this.colorSpace=We}},xe=!1,Ne=class{constructor(e=null){this.originalMaterials=new Map,this.material=null,this.materials=null,this.materialsBackSide=null,this.materialsDoubleSide=null,this.materialsFlatShaded=null,this.materialsFlatShadedBackSide=null,this.materialsFlatShadedDoubleSide=null,this.setMaterial(e),this.meshCount=0,this.replaceMaterial=t=>{if(t.isMesh){let s;if(t.material.flatShading)switch(t.material.side){case le:s=this.materialsFlatShadedDoubleSide;break;case oe:s=this.materialsFlatShadedBackSide;break;default:s=this.materialsFlatShaded;break}else switch(t.material.side){case le:s=this.materialsDoubleSide;break;case oe:s=this.materialsBackSide;break;default:s=this.materials;break}this.originalMaterials.set(t,t.material),t.isSkinnedMesh?t.material=s[2]:t.isInstancedMesh?t.material=s[1]:t.material=s[0],++this.meshCount}}}cloneMaterial(e){if(!(e instanceof k))return e.clone();const t=e.uniforms,s=new Map;for(const r in t){const a=t[r].value;a.isRenderTargetTexture&&(t[r].value=null,s.set(r,a))}const i=e.clone();for(const r of s)t[r[0]].value=r[1],i.uniforms[r[0]].value=r[1];return i}setMaterial(e){if(this.disposeMaterials(),this.material=e,e!==null){const t=this.materials=[this.cloneMaterial(e),this.cloneMaterial(e),this.cloneMaterial(e)];for(const s of t)s.uniforms=Object.assign({},e.uniforms),s.side=lt;t[2].skinning=!0,this.materialsBackSide=t.map(s=>{const i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.side=oe,i}),this.materialsDoubleSide=t.map(s=>{const i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.side=le,i}),this.materialsFlatShaded=t.map(s=>{const i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.flatShading=!0,i}),this.materialsFlatShadedBackSide=t.map(s=>{const i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.flatShading=!0,i.side=oe,i}),this.materialsFlatShadedDoubleSide=t.map(s=>{const i=this.cloneMaterial(s);return i.uniforms=Object.assign({},e.uniforms),i.flatShading=!0,i.side=le,i})}}render(e,t,s){const i=e.shadowMap.enabled;if(e.shadowMap.enabled=!1,xe){const r=this.originalMaterials;this.meshCount=0,t.traverse(this.replaceMaterial),e.render(t,s);for(const a of r)a[0].material=a[1];this.meshCount!==r.size&&r.clear()}else{const r=t.overrideMaterial;t.overrideMaterial=this.material,e.render(t,s),t.overrideMaterial=r}e.shadowMap.enabled=i}disposeMaterials(){if(this.material!==null){const e=this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);for(const t of e)t.dispose()}}dispose(){this.originalMaterials.clear(),this.disposeMaterials()}static get workaroundEnabled(){return xe}static set workaroundEnabled(e){xe=e}},H=-1,C=class extends Re{constructor(e=null,t=H,s=H,i=1){super(),e!==null&&this.addEventListener("change",()=>e.setSize(this.baseSize.width,this.baseSize.height)),this.baseSize=new T(1,1),this.preferredSize=new T(t,s),this.target=this.preferredSize,this.s=i,this.effectiveSize=new T,this.addEventListener("change",()=>this.updateEffectiveSize()),this.updateEffectiveSize()}updateEffectiveSize(){const e=this.baseSize,t=this.preferredSize,s=this.effectiveSize,i=this.scale;t.width!==H?s.width=t.width:t.height!==H?s.width=Math.round(t.height*(e.width/Math.max(e.height,1))):s.width=Math.round(e.width*i),t.height!==H?s.height=t.height:t.width!==H?s.height=Math.round(t.width/Math.max(e.width/Math.max(e.height,1),1)):s.height=Math.round(e.height*i)}get width(){return this.effectiveSize.width}set width(e){this.preferredWidth=e}get height(){return this.effectiveSize.height}set height(e){this.preferredHeight=e}getWidth(){return this.width}getHeight(){return this.height}get scale(){return this.s}set scale(e){this.s!==e&&(this.s=e,this.preferredSize.setScalar(H),this.dispatchEvent({type:"change"}))}getScale(){return this.scale}setScale(e){this.scale=e}get baseWidth(){return this.baseSize.width}set baseWidth(e){this.baseSize.width!==e&&(this.baseSize.width=e,this.dispatchEvent({type:"change"}))}getBaseWidth(){return this.baseWidth}setBaseWidth(e){this.baseWidth=e}get baseHeight(){return this.baseSize.height}set baseHeight(e){this.baseSize.height!==e&&(this.baseSize.height=e,this.dispatchEvent({type:"change"}))}getBaseHeight(){return this.baseHeight}setBaseHeight(e){this.baseHeight=e}setBaseSize(e,t){(this.baseSize.width!==e||this.baseSize.height!==t)&&(this.baseSize.set(e,t),this.dispatchEvent({type:"change"}))}get preferredWidth(){return this.preferredSize.width}set preferredWidth(e){this.preferredSize.width!==e&&(this.preferredSize.width=e,this.dispatchEvent({type:"change"}))}getPreferredWidth(){return this.preferredWidth}setPreferredWidth(e){this.preferredWidth=e}get preferredHeight(){return this.preferredSize.height}set preferredHeight(e){this.preferredSize.height!==e&&(this.preferredSize.height=e,this.dispatchEvent({type:"change"}))}getPreferredHeight(){return this.preferredHeight}setPreferredHeight(e){this.preferredHeight=e}setPreferredSize(e,t){(this.preferredSize.width!==e||this.preferredSize.height!==t)&&(this.preferredSize.set(e,t),this.dispatchEvent({type:"change"}))}copy(e){this.s=e.scale,this.baseSize.set(e.baseWidth,e.baseHeight),this.preferredSize.set(e.preferredWidth,e.preferredHeight),this.dispatchEvent({type:"change"})}static get AUTO_SIZE(){return H}},f={ADD:0,ALPHA:1,AVERAGE:2,COLOR:3,COLOR_BURN:4,COLOR_DODGE:5,DARKEN:6,DIFFERENCE:7,DIVIDE:8,DST:9,EXCLUSION:10,HARD_LIGHT:11,HARD_MIX:12,HUE:13,INVERT:14,INVERT_RGB:15,LIGHTEN:16,LINEAR_BURN:17,LINEAR_DODGE:18,LINEAR_LIGHT:19,LUMINOSITY:20,MULTIPLY:21,NEGATION:22,NORMAL:23,OVERLAY:24,PIN_LIGHT:25,REFLECT:26,SATURATION:27,SCREEN:28,SOFT_LIGHT:29,SRC:30,SUBTRACT:31,VIVID_LIGHT:32},wt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",yt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,src.a*opacity);}",Ut="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=(dst.rgb+src.rgb)*0.5;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Bt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.xy,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",_t="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=mix(step(0.0,b)*(1.0-min(vec3(1.0),(1.0-a)/max(b,1e-9))),vec3(1.0),step(1.0,a));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",At="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=step(0.0,a)*mix(min(vec3(1.0),a/max(1.0-b,1e-9)),vec3(1.0),step(1.0,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ct="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Dt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=abs(dst.rgb-src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",It="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb/max(src.rgb,1e-9);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ot="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-2.0*dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Pt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb,1.0);vec3 b=min(src.rgb,1.0);vec3 c=mix(2.0*a*b,1.0-2.0*(1.0-a)*(1.0-b),step(0.5,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ft="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=step(1.0,dst.rgb+src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",zt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.x,a.yz));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Nt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Lt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=src.rgb*max(1.0-dst.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ht="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Gt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",kt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb+src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Vt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(2.0*src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Wt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.xy,b.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Yt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Xt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-abs(1.0-dst.rgb-src.rgb),0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Kt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,opacity);}",jt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=2.0*src.rgb*dst.rgb;vec3 b=1.0-2.0*(1.0-src.rgb)*(1.0-dst.rgb);vec3 c=mix(a,b,step(0.5,dst.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Zt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 c=mix(mix(src2,dst.rgb,step(0.5*dst.rgb,src.rgb)),max(src2-1.0,vec3(0.0)),step(dst.rgb,src2-1.0));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",$t="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb*dst.rgb/max(1.0-src.rgb,1e-9),1.0);vec3 c=mix(a,src.rgb,step(1.0,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",qt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.x,b.y,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Qt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-min(dst.rgb*src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Jt="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 d=dst.rgb+(src2-1.0);vec3 w=step(0.5,src.rgb);vec3 a=dst.rgb-(1.0-src2)*dst.rgb*(1.0-dst.rgb);vec3 b=mix(d*(sqrt(dst.rgb)-dst.rgb),d*dst.rgb*((16.0*dst.rgb-12.0)*dst.rgb+3.0),w*(1.0-step(0.25,dst.rgb)));vec3 c=mix(a,b,w);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",es="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return src;}",ts="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",ss="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=mix(max(1.0-min((1.0-dst.rgb)/(2.0*src.rgb),1.0),0.0),min(dst.rgb/(2.0*(1.0-src.rgb)),1.0),step(0.5,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",is=new Map([[f.ADD,wt],[f.ALPHA,yt],[f.AVERAGE,Ut],[f.COLOR,Bt],[f.COLOR_BURN,_t],[f.COLOR_DODGE,At],[f.DARKEN,Ct],[f.DIFFERENCE,Dt],[f.DIVIDE,It],[f.DST,null],[f.EXCLUSION,Ot],[f.HARD_LIGHT,Pt],[f.HARD_MIX,Ft],[f.HUE,zt],[f.INVERT,Nt],[f.INVERT_RGB,Lt],[f.LIGHTEN,Ht],[f.LINEAR_BURN,Gt],[f.LINEAR_DODGE,kt],[f.LINEAR_LIGHT,Vt],[f.LUMINOSITY,Wt],[f.MULTIPLY,Yt],[f.NEGATION,Xt],[f.NORMAL,Kt],[f.OVERLAY,jt],[f.PIN_LIGHT,Zt],[f.REFLECT,$t],[f.SATURATION,qt],[f.SCREEN,Qt],[f.SOFT_LIGHT,Jt],[f.SRC,es],[f.SUBTRACT,ts],[f.VIVID_LIGHT,ss]]),rs=class extends Re{constructor(e,t=1){super(),this._blendFunction=e,this.opacity=new m(t)}getOpacity(){return this.opacity.value}setOpacity(e){this.opacity.value=e}get blendFunction(){return this._blendFunction}set blendFunction(e){this._blendFunction=e,this.dispatchEvent({type:"change"})}getBlendFunction(){return this.blendFunction}setBlendFunction(e){this.blendFunction=e}getShaderCode(){return is.get(this.blendFunction)}},Qe=class extends Re{constructor(e,t,{attributes:s=G.NONE,blendFunction:i=f.NORMAL,defines:r=new Map,uniforms:a=new Map,extensions:n=null,vertexShader:o=null}={}){super(),this.name=e,this.renderer=null,this.attributes=s,this.fragmentShader=t,this.vertexShader=o,this.defines=r,this.uniforms=a,this.extensions=n,this.blendMode=new rs(i),this.blendMode.addEventListener("change",c=>this.setChanged()),this._inputColorSpace=We,this._outputColorSpace=Ye}get inputColorSpace(){return this._inputColorSpace}set inputColorSpace(e){this._inputColorSpace=e,this.setChanged()}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e,this.setChanged()}set mainScene(e){}set mainCamera(e){}getName(){return this.name}setRenderer(e){this.renderer=e}getDefines(){return this.defines}getUniforms(){return this.uniforms}getExtensions(){return this.extensions}getBlendMode(){return this.blendMode}getAttributes(){return this.attributes}setAttributes(e){this.attributes=e,this.setChanged()}getFragmentShader(){return this.fragmentShader}setFragmentShader(e){this.fragmentShader=e,this.setChanged()}getVertexShader(){return this.vertexShader}setVertexShader(e){this.vertexShader=e,this.setChanged()}setChanged(){this.dispatchEvent({type:"change"})}setDepthTexture(e,t=de){}update(e,t,s){}setSize(e,t){}initialize(e,t,s){}dispose(){for(const e of Object.keys(this)){const t=this[e];(t instanceof O||t instanceof Ke||t instanceof je||t instanceof B)&&this[e].dispose()}}},be={MEDIUM:2,LARGE:3},as=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec4 sum=texture2D(inputBuffer,vUv0);sum+=texture2D(inputBuffer,vUv1);sum+=texture2D(inputBuffer,vUv2);sum+=texture2D(inputBuffer,vUv3);gl_FragColor=sum*0.25;
#include <colorspace_fragment>
}`,ns="uniform vec4 texelSize;uniform float kernel;uniform float scale;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;void main(){vec2 uv=position.xy*0.5+0.5;vec2 dUv=(texelSize.xy*vec2(kernel)+texelSize.zw)*scale;vUv0=vec2(uv.x-dUv.x,uv.y+dUv.y);vUv1=vec2(uv.x+dUv.x,uv.y+dUv.y);vUv2=vec2(uv.x+dUv.x,uv.y-dUv.y);vUv3=vec2(uv.x-dUv.x,uv.y-dUv.y);gl_Position=vec4(position.xy,1.0,1.0);}",os=[new Float32Array([0,0]),new Float32Array([0,1,1]),new Float32Array([0,1,1,2]),new Float32Array([0,1,2,2,3]),new Float32Array([0,1,2,3,4,4,5]),new Float32Array([0,1,2,3,4,5,7,8,9,10])],ls=class extends k{constructor(e=new Fe){super({name:"KawaseBlurMaterial",uniforms:{inputBuffer:new m(null),texelSize:new m(new Fe),scale:new m(1),kernel:new m(0)},blending:Y,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:as,vertexShader:ns}),this.setTexelSize(e.x,e.y),this.kernelSize=be.MEDIUM}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setInputBuffer(e){this.inputBuffer=e}get kernelSequence(){return os[this.kernelSize]}get scale(){return this.uniforms.scale.value}set scale(e){this.uniforms.scale.value=e}getScale(){return this.uniforms.scale.value}setScale(e){this.uniforms.scale.value=e}getKernel(){return null}get kernel(){return this.uniforms.kernel.value}set kernel(e){this.uniforms.kernel.value=e}setKernel(e){this.kernel=e}setTexelSize(e,t){this.uniforms.texelSize.value.set(e,t,e*.5,t*.5)}setSize(e,t){const s=1/e,i=1/t;this.uniforms.texelSize.value.set(s,i,s*.5,i*.5)}},cs=class extends B{constructor({kernelSize:e=be.MEDIUM,resolutionScale:t=.5,width:s=C.AUTO_SIZE,height:i=C.AUTO_SIZE,resolutionX:r=s,resolutionY:a=i}={}){super("KawaseBlurPass"),this.renderTargetA=new O(1,1,{depthBuffer:!1}),this.renderTargetA.texture.name="Blur.Target.A",this.renderTargetB=this.renderTargetA.clone(),this.renderTargetB.texture.name="Blur.Target.B";const n=this.resolution=new C(this,r,a,t);n.addEventListener("change",o=>this.setSize(n.baseWidth,n.baseHeight)),this._blurMaterial=new ls,this._blurMaterial.kernelSize=e,this.copyMaterial=new $e}getResolution(){return this.resolution}get blurMaterial(){return this._blurMaterial}set blurMaterial(e){this._blurMaterial=e}get dithering(){return this.copyMaterial.dithering}set dithering(e){this.copyMaterial.dithering=e}get kernelSize(){return this.blurMaterial.kernelSize}set kernelSize(e){this.blurMaterial.kernelSize=e}get width(){return this.resolution.width}set width(e){this.resolution.preferredWidth=e}get height(){return this.resolution.height}set height(e){this.resolution.preferredHeight=e}get scale(){return this.blurMaterial.scale}set scale(e){this.blurMaterial.scale=e}getScale(){return this.blurMaterial.scale}setScale(e){this.blurMaterial.scale=e}getKernelSize(){return this.kernelSize}setKernelSize(e){this.kernelSize=e}getResolutionScale(){return this.resolution.scale}setResolutionScale(e){this.resolution.scale=e}render(e,t,s,i,r){const a=this.scene,n=this.camera,o=this.renderTargetA,c=this.renderTargetB,u=this.blurMaterial,h=u.kernelSequence;let d=t;this.fullscreenMaterial=u;for(let g=0,S=h.length;g<S;++g){const M=(g&1)===0?o:c;u.kernel=h[g],u.inputBuffer=d.texture,e.setRenderTarget(M),e.render(a,n),d=M}this.fullscreenMaterial=this.copyMaterial,this.copyMaterial.inputBuffer=d.texture,e.setRenderTarget(this.renderToScreen?null:s),e.render(a,n)}setSize(e,t){const s=this.resolution;s.setBaseSize(e,t);const i=s.width,r=s.height;this.renderTargetA.setSize(i,r),this.renderTargetB.setSize(i,r),this.blurMaterial.setSize(e,t)}initialize(e,t,s){s!==void 0&&(this.renderTargetA.texture.type=s,this.renderTargetB.texture.type=s,s!==W?(this.blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1",this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1"):e!==null&&e.outputColorSpace===w&&(this.renderTargetA.texture.colorSpace=w,this.renderTargetB.texture.colorSpace=w))}static get AUTO_SIZE(){return C.AUTO_SIZE}},us=`#include <common>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#ifdef RANGE
uniform vec2 range;
#elif defined(THRESHOLD)
uniform float threshold;uniform float smoothing;
#endif
varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=luminance(texel.rgb);float mask=1.0;
#ifdef RANGE
float low=step(range.x,l);float high=step(l,range.y);mask=low*high;
#elif defined(THRESHOLD)
mask=smoothstep(threshold,threshold+smoothing,l);
#endif
#ifdef COLOR
gl_FragColor=texel*mask;
#else
gl_FragColor=vec4(l*mask);
#endif
}`,ds=class extends k{constructor(e=!1,t=null){super({name:"LuminanceMaterial",defines:{THREE_REVISION:Xe.replace(/\D+/g,"")},uniforms:{inputBuffer:new m(null),threshold:new m(0),smoothing:new m(1),range:new m(null)},blending:Y,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:us,vertexShader:Ze}),this.colorOutput=e,this.luminanceRange=t}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setInputBuffer(e){this.uniforms.inputBuffer.value=e}get threshold(){return this.uniforms.threshold.value}set threshold(e){this.smoothing>0||e>0?this.defines.THRESHOLD="1":delete this.defines.THRESHOLD,this.uniforms.threshold.value=e}getThreshold(){return this.threshold}setThreshold(e){this.threshold=e}get smoothing(){return this.uniforms.smoothing.value}set smoothing(e){this.threshold>0||e>0?this.defines.THRESHOLD="1":delete this.defines.THRESHOLD,this.uniforms.smoothing.value=e}getSmoothingFactor(){return this.smoothing}setSmoothingFactor(e){this.smoothing=e}get useThreshold(){return this.threshold>0||this.smoothing>0}set useThreshold(e){}get colorOutput(){return this.defines.COLOR!==void 0}set colorOutput(e){e?this.defines.COLOR="1":delete this.defines.COLOR,this.needsUpdate=!0}isColorOutputEnabled(e){return this.colorOutput}setColorOutputEnabled(e){this.colorOutput=e}get useRange(){return this.luminanceRange!==null}set useRange(e){this.luminanceRange=null}get luminanceRange(){return this.uniforms.range.value}set luminanceRange(e){e!==null?this.defines.RANGE="1":delete this.defines.RANGE,this.uniforms.range.value=e,this.needsUpdate=!0}getLuminanceRange(){return this.luminanceRange}setLuminanceRange(e){this.luminanceRange=e}},fs=class extends B{constructor({renderTarget:e,luminanceRange:t,colorOutput:s,resolutionScale:i=1,width:r=C.AUTO_SIZE,height:a=C.AUTO_SIZE,resolutionX:n=r,resolutionY:o=a}={}){super("LuminancePass"),this.fullscreenMaterial=new ds(s,t),this.needsSwap=!1,this.renderTarget=e,this.renderTarget===void 0&&(this.renderTarget=new O(1,1,{depthBuffer:!1}),this.renderTarget.texture.name="LuminancePass.Target");const c=this.resolution=new C(this,n,o,i);c.addEventListener("change",u=>this.setSize(c.baseWidth,c.baseHeight))}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}getResolution(){return this.resolution}render(e,t,s,i,r){const a=this.fullscreenMaterial;a.inputBuffer=t.texture,e.setRenderTarget(this.renderToScreen?null:this.renderTarget),e.render(this.scene,this.camera)}setSize(e,t){const s=this.resolution;s.setBaseSize(e,t),this.renderTarget.setSize(s.width,s.height)}initialize(e,t,s){s!==void 0&&s!==W&&(this.renderTarget.texture.type=s,this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}},hs=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#define WEIGHT_INNER 0.125
#define WEIGHT_OUTER 0.05556
varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;float clampToBorder(const in vec2 uv){return float(uv.s>=0.0&&uv.s<=1.0&&uv.t>=0.0&&uv.t<=1.0);}void main(){vec4 c=vec4(0.0);vec4 w=WEIGHT_INNER*vec4(clampToBorder(vUv00),clampToBorder(vUv01),clampToBorder(vUv02),clampToBorder(vUv03));c+=w.x*texture2D(inputBuffer,vUv00);c+=w.y*texture2D(inputBuffer,vUv01);c+=w.z*texture2D(inputBuffer,vUv02);c+=w.w*texture2D(inputBuffer,vUv03);w=WEIGHT_OUTER*vec4(clampToBorder(vUv04),clampToBorder(vUv05),clampToBorder(vUv06),clampToBorder(vUv07));c+=w.x*texture2D(inputBuffer,vUv04);c+=w.y*texture2D(inputBuffer,vUv05);c+=w.z*texture2D(inputBuffer,vUv06);c+=w.w*texture2D(inputBuffer,vUv07);w=WEIGHT_OUTER*vec4(clampToBorder(vUv08),clampToBorder(vUv09),clampToBorder(vUv10),clampToBorder(vUv11));c+=w.x*texture2D(inputBuffer,vUv08);c+=w.y*texture2D(inputBuffer,vUv09);c+=w.z*texture2D(inputBuffer,vUv10);c+=w.w*texture2D(inputBuffer,vUv11);c+=WEIGHT_OUTER*texture2D(inputBuffer,vUv);gl_FragColor=c;
#include <colorspace_fragment>
}`,vs="uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv00;varying vec2 vUv01;varying vec2 vUv02;varying vec2 vUv03;varying vec2 vUv04;varying vec2 vUv05;varying vec2 vUv06;varying vec2 vUv07;varying vec2 vUv08;varying vec2 vUv09;varying vec2 vUv10;varying vec2 vUv11;void main(){vUv=position.xy*0.5+0.5;vUv00=vUv+texelSize*vec2(-1.0,1.0);vUv01=vUv+texelSize*vec2(1.0,1.0);vUv02=vUv+texelSize*vec2(-1.0,-1.0);vUv03=vUv+texelSize*vec2(1.0,-1.0);vUv04=vUv+texelSize*vec2(-2.0,2.0);vUv05=vUv+texelSize*vec2(0.0,2.0);vUv06=vUv+texelSize*vec2(2.0,2.0);vUv07=vUv+texelSize*vec2(-2.0,0.0);vUv08=vUv+texelSize*vec2(2.0,0.0);vUv09=vUv+texelSize*vec2(-2.0,-2.0);vUv10=vUv+texelSize*vec2(0.0,-2.0);vUv11=vUv+texelSize*vec2(2.0,-2.0);gl_Position=vec4(position.xy,1.0,1.0);}",ps=class extends k{constructor(){super({name:"DownsamplingMaterial",uniforms:{inputBuffer:new m(null),texelSize:new m(new T)},blending:Y,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:hs,vertexShader:vs})}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setSize(e,t){this.uniforms.texelSize.value.set(1/e,1/t)}},ms=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;uniform mediump sampler2D supportBuffer;
#else
uniform lowp sampler2D inputBuffer;uniform lowp sampler2D supportBuffer;
#endif
uniform float radius;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vec4 c=vec4(0.0);c+=texture2D(inputBuffer,vUv0)*0.0625;c+=texture2D(inputBuffer,vUv1)*0.125;c+=texture2D(inputBuffer,vUv2)*0.0625;c+=texture2D(inputBuffer,vUv3)*0.125;c+=texture2D(inputBuffer,vUv)*0.25;c+=texture2D(inputBuffer,vUv4)*0.125;c+=texture2D(inputBuffer,vUv5)*0.0625;c+=texture2D(inputBuffer,vUv6)*0.125;c+=texture2D(inputBuffer,vUv7)*0.0625;vec4 baseColor=texture2D(supportBuffer,vUv);gl_FragColor=mix(baseColor,c,radius);
#include <colorspace_fragment>
}`,gs="uniform vec2 texelSize;varying vec2 vUv;varying vec2 vUv0;varying vec2 vUv1;varying vec2 vUv2;varying vec2 vUv3;varying vec2 vUv4;varying vec2 vUv5;varying vec2 vUv6;varying vec2 vUv7;void main(){vUv=position.xy*0.5+0.5;vUv0=vUv+texelSize*vec2(-1.0,1.0);vUv1=vUv+texelSize*vec2(0.0,1.0);vUv2=vUv+texelSize*vec2(1.0,1.0);vUv3=vUv+texelSize*vec2(-1.0,0.0);vUv4=vUv+texelSize*vec2(1.0,0.0);vUv5=vUv+texelSize*vec2(-1.0,-1.0);vUv6=vUv+texelSize*vec2(0.0,-1.0);vUv7=vUv+texelSize*vec2(1.0,-1.0);gl_Position=vec4(position.xy,1.0,1.0);}",Ss=class extends k{constructor(){super({name:"UpsamplingMaterial",uniforms:{inputBuffer:new m(null),supportBuffer:new m(null),texelSize:new m(new T),radius:new m(.85)},blending:Y,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:ms,vertexShader:gs})}set inputBuffer(e){this.uniforms.inputBuffer.value=e}set supportBuffer(e){this.uniforms.supportBuffer.value=e}get radius(){return this.uniforms.radius.value}set radius(e){this.uniforms.radius.value=e}setSize(e,t){this.uniforms.texelSize.value.set(1/e,1/t)}},xs=class extends B{constructor(){super("MipmapBlurPass"),this.needsSwap=!1,this.renderTarget=new O(1,1,{depthBuffer:!1}),this.renderTarget.texture.name="Upsampling.Mipmap0",this.downsamplingMipmaps=[],this.upsamplingMipmaps=[],this.downsamplingMaterial=new ps,this.upsamplingMaterial=new Ss,this.resolution=new T}get texture(){return this.renderTarget.texture}get levels(){return this.downsamplingMipmaps.length}set levels(e){if(this.levels!==e){const t=this.renderTarget;this.dispose(),this.downsamplingMipmaps=[],this.upsamplingMipmaps=[];for(let s=0;s<e;++s){const i=t.clone();i.texture.name="Downsampling.Mipmap"+s,this.downsamplingMipmaps.push(i)}this.upsamplingMipmaps.push(t);for(let s=1,i=e-1;s<i;++s){const r=t.clone();r.texture.name="Upsampling.Mipmap"+s,this.upsamplingMipmaps.push(r)}this.setSize(this.resolution.x,this.resolution.y)}}get radius(){return this.upsamplingMaterial.radius}set radius(e){this.upsamplingMaterial.radius=e}render(e,t,s,i,r){const{scene:a,camera:n}=this,{downsamplingMaterial:o,upsamplingMaterial:c}=this,{downsamplingMipmaps:u,upsamplingMipmaps:h}=this;let d=t;this.fullscreenMaterial=o;for(let g=0,S=u.length;g<S;++g){const M=u[g];o.setSize(d.width,d.height),o.inputBuffer=d.texture,e.setRenderTarget(M),e.render(a,n),d=M}this.fullscreenMaterial=c;for(let g=h.length-1;g>=0;--g){const S=h[g];c.setSize(d.width,d.height),c.inputBuffer=d.texture,c.supportBuffer=u[g].texture,e.setRenderTarget(S),e.render(a,n),d=S}}setSize(e,t){const s=this.resolution;s.set(e,t);let i=s.width,r=s.height;for(let a=0,n=this.downsamplingMipmaps.length;a<n;++a)i=Math.round(i*.5),r=Math.round(r*.5),this.downsamplingMipmaps[a].setSize(i,r),a<this.upsamplingMipmaps.length&&this.upsamplingMipmaps[a].setSize(i,r)}initialize(e,t,s){if(s!==void 0){const i=this.downsamplingMipmaps.concat(this.upsamplingMipmaps);for(const r of i)r.texture.type=s;if(s!==W)this.downsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1",this.upsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1";else if(e!==null&&e.outputColorSpace===w)for(const r of i)r.texture.colorSpace=w}}dispose(){super.dispose();for(const e of this.downsamplingMipmaps.concat(this.upsamplingMipmaps))e.dispose()}},Ts=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif
uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=texture2D(map,uv)*intensity;}`,Es=class extends Qe{constructor({blendFunction:e=f.SCREEN,luminanceThreshold:t=1,luminanceSmoothing:s=.03,mipmapBlur:i=!0,intensity:r=1,radius:a=.85,levels:n=8,kernelSize:o=be.LARGE,resolutionScale:c=.5,width:u=C.AUTO_SIZE,height:h=C.AUTO_SIZE,resolutionX:d=u,resolutionY:g=h}={}){super("BloomEffect",Ts,{blendFunction:e,uniforms:new Map([["map",new m(null)],["intensity",new m(r)]])}),this.renderTarget=new O(1,1,{depthBuffer:!1}),this.renderTarget.texture.name="Bloom.Target",this.blurPass=new cs({kernelSize:o}),this.luminancePass=new fs({colorOutput:!0}),this.luminanceMaterial.threshold=t,this.luminanceMaterial.smoothing=s,this.mipmapBlurPass=new xs,this.mipmapBlurPass.enabled=i,this.mipmapBlurPass.radius=a,this.mipmapBlurPass.levels=n,this.uniforms.get("map").value=i?this.mipmapBlurPass.texture:this.renderTarget.texture;const S=this.resolution=new C(this,d,g,c);S.addEventListener("change",M=>this.setSize(S.baseWidth,S.baseHeight))}get texture(){return this.mipmapBlurPass.enabled?this.mipmapBlurPass.texture:this.renderTarget.texture}getTexture(){return this.texture}getResolution(){return this.resolution}getBlurPass(){return this.blurPass}getLuminancePass(){return this.luminancePass}get luminanceMaterial(){return this.luminancePass.fullscreenMaterial}getLuminanceMaterial(){return this.luminancePass.fullscreenMaterial}get width(){return this.resolution.width}set width(e){this.resolution.preferredWidth=e}get height(){return this.resolution.height}set height(e){this.resolution.preferredHeight=e}get dithering(){return this.blurPass.dithering}set dithering(e){this.blurPass.dithering=e}get kernelSize(){return this.blurPass.kernelSize}set kernelSize(e){this.blurPass.kernelSize=e}get distinction(){return console.warn(this.name,"distinction was removed"),1}set distinction(e){console.warn(this.name,"distinction was removed")}get intensity(){return this.uniforms.get("intensity").value}set intensity(e){this.uniforms.get("intensity").value=e}getIntensity(){return this.intensity}setIntensity(e){this.intensity=e}getResolutionScale(){return this.resolution.scale}setResolutionScale(e){this.resolution.scale=e}update(e,t,s){const i=this.renderTarget,r=this.luminancePass;r.enabled?(r.render(e,t),this.mipmapBlurPass.enabled?this.mipmapBlurPass.render(e,r.renderTarget):this.blurPass.render(e,r.renderTarget,i)):this.mipmapBlurPass.enabled?this.mipmapBlurPass.render(e,t):this.blurPass.render(e,t,i)}setSize(e,t){const s=this.resolution;s.setBaseSize(e,t),this.renderTarget.setSize(s.width,s.height),this.blurPass.resolution.copy(s),this.luminancePass.setSize(e,t),this.mipmapBlurPass.setSize(e,t)}initialize(e,t,s){this.blurPass.initialize(e,t,s),this.luminancePass.initialize(e,t,s),this.mipmapBlurPass.initialize(e,t,s),s!==void 0&&(this.renderTarget.texture.type=s,e!==null&&e.outputColorSpace===w&&(this.renderTarget.texture.colorSpace=w))}},Rs=`#ifdef RADIAL_MODULATION
uniform float modulationOffset;
#endif
varying float vActive;varying vec2 vUvR;varying vec2 vUvB;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec2 ra=inputColor.ra;vec2 ba=inputColor.ba;
#ifdef RADIAL_MODULATION
const vec2 center=vec2(0.5);float d=distance(uv,center)*2.0;d=max(d-modulationOffset,0.0);if(vActive>0.0&&d>0.0){ra=texture2D(inputBuffer,mix(uv,vUvR,d)).ra;ba=texture2D(inputBuffer,mix(uv,vUvB,d)).ba;}
#else
if(vActive>0.0){ra=texture2D(inputBuffer,vUvR).ra;ba=texture2D(inputBuffer,vUvB).ba;}
#endif
outputColor=vec4(ra.x,inputColor.g,ba.x,max(max(ra.y,ba.y),inputColor.a));}`,bs="uniform vec2 offset;varying float vActive;varying vec2 vUvR;varying vec2 vUvB;void mainSupport(const in vec2 uv){vec2 shift=offset*vec2(1.0,aspect);vActive=(shift.x!=0.0||shift.y!=0.0)?1.0:0.0;vUvR=uv+shift;vUvB=uv-shift;}",Ms=class extends Qe{constructor({offset:e=new T(.001,5e-4),radialModulation:t=!1,modulationOffset:s=.15}={}){super("ChromaticAberrationEffect",Rs,{vertexShader:bs,attributes:G.CONVOLUTION,uniforms:new Map([["offset",new m(e)],["modulationOffset",new m(s)]])}),this.radialModulation=t}get offset(){return this.uniforms.get("offset").value}set offset(e){this.uniforms.get("offset").value=e}get radialModulation(){return this.defines.has("RADIAL_MODULATION")}set radialModulation(e){e?this.defines.set("RADIAL_MODULATION","1"):this.defines.delete("RADIAL_MODULATION"),this.setChanged()}get modulationOffset(){return this.uniforms.get("modulationOffset").value}set modulationOffset(e){this.uniforms.get("modulationOffset").value=e}getOffset(){return this.offset}setOffset(e){this.offset=e}},ws=class extends B{constructor(e,t,s=null){super("RenderPass",e,t),this.needsSwap=!1,this.needsDepthBlit=!0,this.clearPass=new qe,this.overrideMaterialManager=s===null?null:new Ne(s),this.ignoreBackground=!1,this.skipShadowMapUpdate=!1,this.selection=null}set mainScene(e){this.scene=e}set mainCamera(e){this.camera=e}get renderToScreen(){return super.renderToScreen}set renderToScreen(e){super.renderToScreen=e,this.clearPass.renderToScreen=e}get overrideMaterial(){const e=this.overrideMaterialManager;return e!==null?e.material:null}set overrideMaterial(e){const t=this.overrideMaterialManager;e!==null?t!==null?t.setMaterial(e):this.overrideMaterialManager=new Ne(e):t!==null&&(t.dispose(),this.overrideMaterialManager=null)}getOverrideMaterial(){return this.overrideMaterial}setOverrideMaterial(e){this.overrideMaterial=e}get clear(){return this.clearPass.enabled}set clear(e){this.clearPass.enabled=e}getSelection(){return this.selection}setSelection(e){this.selection=e}isBackgroundDisabled(){return this.ignoreBackground}setBackgroundDisabled(e){this.ignoreBackground=e}isShadowMapDisabled(){return this.skipShadowMapUpdate}setShadowMapDisabled(e){this.skipShadowMapUpdate=e}getClearPass(){return this.clearPass}render(e,t,s,i,r){const a=this.scene,n=this.camera,o=this.selection,c=n.layers.mask,u=a.background,h=e.shadowMap.autoUpdate,d=this.renderToScreen?null:t;o!==null&&n.layers.set(o.getLayer()),this.skipShadowMapUpdate&&(e.shadowMap.autoUpdate=!1),(this.ignoreBackground||this.clearPass.overrideClearColor!==null)&&(a.background=null),this.clearPass.enabled&&this.clearPass.render(e,t),e.setRenderTarget(d),this.overrideMaterialManager!==null?this.overrideMaterialManager.render(e,a,n):e.render(a,n),n.layers.mask=c,a.background=u,e.shadowMap.autoUpdate=h}},ys=`#include <common>
#include <packing>
#include <dithering_pars_fragment>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#if DEPTH_PACKING == 3201
uniform lowp sampler2D depthBuffer;
#elif defined(GL_FRAGMENT_PRECISION_HIGH)
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;vec4 sRGBToLinear(const in vec4 value){return vec4(mix(pow(value.rgb*0.9478672986+vec3(0.0521327014),vec3(2.4)),value.rgb*0.0773993808,vec3(lessThanEqual(value.rgb,vec3(0.04045)))),value.a);}float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
float depth=unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
float depth=texture2D(depthBuffer,uv).r;
#endif
#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)
float d=pow(2.0,depth*log2(cameraFar+1.0))-1.0;float a=cameraFar/(cameraFar-cameraNear);float b=cameraFar*cameraNear/(cameraNear-cameraFar);depth=a+b/d;
#elif defined(USE_REVERSED_DEPTH_BUFFER)
depth=1.0-depth;
#endif
return depth;}float getViewZ(const in float depth){
#ifdef PERSPECTIVE_CAMERA
return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);
#else
return orthographicDepthToViewZ(depth,cameraNear,cameraFar);
#endif
}vec3 RGBToHCV(const in vec3 RGB){vec4 P=mix(vec4(RGB.bg,-1.0,2.0/3.0),vec4(RGB.gb,0.0,-1.0/3.0),step(RGB.b,RGB.g));vec4 Q=mix(vec4(P.xyw,RGB.r),vec4(RGB.r,P.yzx),step(P.x,RGB.r));float C=Q.x-min(Q.w,Q.y);float H=abs((Q.w-Q.y)/(6.0*C+EPSILON)+Q.z);return vec3(H,C,Q.x);}vec3 RGBToHSL(const in vec3 RGB){vec3 HCV=RGBToHCV(RGB);float L=HCV.z-HCV.y*0.5;float S=HCV.y/(1.0-abs(L*2.0-1.0)+EPSILON);return vec3(HCV.x,S,L);}vec3 HueToRGB(const in float H){float R=abs(H*6.0-3.0)-1.0;float G=2.0-abs(H*6.0-2.0);float B=2.0-abs(H*6.0-4.0);return clamp(vec3(R,G,B),0.0,1.0);}vec3 HSLToRGB(const in vec3 HSL){vec3 RGB=HueToRGB(HSL.x);float C=(1.0-abs(2.0*HSL.z-1.0))*HSL.y;return(RGB-0.5)*C+HSL.z;}FRAGMENT_HEAD void main(){FRAGMENT_MAIN_UV vec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGE color0.a=clamp(color0.a,0.0,1.0);gl_FragColor=color0;
#ifdef ENCODE_OUTPUT
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
}`,Us="uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEAD void main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORT gl_Position=vec4(position.xy,1.0,1.0);}",Bs=class extends k{constructor(e,t,s,i,r=!1){super({name:"EffectMaterial",defines:{THREE_REVISION:Xe.replace(/\D+/g,""),DEPTH_PACKING:"0",ENCODE_OUTPUT:"1"},uniforms:{inputBuffer:new m(null),depthBuffer:new m(null),resolution:new m(new T),texelSize:new m(new T),cameraNear:new m(.3),cameraFar:new m(1e3),aspect:new m(1),time:new m(0)},blending:Y,toneMapped:!1,depthWrite:!1,depthTest:!1,dithering:r}),e&&this.setShaderParts(e),t&&this.setDefines(t),s&&this.setUniforms(s),this.copyCameraSettings(i)}set inputBuffer(e){this.uniforms.inputBuffer.value=e}setInputBuffer(e){this.uniforms.inputBuffer.value=e}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(e){this.uniforms.depthBuffer.value=e}get depthPacking(){return Number(this.defines.DEPTH_PACKING)}set depthPacking(e){this.defines.DEPTH_PACKING=e.toFixed(0),this.needsUpdate=!0}setDepthBuffer(e,t=de){this.depthBuffer=e,this.depthPacking=t}setShaderData(e){this.setShaderParts(e.shaderParts),this.setDefines(e.defines),this.setUniforms(e.uniforms),this.setExtensions(e.extensions)}setShaderParts(e){return this.fragmentShader=ys.replace(p.FRAGMENT_HEAD,e.get(p.FRAGMENT_HEAD)||"").replace(p.FRAGMENT_MAIN_UV,e.get(p.FRAGMENT_MAIN_UV)||"").replace(p.FRAGMENT_MAIN_IMAGE,e.get(p.FRAGMENT_MAIN_IMAGE)||""),this.vertexShader=Us.replace(p.VERTEX_HEAD,e.get(p.VERTEX_HEAD)||"").replace(p.VERTEX_MAIN_SUPPORT,e.get(p.VERTEX_MAIN_SUPPORT)||""),this.needsUpdate=!0,this}setDefines(e){for(const t of e.entries())this.defines[t[0]]=t[1];return this.needsUpdate=!0,this}setUniforms(e){for(const t of e.entries())this.uniforms[t[0]]=t[1];return this}setExtensions(e){this.extensions={};for(const t of e)this.extensions[t]=!0;return this}get encodeOutput(){return this.defines.ENCODE_OUTPUT!==void 0}set encodeOutput(e){this.encodeOutput!==e&&(e?this.defines.ENCODE_OUTPUT="1":delete this.defines.ENCODE_OUTPUT,this.needsUpdate=!0)}isOutputEncodingEnabled(e){return this.encodeOutput}setOutputEncodingEnabled(e){this.encodeOutput=e}get time(){return this.uniforms.time.value}set time(e){this.uniforms.time.value=e}setDeltaTime(e){this.uniforms.time.value+=e}adoptCameraSettings(e){this.copyCameraSettings(e)}copyCameraSettings(e){e&&(this.uniforms.cameraNear.value=e.near,this.uniforms.cameraFar.value=e.far,e instanceof ct?this.defines.PERSPECTIVE_CAMERA="1":delete this.defines.PERSPECTIVE_CAMERA,this.needsUpdate=!0)}setSize(e,t){const s=this.uniforms;s.resolution.value.set(e,t),s.texelSize.value.set(1/e,1/t),s.aspect.value=e/t}static get Section(){return p}};function Le(e,t,s){for(const i of t){const r="$1"+e+i.charAt(0).toUpperCase()+i.slice(1),a=new RegExp("([^\\.])(\\b"+i+"\\b)","g");for(const n of s.entries())n[1]!==null&&s.set(n[0],n[1].replace(a,r))}}function _s(e,t,s){let i=t.getFragmentShader(),r=t.getVertexShader();const a=i!==void 0&&/mainImage/.test(i),n=i!==void 0&&/mainUv/.test(i);if(s.attributes|=t.getAttributes(),i===void 0)throw new Error(`Missing fragment shader (${t.name})`);if(n&&(s.attributes&G.CONVOLUTION)!==0)throw new Error(`Effects that transform UVs are incompatible with convolution effects (${t.name})`);if(!a&&!n)throw new Error(`Could not find mainImage or mainUv function (${t.name})`);{const o=/\w+\s+(\w+)\([\w\s,]*\)\s*{/g,c=s.shaderParts;let u=c.get(p.FRAGMENT_HEAD)||"",h=c.get(p.FRAGMENT_MAIN_UV)||"",d=c.get(p.FRAGMENT_MAIN_IMAGE)||"",g=c.get(p.VERTEX_HEAD)||"",S=c.get(p.VERTEX_MAIN_SUPPORT)||"";const M=new Set,R=new Set;if(n&&(h+=`	${e}MainUv(UV);
`,s.uvTransformation=!0),r!==null&&/mainSupport/.test(r)){const E=/mainSupport *\([\w\s]*?uv\s*?\)/.test(r);S+=`	${e}MainSupport(`,S+=E?`vUv);
`:`);
`;for(const b of r.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g))for(const F of b[1].split(/\s*,\s*/))s.varyings.add(F),M.add(F),R.add(F);for(const b of r.matchAll(o))R.add(b[1])}for(const E of i.matchAll(o))R.add(E[1]);for(const E of t.defines.keys())R.add(E.replace(/\([\w\s,]*\)/g,""));for(const E of t.uniforms.keys())R.add(E);R.delete("while"),R.delete("for"),R.delete("if"),t.uniforms.forEach((E,b)=>s.uniforms.set(e+b.charAt(0).toUpperCase()+b.slice(1),E)),t.defines.forEach((E,b)=>s.defines.set(e+b.charAt(0).toUpperCase()+b.slice(1),E));const P=new Map([["fragment",i],["vertex",r]]);Le(e,R,s.defines),Le(e,R,P),i=P.get("fragment"),r=P.get("vertex");const D=t.blendMode;if(s.blendModes.set(D.blendFunction,D),a){t.inputColorSpace!==null&&t.inputColorSpace!==s.colorSpace&&(d+=t.inputColorSpace===w?`color0 = sRGBTransferOETF(color0);
	`:`color0 = sRGBToLinear(color0);
	`),t.outputColorSpace!==Ye?s.colorSpace=t.outputColorSpace:t.inputColorSpace!==null&&(s.colorSpace=t.inputColorSpace);const E=/MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;d+=`${e}MainImage(color0, UV, `,(s.attributes&G.DEPTH)!==0&&E.test(i)&&(d+="depth, ",s.readDepth=!0),d+=`color1);
	`;const b=e+"BlendOpacity";s.uniforms.set(b,D.opacity),d+=`color0 = blend${D.blendFunction}(color0, color1, ${b});

	`,u+=`uniform float ${b};

`}if(u+=i+`
`,r!==null&&(g+=r+`
`),c.set(p.FRAGMENT_HEAD,u),c.set(p.FRAGMENT_MAIN_UV,h),c.set(p.FRAGMENT_MAIN_IMAGE,d),c.set(p.VERTEX_HEAD,g),c.set(p.VERTEX_MAIN_SUPPORT,S),t.extensions!==null)for(const E of t.extensions)s.extensions.add(E)}}var As=class extends B{constructor(e,...t){super("EffectPass"),this.fullscreenMaterial=new Bs(null,null,null,e),this.listener=s=>this.handleEvent(s),this.effects=[],this.setEffects(t),this.skipRendering=!1,this.minTime=1,this.maxTime=Number.POSITIVE_INFINITY,this.timeScale=1}set mainScene(e){for(const t of this.effects)t.mainScene=e}set mainCamera(e){this.fullscreenMaterial.copyCameraSettings(e);for(const t of this.effects)t.mainCamera=e}get encodeOutput(){return this.fullscreenMaterial.encodeOutput}set encodeOutput(e){this.fullscreenMaterial.encodeOutput=e}get dithering(){return this.fullscreenMaterial.dithering}set dithering(e){const t=this.fullscreenMaterial;t.dithering=e,t.needsUpdate=!0}setEffects(e){for(const t of this.effects)t.removeEventListener("change",this.listener);this.effects=e.sort((t,s)=>s.attributes-t.attributes);for(const t of this.effects)t.addEventListener("change",this.listener)}updateMaterial(){const e=new Mt;let t=0;for(const n of this.effects)if(n.blendMode.blendFunction===f.DST)e.attributes|=n.getAttributes()&G.DEPTH;else{if((e.attributes&n.getAttributes()&G.CONVOLUTION)!==0)throw new Error(`Convolution effects cannot be merged (${n.name})`);_s("e"+t++,n,e)}let s=e.shaderParts.get(p.FRAGMENT_HEAD),i=e.shaderParts.get(p.FRAGMENT_MAIN_IMAGE),r=e.shaderParts.get(p.FRAGMENT_MAIN_UV);const a=/\bblend\b/g;for(const n of e.blendModes.values())s+=n.getShaderCode().replace(a,`blend${n.blendFunction}`)+`
`;(e.attributes&G.DEPTH)!==0?(e.readDepth&&(i=`float depth = readDepth(UV);

	`+i),this.needsDepthTexture=this.getDepthTexture()===null):this.needsDepthTexture=!1,e.colorSpace===w&&(i+=`color0 = sRGBToLinear(color0);
	`),e.uvTransformation?(r=`vec2 transformedUv = vUv;
`+r,e.defines.set("UV","transformedUv")):e.defines.set("UV","vUv"),e.shaderParts.set(p.FRAGMENT_HEAD,s),e.shaderParts.set(p.FRAGMENT_MAIN_IMAGE,i),e.shaderParts.set(p.FRAGMENT_MAIN_UV,r);for(const[n,o]of e.shaderParts)o!==null&&e.shaderParts.set(n,o.trim().replace(/^#/,`
#`));this.skipRendering=t===0,this.needsSwap=!this.skipRendering,this.fullscreenMaterial.setShaderData(e)}recompile(){this.updateMaterial()}getDepthTexture(){return this.fullscreenMaterial.depthBuffer}setDepthTexture(e,t=de){this.fullscreenMaterial.depthBuffer=e,this.fullscreenMaterial.depthPacking=t;for(const s of this.effects)s.setDepthTexture(e,t)}render(e,t,s,i,r){for(const a of this.effects)a.update(e,t,i);if(!this.skipRendering||this.renderToScreen){const a=this.fullscreenMaterial;a.inputBuffer=t.texture,a.time+=i*this.timeScale,e.setRenderTarget(this.renderToScreen?null:s),e.render(this.scene,this.camera)}}setSize(e,t){this.fullscreenMaterial.setSize(e,t);for(const s of this.effects)s.setSize(e,t)}initialize(e,t,s){this.renderer=e;for(const i of this.effects)i.initialize(e,t,s);this.updateMaterial(),s!==void 0&&s!==W&&(this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}dispose(){super.dispose();for(const e of this.effects)e.removeEventListener("change",this.listener),e.dispose()}handleEvent(e){switch(e.type){case"change":this.recompile();break}}};const Cs=`
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,Ds=`
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
varying vec2 vUv;

uniform float uScanStarts[8];
uniform float uScanCount;

const int MAX_SCANS = 8;

float smoother01(float a, float b, float x){
  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0.0);
    vec3 rd = normalize(vec3(p, 2.0));

    float cR = cos(uTilt), sR = sin(uTilt);
    rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;

    float cY = cos(uYaw), sY = sin(uYaw);
    rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

    vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
    rd.xy += skew * rd.z;

    vec3 color = vec3(0.0);
  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
    float fadeStrength = 2.0;
    vec2 gridUV = vec2(0.0);

  float hitIsY = 1.0;
    for (int i = 0; i < 4; i++)
    {
        float isY = float(i < 2);
        float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
        float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
        float den = isY * rd.y + (1.0 - isY) * rd.x;
        float t = num / den;
        vec3 h = ro + rd * t;

        float depthBoost = smoothstep(0.0, 3.0, h.z);
        h.xy += skew * 0.15 * depthBoost;

    bool use = t > 0.0 && t < minT;
    gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
    }

    vec3 hit = ro + rd * minT;
    float dist = length(hit - ro);

  float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
  if (jitterAmt > 0.0) {
    vec2 j = vec2(
      sin(gridUV.y * 2.7 + iTime * 1.8),
      cos(gridUV.x * 2.3 - iTime * 1.6)
    ) * (0.15 * jitterAmt);
    gridUV += j;
  }
  float fx = fract(gridUV.x);
  float fy = fract(gridUV.y);
  float ax = min(fx, 1.0 - fx);
  float ay = min(fy, 1.0 - fy);
  float wx = fwidth(gridUV.x);
  float wy = fwidth(gridUV.y);
  float halfPx = max(0.0, uLineThickness) * 0.5;

  float tx = halfPx * wx;
  float ty = halfPx * wy;

  float aax = wx;
  float aay = wy;

  float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
  float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
  if (uLineStyle > 0.5) {
    float dashRepeat = 4.0;
    float dashDuty = 0.5;
    float vy = fract(gridUV.y * dashRepeat);
    float vx = fract(gridUV.x * dashRepeat);
    float dashMaskY = step(vy, dashDuty);
    float dashMaskX = step(vx, dashDuty);
    if (uLineStyle < 1.5) {
      lineX *= dashMaskY;
      lineY *= dashMaskX;
    } else {
      float dotRepeat = 6.0;
      float dotWidth = 0.18;
      float cy = abs(fract(gridUV.y * dotRepeat) - 0.5);
      float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
      float dotMaskY = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.y * dotRepeat), cy);
      float dotMaskX = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.x * dotRepeat), cx);
      lineX *= dotMaskY;
      lineY *= dotMaskX;
    }
  }
  float primaryMask = max(lineX, lineY);

  vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
  if (jitterAmt > 0.0) {
    vec2 j2 = vec2(
      cos(gridUV2.y * 2.1 - iTime * 1.4),
      sin(gridUV2.x * 2.5 + iTime * 1.7)
    ) * (0.15 * jitterAmt);
    gridUV2 += j2;
  }
  float fx2 = fract(gridUV2.x);
  float fy2 = fract(gridUV2.y);
  float ax2 = min(fx2, 1.0 - fx2);
  float ay2 = min(fy2, 1.0 - fy2);
  float wx2 = fwidth(gridUV2.x);
  float wy2 = fwidth(gridUV2.y);
  float tx2 = halfPx * wx2;
  float ty2 = halfPx * wy2;
  float aax2 = wx2;
  float aay2 = wy2;
  float lineX2 = 1.0 - smoothstep(tx2, tx2 + aax2, ax2);
  float lineY2 = 1.0 - smoothstep(ty2, ty2 + aay2, ay2);
  if (uLineStyle > 0.5) {
    float dashRepeat2 = 4.0;
    float dashDuty2 = 0.5;
    float vy2m = fract(gridUV2.y * dashRepeat2);
    float vx2m = fract(gridUV2.x * dashRepeat2);
    float dashMaskY2 = step(vy2m, dashDuty2);
    float dashMaskX2 = step(vx2m, dashDuty2);
    if (uLineStyle < 1.5) {
      lineX2 *= dashMaskY2;
      lineY2 *= dashMaskX2;
    } else {
      float dotRepeat2 = 6.0;
      float dotWidth2 = 0.18;
      float cy2 = abs(fract(gridUV2.y * dotRepeat2) - 0.5);
      float cx2 = abs(fract(gridUV2.x * dotRepeat2) - 0.5);
      float dotMaskY2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.y * dotRepeat2), cy2);
      float dotMaskX2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.x * dotRepeat2), cx2);
      lineX2 *= dotMaskY2;
      lineY2 *= dotMaskX2;
    }
  }
    float altMask = max(lineX2, lineY2);

    float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
    float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
    float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
    float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
    altMask *= edgeGate;

  float lineMask = max(primaryMask, altMask);

    float fade = exp(-dist * fadeStrength);

    float dur = max(0.05, uScanDuration);
    float del = max(0.0, uScanDelay);
    float scanZMax = 2.0;
    float widthScale = max(0.1, uScanGlow);
    float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
    float sigmaA = sigma * 2.0;

    float combinedPulse = 0.0;
    float combinedAura = 0.0;

    float cycle = dur + del;
    float tCycle = mod(iTime, cycle);
    float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
    float phase = scanPhase;
    if (uScanDirection > 0.5 && uScanDirection < 1.5) {
      phase = 1.0 - phase;
    } else if (uScanDirection > 1.5) {
      float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
      phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
    }
    float scanZ = phase * scanZMax;
    float dz = abs(hit.z - scanZ);
    float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
    float taper = clamp(uPhaseTaper, 0.0, 0.49);
    float headW = taper;
    float tailW = taper;
    float headFade = smoother01(0.0, headW, phase);
    float tailFade = 1.0 - smoother01(1.0 - tailW, 1.0, phase);
    float phaseWindow = headFade * tailFade;
    float pulseBase = lineBand * phaseWindow;
    combinedPulse += pulseBase * clamp(uScanOpacity, 0.0, 1.0);
    float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
    combinedAura += (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

    for (int i = 0; i < MAX_SCANS; i++) {
      if (float(i) >= uScanCount) break;
      float tActiveI = iTime - uScanStarts[i];
      float phaseI = clamp(tActiveI / dur, 0.0, 1.0);
      if (uScanDirection > 0.5 && uScanDirection < 1.5) {
        phaseI = 1.0 - phaseI;
      } else if (uScanDirection > 1.5) {
        phaseI = (phaseI < 0.5) ? (phaseI * 2.0) : (1.0 - (phaseI - 0.5) * 2.0);
      }
      float scanZI = phaseI * scanZMax;
      float dzI = abs(hit.z - scanZI);
      float lineBandI = exp(-0.5 * (dzI * dzI) / (sigma * sigma));
      float headFadeI = smoother01(0.0, headW, phaseI);
      float tailFadeI = 1.0 - smoother01(1.0 - tailW, 1.0, phaseI);
      float phaseWindowI = headFadeI * tailFadeI;
      combinedPulse += lineBandI * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
      float auraBandI = exp(-0.5 * (dzI * dzI) / (sigmaA * sigmaA));
      combinedAura += (auraBandI * 0.25) * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
    }

  float lineVis = lineMask;
  vec3 gridCol = uLinesColor * lineVis * fade;
  vec3 scanCol = uScanColor * combinedPulse;
  vec3 scanAura = uScanColor * combinedAura;

    color = gridCol + scanCol + scanAura;

  float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
  color += (n - 0.5) * uNoise;
  color = clamp(color, 0.0, 1.0);
  float alpha = clamp(max(lineVis, combinedPulse), 0.0, 1.0);
  float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + aax * 2.0, ax);
  float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + aay * 2.0, ay);
  float halo = max(gx, gy) * fade;
  alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));
  fragColor = vec4(color, alpha);
}

void main(){
  vec4 c;
  mainImage(c, vUv * iResolution.xy);
  gl_FragColor = c;
}
`,Fs=({sensitivity:e=.55,lineThickness:t=1,linesColor:s="#2F293A",scanColor:i="#FF9FFC",scanOpacity:r=.4,gridScale:a=.1,lineStyle:n="solid",lineJitter:o=.1,scanDirection:c="pingpong",enablePost:u=!0,bloomIntensity:h=0,bloomThreshold:d=0,bloomSmoothing:g=0,chromaticAberration:S=.002,noiseIntensity:M=.01,scanGlow:R=.5,scanSoftness:P=2,scanPhaseTaper:D=.9,scanDuration:E=2,scanDelay:b=2,enableGyro:F=!1,scanOnClick:q=!1,snapBackDelay:Me=250,className:we,style:Je})=>{const fe=x.useRef(null),et=x.useRef(null),Q=x.useRef(null),z=x.useRef(null),X=x.useRef(null),he=x.useRef(null),J=x.useRef(null),ee=x.useRef(new T(0,0)),ve=x.useRef(0),ye=x.useRef(0),te=x.useRef(new T(0,0)),tt=x.useRef(new T(0,0)),pe=x.useRef(0),Ue=x.useRef(0),me=x.useRef(0),Be=x.useRef(0),se=8,_e=x.useRef([]),st=v=>{const l=_e.current.slice();if(l.length>=se&&l.shift(),l.push(v),_e.current=l,Q.current){const _=Q.current.uniforms,y=new Array(se).fill(0);for(let U=0;U<l.length&&U<se;U++)y[U]=l[U];_.uScanStarts.value=y,_.uScanCount.value=l.length}},K=A.clamp(e,0,1),ge=A.lerp(.06,.2,K),Ae=A.lerp(.12,.3,K),Ce=A.lerp(.1,.28,K),ie=A.lerp(.45,.12,K),re=1/0,De=A.lerp(1.2,1.6,K);return x.useEffect(()=>{const v=fe.current;if(!v)return;let l=null;const _=V=>{l&&(clearTimeout(l),l=null);const I=v.getBoundingClientRect(),ae=(V.clientX-I.left)/I.width*2-1,ne=-((V.clientY-I.top)/I.height*2-1);ee.current.set(ae,ne)},y=async()=>{const V=performance.now()/1e3;if(q&&st(V),F&&typeof window<"u"&&window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)try{await DeviceOrientationEvent.requestPermission()}catch{}},U=()=>{l&&(clearTimeout(l),l=null)},N=()=>{l&&clearTimeout(l),l=window.setTimeout(()=>{ee.current.set(0,0),ve.current=0,ye.current=0},Math.max(0,Me||0))};return v.addEventListener("mousemove",_),v.addEventListener("mouseenter",U),q&&v.addEventListener("click",y),v.addEventListener("mouseleave",N),()=>{v.removeEventListener("mousemove",_),v.removeEventListener("mouseenter",U),v.removeEventListener("mouseleave",N),q&&v.removeEventListener("click",y),l&&clearTimeout(l)}},[Me,q,F]),x.useEffect(()=>{const v=fe.current;if(!v)return;const l=new ft({antialias:!0,alpha:!0});et.current=l,l.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),l.setSize(v.clientWidth,v.clientHeight),l.outputColorSpace=w,l.toneMapping=ht,l.autoClear=!1,l.setClearColor(0,0),v.appendChild(l.domElement);const _={iResolution:{value:new vt(v.clientWidth,v.clientHeight,l.getPixelRatio())},iTime:{value:0},uSkew:{value:new T(0,0)},uTilt:{value:0},uYaw:{value:0},uLineThickness:{value:t},uLinesColor:{value:ce(s)},uScanColor:{value:ce(i)},uGridScale:{value:a},uLineStyle:{value:n==="dashed"?1:n==="dotted"?2:0},uLineJitter:{value:Math.max(0,Math.min(1,o||0))},uScanOpacity:{value:r},uNoise:{value:M},uBloomOpacity:{value:h},uScanGlow:{value:R},uScanSoftness:{value:P},uPhaseTaper:{value:D},uScanDuration:{value:E},uScanDelay:{value:b},uScanDirection:{value:c==="backward"?1:c==="pingpong"?2:0},uScanStarts:{value:new Array(se).fill(0)},uScanCount:{value:0}},y=new k({uniforms:_,vertexShader:Cs,fragmentShader:Ds,transparent:!0,depthWrite:!1,depthTest:!1});Q.current=y;const U=new Te,N=new Ge(-1,1,1,-1,0,1),V=new ke(new pt(2,2),y);U.add(V);let I=null;if(u){I=new bt(l),z.current=I;const j=new ws(U,N);I.addPass(j);const L=new Es({intensity:1,luminanceThreshold:d,luminanceSmoothing:g});L.blendMode.opacity.value=Math.max(0,h),X.current=L;const Z=new Ms({offset:new T(S,S),radialModulation:!0,modulationOffset:0});he.current=Z;const $=new As(N,L,Z);$.renderToScreen=!0,I.addPass($)}const ae=()=>{l.setSize(v.clientWidth,v.clientHeight),y.uniforms.iResolution.value.set(v.clientWidth,v.clientHeight,l.getPixelRatio()),z.current&&z.current.setSize(v.clientWidth,v.clientHeight)};window.addEventListener("resize",ae);let ne=performance.now();const Ie=()=>{const j=performance.now(),L=Math.max(0,Math.min(.1,(j-ne)/1e3));ne=j,te.current.copy(Is(te.current,ee.current,tt.current,ie,re,L));const Z=He(pe.current,ve.current,{v:Ue.current},ie,re,L);pe.current=Z.value,Ue.current=Z.v;const $=He(me.current,ye.current,{v:Be.current},ie,re,L);me.current=$.value,Be.current=$.v;const Oe=new T(te.current.x*ge,-te.current.y*De*ge);y.uniforms.uSkew.value.set(Oe.x,Oe.y),y.uniforms.uTilt.value=pe.current*Ae,y.uniforms.uYaw.value=A.clamp(me.current*Ce,-.6,.6),y.uniforms.iTime.value=j/1e3,l.clear(!0,!0,!0),z.current?z.current.render(L):l.render(U,N),J.current=requestAnimationFrame(Ie)};return J.current=requestAnimationFrame(Ie),()=>{J.current&&cancelAnimationFrame(J.current),window.removeEventListener("resize",ae),y.dispose(),V.geometry.dispose(),z.current&&(z.current.dispose(),z.current=null),l.dispose(),l.forceContextLoss(),v.removeChild(l.domElement)}},[e,t,s,i,r,a,n,o,c,u,M,h,R,P,D,E,b,d,g,S,ie,re,ge,De,Ae,Ce]),x.useEffect(()=>{const v=Q.current;if(v){const l=v.uniforms;l.uLineThickness.value=t,l.uLinesColor.value.copy(ce(s)),l.uScanColor.value.copy(ce(i)),l.uGridScale.value=a,l.uLineStyle.value=n==="dashed"?1:n==="dotted"?2:0,l.uLineJitter.value=Math.max(0,Math.min(1,o||0)),l.uBloomOpacity.value=Math.max(0,h),l.uNoise.value=Math.max(0,M),l.uScanGlow.value=R,l.uScanOpacity.value=Math.max(0,Math.min(1,r)),l.uScanDirection.value=c==="backward"?1:c==="pingpong"?2:0,l.uScanSoftness.value=P,l.uPhaseTaper.value=D,l.uScanDuration.value=Math.max(.05,E),l.uScanDelay.value=Math.max(0,b)}X.current&&(X.current.blendMode.opacity.value=Math.max(0,h),X.current.luminanceMaterial.threshold=d,X.current.luminanceMaterial.smoothing=g),he.current&&he.current.offset.set(S,S)},[t,s,i,a,n,o,h,d,g,S,M,R,r,c,P,D,E,b]),x.useEffect(()=>{if(!F)return;const v=l=>{const _=l.gamma??0,y=l.beta??0,U=A.clamp(_/45,-1,1),N=A.clamp(-y/30,-1,1);ee.current.set(U,N),ve.current=A.degToRad(_)*.4};return window.addEventListener("deviceorientation",v),()=>{window.removeEventListener("deviceorientation",v)}},[F]),it.jsx("div",{ref:fe,className:`gridscan${we?` ${we}`:""}`,style:Je,"aria-hidden":"true"})};function ce(e){return new Ve(e).convertSRGBToLinear()}function Is(e,t,s,i,r,a){const n=e.clone();i=Math.max(1e-4,i);const o=2/i,c=o*a,u=1/(1+c+.48*c*c+.235*c*c*c);let h=e.clone().sub(t);const d=t.clone(),g=r*i;h.length()>g&&h.setLength(g),t=e.clone().sub(h);const S=s.clone().addScaledVector(h,o).multiplyScalar(a);s.sub(S.clone().multiplyScalar(o)),s.multiplyScalar(u),n.copy(t.clone().add(h.add(S).multiplyScalar(u)));const M=d.clone().sub(e),R=n.clone().sub(d);return M.dot(R)>0&&(n.copy(d),s.set(0,0)),n}function He(e,t,s,i,r,a){i=Math.max(1e-4,i);const n=2/i,o=n*a,c=1/(1+o+.48*o*o+.235*o*o*o);let u=e-t;const h=t,d=r*i;u=Math.sign(u)*Math.min(Math.abs(u),d),t=e-u;const g=(s.v+n*u)*a;s.v=(s.v-n*g)*c;let S=t+(u+g)*c;const M=h-e,R=S-h;return M*R>0&&(S=h,s.v=0),{value:S,v:s.v}}export{Fs as GridScan};
