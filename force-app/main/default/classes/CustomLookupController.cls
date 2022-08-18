/**
 * Created by bkandov on 27/10/2020.
 */

public with sharing class CustomLookupController {

    @AuraEnabled(Cacheable=true)
    public static List<SObjectResult> getResults(String ObjectName, String fieldName, String displayName, 
                                                String value, Boolean showFirst, Map<String, Object> extraParams, 
                                                String distinctByField, String orderBy) {

        List<SObjectResult> sObjectResultList = new List<SObjectResult>();
        if (String.isNotEmpty(value)) {

            String query = 'SELECT Id,' + String.escapeSingleQuotes(displayName) +
                    ' FROM ' + String.escapeSingleQuotes(ObjectName) +
                    ' WHERE ' + String.escapeSingleQuotes(fieldName) +
                    ' LIKE \'%' + String.escapeSingleQuotes(value) + '%\'';

            if (extraParams != null) {
                for (String field : extraParams.keySet()) {
                    Object obj = extraParams.get(field);
                    if (obj instanceOf List<Object>){
                        List<String> valuesInList = new List<String>();
                        for (Object objElement : (List<Object>)obj){
                            valuesInList.add(String.valueOf(objElement));
                        }
                        query += ' AND ' + field + ' IN (\'' + String.join(valuesInList, '\',\'') + '\')';
                    } else if(obj instanceOf Boolean){
                        Boolean val = Boolean.valueOf(String.escapeSingleQuotes(String.valueOf(obj)));
                        query += ' AND ' + field + ' = :val';
                    } else {
                        query += ' AND ' + field + ' = \'' + String.escapeSingleQuotes(String.valueOf(obj)) + '\'';
                    }
                }
            }

            if(String.isNotEmpty(orderBy)){
                query += ' ORDER BY ' + String.escapeSingleQuotes(orderBy);
            }

            query += ' LIMIT 10';

            List<SObject> sObjects = Database.Query(query);
            List<String> fields = displayName.split(',');
            Map<String, Schema.SObjectField> sObjectFieldsMap;
            if (!sObjects.isEmpty()){
                sObjectFieldsMap = sObjects[0].getSobjectType().getDescribe().fields.getMap();
            }

            for (sObject so : sObjects) {
                Map<String, String> fieldDisplayValues = new Map<String, String>();
                String fieldValue;

                if (fields.size() == 1) {
                    fieldValue = sObjectFieldsMap.containsKey(displayName) ?
                                addValueFromObject(displayName, so, fieldDisplayValues) :
                                addValueFromRelatedObject(displayName, so, fieldDisplayValues);
                } else {
                    for (String field : fields) {
                        if (sObjectFieldsMap.containsKey(field)){
                            addValueFromObject(field, so, fieldDisplayValues);
                        } else {
                            addValueFromRelatedObject(field, so, fieldDisplayValues);
                        }
                    }

                    if (showFirst != null && showFirst) {
                        fieldValue = fieldDisplayValues.values()[0];
                    } else {
                        fieldValue = String.join(fieldDisplayValues.values(), ' \u2022 ');
                    }
                }

                sObjectResultList.add(new SObjectResult(so.Id, fieldValue, fieldDisplayValues));
            }
        }

        return String.isEmpty(distinctByField) ? sObjectResultList : applyDistinctDisplayValue(sObjectResultList, distinctByField);
    }

    private static List<SObjectResult> applyDistinctDisplayValue(List<SObjectResult> sObjectResultList, String distinctByField) {
        Map<String, SObjectResult> sObjectResultMap = new Map<String, SObjectResult>();

        for(SObjectResult res : sObjectResultList) {
            sObjectResultMap.put(res.FieldsParams.get(distinctByField), res);
        }

        return sObjectResultMap.values();
    }

    // support query style lookup field. For example: UserRole.Name
    private static String addValueFromRelatedObject(String field, sObject so, Map<String, String> fieldDisplayValues){
        String fValue = '';
        if (field.contains('.')) {
            List<String> objectsAndFields = field.split('\\.');
            String objName = objectsAndFields[0];
            String objFieldName = objectsAndFields[1];
            if (so.getSObject(objectsAndFields[0]) != null){
                fValue = String.valueOf(so.getSObject(objName).get(objFieldName));
                fieldDisplayValues.put(field, fValue);
            }
        }

        return fValue;
    }

    private static String addValueFromObject(String field, sObject so, Map<String, String> fieldDisplayValues){
        String fValue = String.valueOf(so.get(field));
        fieldDisplayValues.put(field, fValue);
        return fValue;
    }

    public class SObjectResult {
        @AuraEnabled
        public String Name;

        @AuraEnabled
        public Id Id;

        @AuraEnabled
        public Map<String, String> FieldsParams;

        public SObjectResult(Id Id, String Name, Map<String, String> FieldsParams) {
            this.Id = Id;
            this.Name = Name;
            this.FieldsParams = FieldsParams;
        }
    }
}