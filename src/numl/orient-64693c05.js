import{B as t}from"./index-957404e9.js";const e="orient",n="vertical",i="horizontal";export default class extends t{constructor(t,e=""){super(t);const n=e.split(/\s+/g);this.aria=!n.includes("no-aria"),this.dynamic=n.includes("dynamic"),this.orient=n.includes("v")?"v":"h",this.dynamic&&t.addEventListener("focusin",()=>{const e=getComputedStyle(t);this.set(e.flexFlow.includes("column")||"v"===e.getPropertyValue("--nu-orient")?"v":"h")},{passive:!0})}set(t){const{host:e}=this;if(null==t){const n=e.nuGetAttr("orient",!0);t=null!=n?n:"h"}const n="v"===t?"vertical":"horizontal";e.nuSetAria("orientation",n),e.nuSetContext("orientation",n),this.orient=n}connected(){this.set()}changed(t){"orient"===t&&this.set()}}export{i as HORIZONTAL,e as ORIENT_ATTR,n as VERTICAL};
