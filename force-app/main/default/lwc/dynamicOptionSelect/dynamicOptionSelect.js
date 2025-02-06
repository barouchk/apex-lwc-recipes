import { LightningElement, api, track } from 'lwc';
import { TYPES, MAX_OPTIONS_PER_COLUMN } from "./constants"
import {
    FlowAttributeChangeEvent,
} from 'lightning/flowSupport';

export default class DynamicOptionSelect extends LightningElement {

    @api availableActions = [];

    @api options = []

    @track collection = []

    @api type = 'checkbox'

    @api label = ''

    @api required

    @api columns = 1

    @api name = 'checkbox'

    @api defaultValue = ''

    @track _selectedValues = []
    @api get selectedValues() {
        return this._selectedValues
    }

    set selectedValues(value) {
        if (value) {
            this._selectedValues = [...value]
        }
    }

    @track _selectedItems = []
    @api get selectedItems() {
        return this._selectedItems
    }

    set selectedItems(value) {
        if (value) {
            this._selectedItems = [...value]
        }
    }

    connectedCallback() {
        if (this.init) {
            return;
        }

        this.init = true;

        this.collection = JSON.parse(JSON.stringify(this.options))
        this.selectedValues = []
        this.selectedItems = []

        if (this.defaultValue) {
            let item = this.collection.find(item => item.value === this.defaultValue)
            if (item) {
                item.checked = true;
                this.selectedItems.push(item)
                this.selectedValues.push(this.defaultValue)
                if (this.isButton) {
                    item.variant = 'brand'
                }
            }
        }

        this.fireFlowElementsChanged()
    }

    get isOptions() {
        return this.options?.length ?? 0;
    }
    get isCheckbox() {
        return this.isOptions && this.type === TYPES.CHECKBOX;
    }
    get isRadio() {
        return this.isOptions && (this.type === TYPES.RADIO);
    }
    get isDropdown() {
        return this.isOptions && this.type === TYPES.DROPDOWN;
    }
    get isButton() {
        return this.isOptions && this.type === TYPES.BUTTON;
    }
    get isInput() {
        return this.isCheckbox || this.isRadio
    }
    get gridClass() {
        return (this.isRadio || this.isCheckbox) && this.columns > 1 ? 'slds-grid slds-wrap' : ''
    }
    get columnClass() {
        return (this.isRadio || this.isCheckbox) && this.columns > 1 ? `slds-form-element slds-col slds-size_1-of-${this.columns}` : 'slds-form-element'
    }

    handleChange(event) {
        const { value, checked } = event.target

        this.selectedValues = []
        this.selectedItems = []
        this.defaultValue = ''

        this.collection = this.collection.map((item) => {
            if (this.isCheckbox) {
                if (item.value === value) {
                    item.checked = checked
                }
                if (item.checked) {
                    this.selectedItems.push(item)
                    this.selectedValues.push(item.value)
                }
            } else if (this.isRadio || this.isDropdown) {
                item.checked = item.value === value
                if (item.value === value) {
                    this.defaultValue = value
                    this.selectedItems.push(item)
                    this.selectedValues.push(value)
                }
            } else if (this.isButton) {
                item.variant = item.value === value ? 'brand' : ''
                if (item.value === value) {
                    this.selectedItems.push(item)
                    this.selectedValues.push(value)
                }
            }
            return item
        })
        this.fireFlowElementsChanged();
    }

    @api
    validate(){
        // this.errMessage = '';

        // if(!this.selectedValues ){
        //     this.errMessage = ThisFieldIsRequired;
        //     this.elementClass += `${FORM_ELEMENT_CLASS} slds-has-error`;
           
        //     return { 
        //         isValid: false, 
        //         errorMessage: this.errMessage
        //         }; 
        // }

        // return { isValid: true }; 
    }

    fireFlowElementsChanged() {
        this.dispatchEvent(new FlowAttributeChangeEvent(
            'selectedValues',
            this.selectedValues
        ));

        this.dispatchEvent(new FlowAttributeChangeEvent(
            'selectedItems',
            this.selectedItems
        ));
    }

}