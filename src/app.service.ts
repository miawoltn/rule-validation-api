import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  message: string; // message
  // place holders for storing validation components
  condition: string;
  condition_value: any;
  fieldName: string;
  fieldValue: any;

  validateRule(rule: Rule): boolean {
    this.resetMessage();
    if (!rule) {
      this.message = this.requiredMessage('rule');
      return false;
    }

    if (!this.isTypeOf(rule, 'object')) {
      this.message = this.typeOfMessage('rule', 'object');
      return false;
    }

    /**
     * Validate field
     */
    if (!rule.field) {
      this.message = this.requiredMessage('field');
      return false;
    }

    if (!this.isTypeOf(rule.field, 'string')) {
      this.message = this.typeOfMessage('field', 'string');
      return false;
    }

    /**
     * Validate condition
     */
    if (!rule.condition) {
      this.message = this.requiredMessage('condition');
      return false;
    }

    if (!this.isTypeOf(rule.condition, 'string')) {
      this.message = this.typeOfMessage('condition', 'string');
      return false;
    }

    if (!CONDITIONS.includes(rule.condition)) {
      this.message = this.shouldContainMessage(
        'condition',
        CONDITIONS.join('|'),
      );
      return false;
    }

    if (!rule.condition_value) {
      this.message = this.requiredMessage('condition_value');
      return false;
    }

    this.condition = rule.condition;
    this.condition_value = rule.condition_value;
    return true;
  }

  validateData(data: any, rule: Rule) {
    this.resetMessage();
    if (!data) {
      this.message = this.requiredMessage('data');
      return false;
    }

    if (!['object', 'array', 'string'].includes(typeof data)) {
      this.message = this.invalidPayloadMessage();
      return false;
    }

    // check if rule field exist in data
    if (rule.field.includes('.')) {
      // check for nested fields
      const fields = rule.field.split('.');
      if (!data[fields[0]]) {
        this.message = this.isMissingMessage(fields[0]);
        return false;
      }
      if (!data[fields[0]][fields[1]]) {
        this.message = this.isMissingMessage(fields[1]);
        return false;
      }

      // this.fieldName = fields[1];
      this.fieldValue = data[fields[0]][fields[1]];
    } else {
      if (!data[rule.field]) {
        this.message = this.isMissingMessage(rule.field);
        return false;
      }
      this.fieldValue = data[rule.field];
    }

    this.fieldName = rule.field;
    return true;
  }

  // validate field against condition
  validateField(
    fieldName: string,
    fieldValue: any,
    condition: string,
    conditionValue: any,
  ) {
    let error = true;
    switch (condition) {
      case eq:
        if (fieldValue === conditionValue) error = false;
        break;
      case neq:
        if (fieldValue !== conditionValue) error = false;
        break;
      case gt:
        if (fieldValue > conditionValue) error = false;
        break;
      case gte:
        if (fieldValue >= conditionValue) error = false;
        break;
      case contains:
        if (Object.values(fieldValue).indexOf(conditionValue) > -1)
          error = false;
        break;
    }

    if (error) {
      return this.generateValidationResult(
        error,
        fieldName,
        fieldValue,
        condition,
        conditionValue,
      );
    } else {
      return this.generateValidationResult(
        error,
        fieldName,
        fieldValue,
        condition,
        conditionValue,
      );
    }
  }

  resetMessage() {
    this.message = '';
  }
  requiredMessage(fieldName: string) {
    return `${fieldName} is required.`;
  }

  invalidPayloadMessage() {
    return 'Invalid JSON payload passed.';
  }

  typeOfMessage(fieldName: string, type: string) {
    const aOran = type === 'object' ? 'an' : 'a';
    return `${fieldName} should be ${aOran} ${type}.`;
  }

  isTypeOf(variable: any, typeName: string) {
    return typeof variable === typeName && variable !== null;
  }

  shouldContainMessage(fieldName: string, content: any) {
    return `${fieldName} should be one of ${content}.`;
  }

  isMissingMessage(fieldName: string) {
    return `field ${fieldName} is missing from data.`;
  }

  generateValidationResult(
    error: boolean,
    field: string,
    field_value: any,
    condition: string,
    condition_value: any,
  ) {
    const message = error
      ? `field ${field} failed validation.`
      : `field ${field} successfully validated.`;
    return {
      message,
      validation: {
        error,
        field,
        field_value,
        condition,
        condition_value,
      },
    } as ValidationResult;
  }
}

const eq = 'eq';
const neq = 'neq';
const gt = 'gt';
const gte = 'gte';
const contains = 'contains';
const CONDITIONS = [eq, neq, gt, gte, contains];

export interface Rule {
  field: string;
  condition: string;
  condition_value: string;
}

interface ValidationResult {
  message: string;
  validation: {
    error: boolean;
    field: string;
    field_value: any;
    condition: string;
    condition_value: any;
  };
}
