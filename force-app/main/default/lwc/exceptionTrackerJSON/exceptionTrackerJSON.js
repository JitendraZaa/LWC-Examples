/*
 * Copyright  2024 , Author - Jitendra Zaa
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *        https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 *         https://wwww.jitendraZaa.com
 * 
 * @date          December 2024
 * @author        Jitendra Zaa
 * @email         jitendra.zaa+30@gmail.com
 * @description   LWC component to display JSON data in a user-friendly format without using any external libraries and Apex.
 */

import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

export default class ExceptionTrackerJSON extends LightningElement {
    @api recordId;
    @api fieldApiName = 'Exception_Tracker__c.Message__c';

    @track fieldNameSimple ;
    @track sectionTitle ='User Friendly JSON';

    jsonData;
    hasRendered = false;

    @wire(getRecord, { recordId: '$recordId', fields: '$fieldApiName' })
    wiredRecord({ error, data }) {
        this.fieldNameSimple = this.fieldApiName.split('.')[1];
        this.sectionTitle = 'User Friendly JSON - '+this.fieldNameSimple;

        if (data) { 
            const messageValue = data.fields[this.fieldNameSimple]?.value;
            if (messageValue) {
                try {
                    this.jsonData = JSON.parse(messageValue);
                    this.hasRendered = false; // Reset the flag to trigger re-render
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    this.jsonData = null;
                }
            } else {
                this.jsonData = null;
            }
        } else if (error) {
            console.error('Error fetching record:', error);
            this.jsonData = null;
        }
    }
 

    renderedCallback() {
        if (this.jsonData && !this.hasRendered) {
            this.renderFormattedJSON();
            this.hasRendered = true;
        }
    }

    renderFormattedJSON() {
        const container = this.template.querySelector('.json-container');
        if (container) {
            container.innerHTML = this.formatJSON(this.jsonData, 0);
        } else {
            console.error('JSON container element not found');
        }
    }

    formatJSON(obj, indent = 0) {
        const indentString = '    '.repeat(indent);
        let result = '';

        if (typeof obj === 'object' && obj !== null) {
            const isArray = Array.isArray(obj);
            result += isArray ? '[\n' : '{\n';

            const entries = Object.entries(obj);
            entries.forEach(([key, value], index) => {
                result += indentString + '    ';
                if (!isArray) {
                    result += `<span class="json-key">"${this.escapeHTML(key)}"</span>: `;
                }
                result += this.formatJSONValue(value, indent + 1);
                if (index < entries.length - 1) {
                    result += ',';
                }
                result += '\n';
            });

            result += indentString + (isArray ? ']' : '}');
        } else {
            result += this.formatJSONValue(obj, indent);
        }

        return result;
    }

    formatJSONValue(value, indent) {
        if (typeof value === 'object' && value !== null) {
            return this.formatJSON(value, indent);
        } else if (typeof value === 'string') {
            return `<span class="json-string">"${this.escapeHTML(value)}"</span>`;
        } else if (typeof value === 'number') {
            return `<span class="json-number">${value}</span>`;
        } else if (typeof value === 'boolean') {
            return `<span class="json-boolean">${value}</span>`;
        } else if (value === null) {
            return `<span class="json-null">null</span>`;
        }
        return `<span class="json-unknown">${this.escapeHTML(String(value))}</span>`;
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}
