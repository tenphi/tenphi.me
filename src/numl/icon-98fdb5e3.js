import{B as t,C as e,I as s,D as n}from"./index-957404e9.js";export default class extends t{init(){this.setMod("icon",!0)}connected(){this.host.nuSetAria("hidden",!0),this.apply()}changed(t){this.isConnected&&"name"===t&&this.apply()}apply(){const{host:t}=this,i=this.host.nuGetAttr("name");if(this.innerHTML="",!i)return;e(i).forEach(e=>{t.querySelector(`svg[name="${e}"]`)||s.load(e.trim()).then(s=>{if(!s)return;const i=n(s);i.setAttribute("name",e),i.style.opacity="0",t.appendChild(i)}).catch(()=>"")})}}
