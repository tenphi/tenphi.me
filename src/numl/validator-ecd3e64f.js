import{W as t,G as s}from"./index-957404e9.js";export default class extends t{static get params(){return{primary:!0,linkValue:!1,linkHostValue:!1}}init(){this.props.for=t=>{this.fieldId=t},this.props.assert=t=>{if(t){const s=t.split(":");this.assert=s[0],this.assertValue=s[1]}else this.assert=null},super.init()}get field(){return this.host.getAttribute("for").trim()}connected(){this.linkContext("form",t=>{this.currentForm&&t!==this.currentForm&&this.disconnectForm(this.currentForm,!!t),this.currentForm=t,t&&this.connectForm()})}changed(t,s){super.changed(t,s),this.form&&this.connectForm()}connectForm(){const{fieldId:t,assert:s,form:e,assertValue:r}=this;t&&s&&e&&this.form.registerCheck(t,this,s,r)}disconnectForm(t=this.currentForm,s){const{fieldId:e,assert:r}=this;e&&r&&(t.unregisterCheck(e),s||delete this.form)}setValidity(t){const{host:e}=this;this.validity!==t&&(super.setValidity(t),s(e,t,"collapse"))}}
