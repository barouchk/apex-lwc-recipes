import { LightningElement } from "lwc";
import changeUserLang from "@salesforce/apex/GlobalChangeLanguage.changeUserLang";

export default class ChangeLanguage extends LightningElement {
  message;
  lang;
  isSuccess;
  connectedCallback() {
    this.callApexMethod();
  }
  
  callApexMethod() {
    changeUserLang()
      .then((result) => {
        this.isSuccess = result.isSuccess;
        this.message = result.message;
        this.lang = result.lang;
        window.indexedDB.deleteDatabase("actions");
        window.indexedDB.deleteDatabase("ldsObjectInfo");
        window.location.reload();
        console.log("Apex method called successfully", result);
      })
      .catch((error) => {
        this.isSuccess = false;
        this.message = error.body.message;
        console.error("Error calling Apex method", error);
      });
  }
    
}