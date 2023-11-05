/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
import { validator } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

validator.rule('uniqueExceptSelf', async (value, [table, column, id], { pointer, arrayExpressionPointer, errorReporter }) => {
  console.log('uniqueExceptSelf', value, table, column, id)
  const row = await Database.query().from(table.table).where(table.column, value).andWhere('id', '<>', id).first()
  if (row) {
    errorReporter.report(pointer, 'uniqueExceptSelf', 'Unique violation', arrayExpressionPointer)
  }
})
