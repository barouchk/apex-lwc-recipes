public with sharing class DynamicOption {
    @AuraEnabled
    public String icon { get;set;}
    @AuraEnabled
    public String label {get;set;}
    @AuraEnabled
    public String title {get;set;}
    @AuraEnabled
    public String value {get;set;}
    @AuraEnabled
    public String checked {get;set;}
    @AuraEnabled
    public Boolean disabled {get;set;}
    @AuraEnabled
    public Boolean required {get;set;}
    @AuraEnabled
    public String variant {get;set;}
    @AuraEnabled
    public String description {get;set;}
}