import { LightningElement, api, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

export default class CustomPicklist extends LightningElement {
    @api recordTypeId;
    @api objectApiName;
    @api fieldApiName;
    @api selectedValue;
    @api selectedLabel;
    @api fieldLabel;
    @api required;
    @api validationMessage;
    @api searchable;
    @api dependentValue;
    @api isDependentField;
    @api sortable;

    @api autoAlignment = false

    disabled = false

    objectName;
    options;

    @api
    validate() {
        // the component is required only when there is values in picklist
        if (!this.disabled && this.required) {
            if (!this.searchable) {
                const isValid = [...this.template.querySelectorAll('lightning-combobox')].reduce((validSoFar, field) => {
                    return validSoFar && field.checkValidity();
                }, true);
                return { isValid, errorMessage: this.validationMessageByValidity[isValid] };
            }
        }
        else {
            return true;
        }
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: '$objectName', recordTypeId: '$recordTypeId', dependentValue: '$dependentValue' })
    propertyOrFunction({ error, data }) {
        if (data) {
            const { values, controllerValues } = data.picklistFieldValues[this.fieldApiName];

            this.selectedValue = (this.selectedValue == null ? '' : this.selectedValue);

            if (this.isDependentField) {
                let key = controllerValues[this.dependentValue];
                this.options = [...values.filter(option => option.validFor.includes(key))];
            } else {
                this.options = [...values];
            }
            if (this.sortable) {
                this.options.sort((op1, op2) => { return op1.label.localeCompare(op2.label) });
            }
        }
    }

    @wire(getObjectInfo, { objectApiName: '$objectName' })
    loadLabels({ error, data }) {
        if (data) {
            if (!this.recordTypeId) {
                this.recordTypeId = data.defaultRecordTypeId;
            }
            if (!this.fieldLabel) {
                this.fieldLabel = data.fields[this.fieldApiName].label;
            }
        }
    }

    connectedCallback() {
        this.validationMessageByValidity = { false: this.validationMessage };
        this.objectName = { objectApiName: this.objectApiName };
    }

    handleChange(event) {
        event.stopPropagation();

        const { value, label } = event.target;
        this.selectedValue = value;
        this.selectedLabel = this.options.find(x => x.value === value)?.label;
        let isValidate = this.validate();
        const pickListEvent = new CustomEvent('custompicklistevent', {
            detail: {
                isValidate: isValidate,
                selectedValue: value
            }
            , bubbles: true
            , composed: true
        });
        this.dispatchEvent(pickListEvent);

        this.flowChangeAttribute({ detail: { key: this.selectedValue } });
    }

    flowChangeAttribute(eventObj) {
        let value = eventObj.detail.key;
        this.selectedValue = value;
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedValue', value));

    }
}