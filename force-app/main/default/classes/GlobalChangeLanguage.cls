public with sharing class GlobalChangeLanguage {
    @AuraEnabled
    public static AuraResponse changeUserLang(){
        AuraResponse res = new AuraResponse();
        try{
            User connectedUser = [select Id, LanguageLocaleKey from User where Id =:UserInfo.getUserId()];
            String lang = connectedUser.LanguageLocaleKey;
            connectedUser.LanguageLocaleKey = lang == 'en_US'?'iw':'en_US';
            update connectedUser;
            res.isSuccess =true;
            res.lang = connectedUser.LanguageLocaleKey;
        }
        catch(DmlException ex){
            res.isSuccess = false;
            res.message = ex.getMessage();
        }
        return res;
    }
 
    public class AuraResponse {
        @AuraEnabled public Boolean isSuccess { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public String lang;
        public AuraResponse(){
            isSuccess = true;
            message = '';
        }
    }
 }