import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const cycleValidator = validate(
  checkSchema({
    last_period_date: { notEmpty: { errorMessage: 'Last period date required' }, isISO8601: true },
    cycle_length: { isInt: { options: { min: 20, max: 40 }, errorMessage: 'Invalid cycle length' },  toInt: true },
    period_length: { isInt: { options: { min: 1, max: 10 }, errorMessage: 'Invalid period length' },  toInt: true},
    note: { optional: true, isString: true }
  }, ['body'])
);
