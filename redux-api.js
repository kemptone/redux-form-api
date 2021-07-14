var api = require('api').default
  , SubmissionError = require('redux-form').SubmissionError
  , reduxFormSyncValidate = require('./reduxFormSyncValidate')
  , jbound = require('j').jbound

module.exports = function reduxApi (set) {

  return function (d, g) {

    var s = jbound(g)
      , _api = function (obj) { return api(obj)(d, g) }
      , baggage = { s : s, dispatch : d, getState : g, api : _api }
      , settings = set
      , errors

    if (typeof set === "function") {
      settings = set(baggage)
      if (!settings)
        return new Promise( function(resolve) { return resolve() })
    }

    return new Promise(function (resolve, reject) {

      // checks for SYNC errors
      // this goes outside the normal flow for reduxForm but is needed to only show sync errors after submit
      errors = reduxFormSyncValidate(settings)

      if (errors) {
        settings.outputErrors = errors
        return reject(settings)
      }

      if (settings.validateOnly) {

        if (settings.validationSuccess)
          settings.validationSuccess(set)

        // This pops the stack, if the stack is there
        if (!settings.preventStackClose) {
          var J = jbound(settings)

          if (J.j("preventSubmitHide") || J.j("preventStackClose"))
            return resolve()

          J.jfun("reduxForm.stack.pop")()
          J.jfun("reduxForm.1.stack.pop")()

          // J.jfun("reduxForm.hide")()
          // J.jfun("reduxForm.1.hide")()
        }

        return resolve(settings)

      }

      _api(settings)
        .catch(function (args) {

          var errors = args.errors || []

          if (errors) {
            // settings.outputErrors = errors
            settings.errors = errors
            return reject(settings)
          }

        })
        .then(function (args) {

          if (!args || errors || args.errors)
            return args

          var J = jbound(settings)

          if (J.j("preventSubmitHide") || J.j("preventStackClose"))
            return resolve()

          J.jfun("reduxForm.stack.pop")()
          J.jfun("reduxForm.1.stack.pop")()

          // J.jfun("reduxForm.hide")()
          // J.jfun("reduxForm.1.hide")()
          resolve()

        })

    }).catch(function (args) {

      var errors = args.errors || []

      var outputErrors = settings.outputErrors || {}
        , e = jbound(errors || [])

      ;(errors || []).forEach( function (ee) {
        outputErrors[ ee.code ] = ee.description 
      }) 

      settings.customReduxErrorHandling && settings.customReduxErrorHandling({
        outputErrors : outputErrors
        , errors : errors || []
        , e : e 
      })

      throw new SubmissionError( outputErrors )

    })


  }

}