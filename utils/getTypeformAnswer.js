/** creates a new location
 *
 * PUT /location/{location}/time
 * @param {string} location pathParam code for the location to be created. will overwrite if exists already
 * @param {body} {textDescription,openTime,closeTime,interval} how do you doc body stuff here?
 * @returns {object} {created: true} // placeholder
 */
module.exports.getTypeFormAnswer = (titleString, responseBody) => {
  const fields = responseBody.form_response.definition.fields
  const answers = responseBody.form_response.answers

  const answerRecord = fields.filter(function (fieldRecord) {
    console.log("fieldRecord: ", fieldRecord)
    return fieldRecord.ref.includes(titleString)
  })[0]
  console.log("titleString: ", titleString)
  console.log("answerRecord: ", answerRecord)

  const answerRef = answerRecord.ref
  const answerType = answerRecord.type

  console.log("answerRef: ", answerRef)
  console.log("answerType: ", answerType)
  let answer
  switch (answerType) {
    case "short_text":
      answer = answers.filter(function (answerRecord) {
        return answerRecord.field.ref === answerRef
      })[0].text
      break
    case "multiple_choice":
    case "dropdown": {
      answer = answers.filter(function (answerRecord) {
        //console.log("label: ",label)
        return answerRecord.field.ref === answerRef
      })[0].choice.label
      break
    }
    default:
      console.log("unexpected answer type")
      break
  }

  return answer
}
