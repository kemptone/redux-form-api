var jbound = require('j').jbound
var findAnyValueInObject = require("api").findAnyValueInObject

var e = module.exports = function reduxFormSyncValidate (settings) {

  var j = jbound(settings).j

  var source = j("reduxForm.length") ? j("reduxForm.1", {}) : j("reduxForm", {})
    , validate = source.validate

  if (!validate)
    return false // proceed

  var process = validate(
    source.values
    , source
    , { futureStuff : true }
  )

  if (!process)
    return false // proceed

  if (!findAnyTruthyValueInObject(process))
    return false

  return process

}

function findAnyTruthyValueInObject(obj, x) {
  for (x in obj)
    if (!(obj[x] instanceof Object) && obj[x])
      return true
    else if (findAnyValueInObject(obj[x]))
      return true
}

e.findAnyTruthyValueInObject = findAnyTruthyValueInObject