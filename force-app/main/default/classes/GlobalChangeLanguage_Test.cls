@isTest
public with sharing class GlobalChangeLanguage_Test {
   @isTest static void changeLang(){

    GlobalChangeLanguage.AuraResponse response = new GlobalChangeLanguage.AuraResponse();
       Test.startTest();
       response = GlobalChangeLanguage.changeUserLang();
       Test.stopTest();
       User connectedUser =[select Id, LanguageLocaleKey from User where Id =:UserInfo.getUserId()];
       System.assertEquals(connectedUser.LanguageLocaleKey, response.lang);
   }
}