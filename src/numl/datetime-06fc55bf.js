import"./index-957404e9.js";import{F as e}from"./formatter-82e3d327.js";const t="long",i="short",r="numeric",a={a:(e,t)=>(new Intl.DateTimeFormat(t,{hour:r}).format(e).split(" ")[1]||"").toLowerCase(),ss:(e,t)=>new Intl.DateTimeFormat(t,{minute:"2-digit",second:"2-digit"}).format(e).split(":")[1].toLowerCase(),s:{second:r},mm:(e,t)=>new Intl.DateTimeFormat(t,{hour:"2-digit",minute:"2-digit"}).format(e).split(":")[1].split(" ")[0].toLowerCase(),m:{minute:r},hh:(e,t)=>new Intl.DateTimeFormat(t,{hour:"2-digit"}).format(e).split(/\s/)[0].toLowerCase(),h:(e,t)=>new Intl.DateTimeFormat(t,{hour:r}).format(e).split(/\s/)[0].toLowerCase(),DD:{day:"2-digit"},D:{day:r},dddd:{weekday:t},ddd:{weekday:i},dd:{weekday:"narrow"},MMMM:{month:t},MMM:{month:i},MM:{month:"2-digit"},M:{month:r},YYYY:{year:r},YY:{year:"2-digit"}},o={weekday:[[t,i,"narrow"],i],era:[[t,i,"narrow"],i],year:[[r,"2-digit"],r],month:[[r,"2-digit",t,i,"narrow"],t],day:[[r,"2-digit"],r],hour:[[r,"2-digit"],"2-digit"],minute:[[r,"2-digit"],"2-digit"],second:[[r,"2-digit"],"2-digit"],dayperiod:[["narrow",i,t],i,"dayPeriod"],calendar:[["buddhist","chinese","coptic","ethiopia","ethiopic","gregory","hebrew","indian","islamic","iso8601","japanese","persian","roc"]],system:[["arab","arabext","bali","beng","deva","fullwide","gujr","guru","hanidec","khmr"," knda","laoo","latn","limb","mlym","mong","mymr","orya","tamldec"," telu","thai","tibt"]],date:[["full",t,"medium",i],"medium","dateStyle"],time:[["full",t,"medium",i],"medium","timeStyle"],zone:[[t,i],null,"timeZoneName"],hourcycle:[["h11","h12","h23","h24","auto"],"auto","hourCycle"]};function n(e,t,i){e=e||new Date;const r=null!=i.fallback?i.fallback:"–";if(!(e instanceof Date))if("now"===e)e=new Date;else{if(null==e)return r;e=new Date(e)}const m=e.getTime();if(m!=m)return r;if(i.format){let r=i.format;return r=r.replace(/\w+/gi,i=>{const r=a[i];return r?"function"==typeof r?r(e,t):n(e,t,r):i}),r.trim()}const d=Object.entries(o).reduce((e,[t,r])=>{const a=r[2]||t,o=r[1],n=i[t];return r=r[0],""===n&&o?e[a]=o:n&&r.includes(n)&&(e[a]=n),e},{});i.timezone&&(d.timeZone=i.timezone),i.hourcycle&&"auto"!==i.hourcycle&&(d.hourCycle=i.hourcycle);const l=new Intl.DateTimeFormat(t,d);try{return l.format(e)}catch(e){return r}}export default class extends e{static get formatter(){return n}constructor(e,t){super(e,t),this.intervalId=null}apply(){super.apply(),clearInterval(this.intervalId),"now"===this.value&&(this.intervalId=setInterval(()=>{this.apply()},1e3))}}
