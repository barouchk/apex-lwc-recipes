({
    init: function (component, event, helper) {

        const timeout = component.get("v.timeout") || 0

        setTimeout(() => {
            $A.get("e.force:navigateToSObject").setParams({
                "recordId": component.get("v.recId"),
                "slideDevName": "related"
            }).fire();
        }, timeout);
    }
})