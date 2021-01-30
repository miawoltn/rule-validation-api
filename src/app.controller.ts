import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService, Rule } from './app.service';
import { Response } from 'express';
import { JSend } from './jsend/jsend';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  home(@Res() response: Response): any {
    const message = 'My Rule-Validation API';
    const data = {
      name: 'Aminu Abdulmalik',
      github: '@miawoltn',
      email: 'amnabdulmalik@gmail.com',
      mobile: '08069036740',
    };

    return response.status(200).send(JSend.success(message, data));
  }

  @Post('validate-rule')
  validateRule(
    @Body() reqBody: { rule: any; data: any },
    @Res() response: Response,
  ): any {
    // validate rule
    const isRuleValid = this.appService.validateRule(
      (reqBody.rule as unknown) as Rule,
    );
    if (!isRuleValid)
      return response.status(400).send(JSend.error(this.appService.message));

    // validate data
    const isDataValid = this.appService.validateData(
      reqBody.data,
      (reqBody.rule as unknown) as Rule,
    );
    if (!isDataValid)
      return response.status(400).send(JSend.error(this.appService.message));

    // get validation compoents
    const condition = this.appService.condition;
    const condition_value = this.appService.condition_value;
    const fieldName = this.appService.fieldName;
    const fieldValue = this.appService.fieldValue;
    // validate data with rule
    const validationResult = this.appService.validateField(
      fieldName,
      fieldValue,
      condition,
      condition_value,
    );

    // return right status code with validatoin result
    const validation = {
      validation: validationResult.validation,
    };
    const res = validationResult.validation.error
      ? JSend.error(validationResult.message, validation)
      : JSend.success(validationResult.message, validation);

    return response
      .status(validationResult.validation.error ? 400 : 200)
      .send(res);
  }
}
