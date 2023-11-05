// File: app/Validators/Rules/UniqueExceptSelf.ts

import { validator } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

validator.rule('uniqueExceptSelf', async (value, [table, column, id], { pointer, arrayExpressionPointer, errorReporter }) => {
  const row = await Database.query().from(table).where(column, value).andWhere('id', '<>', id).first()
  if (row) {
    errorReporter.report(pointer, 'uniqueExceptSelf', 'Unique violation', arrayExpressionPointer)
  }
})
