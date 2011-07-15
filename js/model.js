/*jslint browser: true, maxerr: 50, indent: 4 */
/**
 * Model classes and functions for the FormDesigner
 */
if (typeof formdesigner === 'undefined') {
    var formdesigner = {};
}

function stacktrace() {
  function st2(f) {
    return !f ? [] :
        st2(f.caller).concat([f.toString().split('(')[0].substring(9) + '(' + f.arguments.join(',') + ')']);
  }
  return st2(arguments.callee.caller);
}

formdesigner.model = function () {
    var that = {};
    var exists = formdesigner.util.exists; //jack it from the util module
    /**
     * A mug is the standard object within a form
     * and represents the combined Data, Bind and Control
     * elements (accessible through the Mug) in all their
     * valid combinations. Validity of a mug is determined
     * by the Definition object.
     *
     * possible constructor params:
     * {
     *  bindElement,
     *  dataElement,
     *  controlElement,
     *  definition  //this is the definitionObject that specifies this mug's validation rules
     *  }
     */
    var Mug = function (spec) {
        var that = {}, mySpec, dataElement, bindElement, controlElement;

        //give this object a unqiue fd id
        formdesigner.util.give_ufid(that);

        that.properties = {};
        if (typeof spec === 'undefined') {
            mySpec = {};
        } else {
            mySpec = spec;
        }

        /**
         * This constructor will take in a spec
         * consisting of various elements (see Mug comments)
         */
        (function construct(spec) {
            var i;
            for (i in spec) {
                if (spec.hasOwnProperty(i)) {
                    that.properties[i] = spec[i];
                }
            }
//            that.properties.bindElement = spec.bindElement || undefined;
//            that.properties.dataElement = spec.dataElement || undefined;
//            that.properties.controlElement = spec.controlElement || undefined;
        }(mySpec));

        that.getBindElementID = function () {
            if (this.properties.bindElement) {
                return this.properties.bindElement.properties.nodeID;
            } else {
                return null;
            }
        };

        that.getDataElementID = function () {
            if (this.properties.dataElement) {
                return this.properties.dataElement.properties.nodeID;
            } else {
                return null;
            }
        };

        that.getDisplayName = function () {
            var retName = this.getBindElementID();
            if (!retName) {
                retName = this.getDataElementID();
            }
            if (!retName) {
                if (this.properties.controlElement) {
                    retName = this.properties.controlElement.properties.label;
                }
            }
            return retName;
        };

        that.toString = function () {
            return "Mug";
        };

        //make the object event aware
        formdesigner.util.eventuality(that);
        return that;
    };
    that.Mug = Mug;

    var Xhtml = function () {
        var that = {};
        //make the object event aware
        formdesigner.util.eventuality(that);
    };
    that.xhtml = Xhtml;

    var Localization = function () {
        var that = {};
        //make the object event aware
        formdesigner.util.eventuality(that);
    };
    that.Localization = Localization;

    /**
     * The bind object (representing the object
     * that transforms data and hands it off to the
     * dataElement object).
     *
     * Constructor object (spec) can have the following attributes
     * {
     *  dataType, //typically the xsd:dataType
     *  relevant,
     *  calculate,
     *  constraint,
     *  constraintMsg, //jr:constraintMsg
     *  nodeID //optional
     * }
     *
     * @param spec
     */
    var BindElement = function (spec) {
        var that = {};
        that.properties = {};

        //give this object a unqiue fd id
        formdesigner.util.give_ufid(that);
        var attributes;

        (function constructor(the_spec) {
            if (typeof the_spec === 'undefined') {
                return null; //nothing to be done.
            } else {
                var i;
                //also attach the attributes to the root 'that' object:
                for (i in the_spec) {
                    if (the_spec.hasOwnProperty(i)) {
                        that.properties[i] = the_spec[i];
                    }
                }
            }
        }(spec));

        //make the object event aware
        formdesigner.util.eventuality(that);
        return that;
    };
    that.BindElement = BindElement;

    /**
     * A LiveText object is able to
     * take in Strings and Objects (with their specified
     * callback functions that produce strings) in order
     * render a LiveString with the latest changes to the objects
     * it is tracking, on command (call renderString on this object
     * to get a... rendered string).
     */
    var LiveText = function () {
        //Todo eventually: add checking for null pointer tokens

        var that = {};

        var phrases = [];

        /**
         * Renders the token in the phrases list specified by tokenIndex
         * and returns it as a string
         * @param tokenIndex
         */
        var getRenderedToken = function (tokenIndex) {
            var tObj;
            var outString = '';
            if (tokenIndex > phrases.length - 1) {
                return undefined;
            }
            tObj = phrases[tokenIndex];
            if (typeof tObj.refObj === 'undefined') {
                throw "incorrect Live Object added to LiveText! Can't render string.";
            } else if (typeof tObj.refObj === 'string') {
                outString += tObj.refObj;
            } else {
                outString += tObj.callback.apply(tObj.refObj, tObj.params);
            }
            return outString;
        };

        /**
         * Get the string this liveText represents
         * with all the function/object references replaced with
         * their textual representations (use add()
         * to add strings/objects when building a liveText)
         */
        that.renderString = function () {
            var outString = "";
            var i;
            for (i = 0; i < phrases.length; i++) {
                outString += getRenderedToken(i);
            }
            return outString;
        };


        //////TODO REMOVE CALLBACK PARAMS


        /**
         * Add a token to the list
         * of this liveText object.
         * When adding a string,
         * the callback param is optional.  When
         * adding anything else, specify a callback function
         * to call (with or without params). If no callback
         * is specified in that case, an exception will be thrown
         * @param token - the object (or string) that represents the string data
         * @param callback - the callback function that should be used on the token obj to retrieve a string (if token is an object)
         * @param params is an array of arguments to be applied to the callback function (if a callback was specified)
         */
        that.addToken = function (token, callback, params) {
            var tObj = {};
            if (typeof token === 'string') {
                tObj.refObj = token;
            } else {
                tObj.refObj = token;
                tObj.callback = callback;
                tObj.params = params;
            }
            phrases.push(tObj);
        };

        /**
         * Returns the list of token objects
         * (an array of mixed strings and/or objects)
         */
        that.getTokenList = function () {
            return phrases;
        };


        //make this object event aware.
        formdesigner.util.eventuality(that);
        return that;
    };
    that.LiveText = LiveText;

    /**
     * DataElement is the object representing the final resting (storage)
     * place of data entered by the user and/or manipulated by the form.
     *
     * Constructor spec:
     * {
     *  name,
     *  defaultData,
     * }
     */
    var DataElement = function (spec) {
        var that = {};
        that.properties = {};

        (function constructor(mySpec) {
            if (typeof mySpec === 'undefined') {
                return null; //nothing to be done.
            } else {
                var i;
                //also attach the attributes to the root 'that' object:
                for (i in mySpec) {
                    if (mySpec.hasOwnProperty(i)) {
                        that.properties[i] = mySpec[i];
                    }
                }
            }
        }(spec));

        //give this object a unqiue fd id
        formdesigner.util.give_ufid(that);

        //make the object event aware
        formdesigner.util.eventuality(that);
        return that;
    };
    that.DataElement = DataElement;

    /**
     * The controlElement represents the object seen by the user during
     * an entry session.  This object usually takes the form of a question
     * prompt, but can also be a notification message, or some other type
     * of user viewable content.
     * spec:
     * {
     *  typeName, //the type string indicating what type of Control Element this is
     *            //see the control_definitions (tag_name) object e.g. "input"
     *  controlName //control_definition.controlElement.controlType.name; e.g. "text"
     *  //optional:
     *  label
     *  hintLabel
     *  labelItext
     *  hintItext
     *  defaultValue
     *
     * }
     */
    var ControlElement = function (spec) {
        var that = {};
        that.properties = {};

        var typeName, controlName, label, hintLabel, labelItext, hintItext, defaultValue;
        //give this object a unique fd id
        formdesigner.util.give_ufid(that);

        (function constructor(mySpec) {
            if (typeof mySpec === 'undefined') {
                return null; //nothing to be done.
            } else {
                var i;
                //also attach the attributes to the root 'that' object:
                for (i in mySpec) {
                    if (mySpec.hasOwnProperty(i)) {
                        that.properties[i] = mySpec[i];
                    }
                }
            }
        }(spec));


        //make the object event aware
        formdesigner.util.eventuality(that);
        return that;
    };
    that.ControlElement = ControlElement;


    ///////////////////////////////////////////////////////////////////////////////////////
//////    DEFINITION (MUG TYPE) CODE /////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

        /**
     * Creates a new mug (with default init values)
     * based on the template (MugType) given by the argument.
     *
     * @return the new mug associated with this mugType
     */
    that.createMugFromMugType = function (mugType) {
        /**
         * Walks through the properties (block) and
         * procedurally generates a spec that can be passed to
         * various constructors.
         * Default values are null (for OPTIONAL fields) and
         * "" (for REQUIRED fields).
         * @param block - rule block
         * @param name - name of the spec block being generated
         * @return a dictionary: {spec_name: spec}
         */
        function getSpec(properties){
            var i,j, spec = {};
            for(i in properties){
                if(properties.hasOwnProperty(i)){
                    var block = properties[i];
                    spec[i] = {}
                    for (j in block){
                        if(block.hasOwnProperty(j)){
                            var p = block[j];
                            if(p.presence === 'required' || p.presence === 'optional'){
                                spec[i][j] = " ";
                            }
                            if(p.values && p.presence !== 'notallowed'){
                                spec[i][j] = p.values[0];
                            }
                        }
                    }
                }
            }
            return spec;
        }
//        function recursiveGetSpec(block, name) {
//            var spec = {}, i, retSpec = {};
//            for(i in block) {
//                if (typeof block[i] === 'object') {
//                    spec[i] = recursiveGetSpec(block[i], i);
//                }else if (typeof block[i] === 'function') {
//                    spec[i] = " ";
//                }else{
//                    switch(block[i]) {
//                        case formdesigner.model.TYPE_FLAG_OPTIONAL:
//                            spec[i] = " ";
//                            break;
//                        case formdesigner.model.TYPE_FLAG_REQUIRED:
//                            spec[i] = " ";
//                            break;
//                        case formdesigner.model.TYPE_FLAG_NOT_ALLOWED:
//                            break;
//                        default:
//                            spec[i] = block[i]; //text value;
//                    }
//                }
//            }
//            return spec;
//        }
        //loop through mugType.properties and construct a spec to be passed to the Mug Constructor.
        //BE CAREFUL HERE.  This is where the automagic architecture detection ends, some things are hardcoded.
        var mugSpec, dataElSpec, bindElSpec, controlElSpec, i,
                mug,dataElement,bindElement,controlElement,
                specBlob = {}, validationResult;

        specBlob = getSpec(mugType.properties);
        mugSpec = specBlob || undefined;
        dataElSpec = specBlob.dataElement || undefined;
        bindElSpec = specBlob.bindElement || undefined;
        controlElSpec = specBlob.controlElement || undefined;

        //create the various elements, mug itself, and linkup.
        if (mugSpec) {
            mug = new Mug(mugSpec);
            if (controlElSpec) {
                mug.properties.controlElement = new ControlElement(controlElSpec);
            }
            if (dataElSpec) {
                if (dataElSpec.nodeID) {
                    dataElSpec.nodeID = formdesigner.util.generate_question_id();
                }
                mug.properties.dataElement = new DataElement(dataElSpec);
            }
            if (bindElSpec) {
                if (bindElSpec.nodeID) {
                    if (dataElSpec.nodeID) {
                        bindElSpec.nodeID = dataElSpec.nodeID; //make bind id match data id for convenience
                    }else{
                        bindElSpec.nodeID = formdesigner.util.generate_question_id();
                    }
                }
                mug.properties.bindElement = new BindElement(bindElSpec);
            }
        }

        //Bind the mug to it's mugType
        mugType.mug = mug || undefined;

        //ok,now: validate the mug to make sure everything is peachy.
        validationResult = mugType.validateMug(mug);
        if (validationResult.status !== 'pass') {
            console.group("Failed Validation on Mug Auto-creation");
            console.log('Failed validation object');
            console.log(validationResult);
            console.log("MugType:");
            console.log(mugType);
            console.groupEnd();
            throw 'Newly constructed mug did not pass validation!';
        }else{
            return mug;
        }
    };

    var TYPE_FLAG_OPTIONAL = that.TYPE_FLAG_OPTIONAL = '_optional';
    var TYPE_FLAG_REQUIRED = that.TYPE_FLAG_REQUIRED = '_required';
    var TYPE_FLAG_NOT_ALLOWED = that.TYPE_FLAG_NOT_ALLOWED = '_notallowed';


    var RootMugType = {
        typeName: "The Abstract Mug Type Definition", //human readable Type Name (Can be anything)
        type : "root", //easier machine readable value for the above;
        //type var can contain the following values: 'd', 'b', 'c', ('data', 'bind' and 'control' respectively)
        // or any combination of them. For example, a Mug that contains a dataElement and a controlElement (but no bindElement)
        // would be of type 'dc'.  'root' is the exception for the abstract version of the MugType (which should never be directly used anyway).
        // use: formdesigner.util.clone(RootMugType); instead. (As done below in the mugTypes object).

        //set initial properties
        /**
         * A property is a key:value pair.
         * Properties values can take one of 4 forms.
         * Property keys are the name of the field in the actual mug to be looked at during validation.
         * The four (4) forms of property values:
         *  - One of the type flags (e.g. TYPE_FLAG_REQUIRED)
         *  - A string, representing the actual string value a field should have in the mug
         *  - A dictionary (of key value pairs) illustrating a 'block' (e.g. see the bindElement property below)
         *  - a function (taking a block of fields from the mug as its only argument). The function MUST return either
         *     the string 'pass' or an error string.
         *
         *     PropertyValue = {
         *          editable: 'r|w', //(read only) or (read and write)
         *          visibility: 'hidden|visible', //show as a user editable property?
         *          presence: 'required|optional|notallowed' //must this property be set, optional or should not be present?
         *          [values: [arr of allowable vals]] //list of allowed values for this property
         *          [validationFunc: function(mugType,mug)] //special validation function, optional
         *      }
         *
         *
         *
         *
         */
//        prop: {
//            editable: '',
//            visibility: '',
//            presence: ''
////            values: [], //Optional. List of allowed values this property can take
////            validationFunc: function(mugType,mug){} //Optional
////            lstring: "Human Readable Property Description" //Optional
//        },
        properties : {
            dataElement: {
                nodeID: {
                    editable: 'w',
                    visibility: 'visible',
                    presence: 'required',
                    lstring: 'Question ID'
                        },
                dataValue: {
                    editable: 'w',
                    visibility: 'visible',
                    presence: 'optional',
                    lstring: 'Default Data Value'
                }
            },
            bindElement: {
                nodeID: {
                    editable: 'w',
                    visibility: 'hidden',
                    presence: 'optional'
                },
                dataType: {
                    editable: 'w',
                    visibility: 'hidden',
                    presence: 'optional',
                    values: formdesigner.util.XSD_DATA_TYPES
                },
                relevantAttr: {
                    editable: 'w',
                    visibility: 'visible',
                    presence: 'optional'
                },
                calculateAttr: {
                    editable: 'w',
                    visibility: 'visible',
                    presence: 'optional'
                },
                constraintAttr: {
                    editable: 'w',
                    visibility: 'visible',
                    presence: 'optional'
                },
                constraintMsgAttr: {
                    editable: 'w',
                    visibility: 'hidden',
                    presence: 'optional',
                    validationFunc : function (mugType, mug) {
                        var bindBlock = mug.properties.bindElement.properties;
                        var hasConstraint = (typeof bindBlock.constraintAttr !== 'undefined');
                        var hasConstraintMsg = (typeof bindBlock.constraintMsgAttr !== 'undefined');
                        if (hasConstraintMsg && !hasConstraint) {
                            return 'ERROR: Bind cannot have a Constraint Message with no Constraint!';
                        } else {
                            return 'pass';
                        }
                    }
                }
            },
            controlElement: {
                name: {
                    editable: 'w',
                    visibility: 'hidden',
                    presence: 'required',
                    values: formdesigner.util.VALID_QUESTION_TYPE_NAMES,
                    lstring: "Question Type"
                },
                tagName: {
                    editable: 'r',
                    visibility: 'hidden',
                    presence: 'required',
                    values: formdesigner.util.VALID_CONTROL_TAG_NAMES,
                },
                label: {
                    editable: 'w',
                    visibility: 'hidden',
                    presence: 'required'
                },
                hintLabel: {
                    editable: 'w',
                    visibility: 'hidden',
                    presence: 'optional'
                },
                labelItext: {
                    editable: 'w',
                    visibility: 'visible',
                    presence: 'optional',
                    lstring: "Question Text"
                },
                hintItext: {
                    editable: 'w',
                    visibility: 'hidden',
                    presence: 'optional',
                    lstring: "Question Extra Information"
                }
            }
        },

        //for validating a mug against this internal definition we have.
        validateMug : function () {
            /**
             * Takes in a key-val pair like {"controlNode": TYPE_FLAG_REQUIRED}
             * and an object to check against, and tell you if the object lives up to the rule
             * returns true if the object abides by the rule.
             *
             * For example, if the rule above is used, we pass in a mug to check if it has a controlNode.
             * If a property with the name of "controlNode" exists, true will be returned since it is required and present.
             *
             * if the TYPE_FLAG is TYPE_FLAG_OPTIONAL, true will always be returned.
             * if TYPE_FLAG_NOT_ALLOWED and a property with it's corresponding key IS present in the testing object,
             * false will be returned.
             *
             * if a TYPE_FLAG is not used, check the value. (implies that this property is required)
             * @param ruleKey
             * @param ruleValue
             * @param testingObj
             */
            var validateRule = function (ruleKey, ruleValue, testingObj, blockName,curMugType,curMug) {
                var retBlock = {},
                        visible = ruleValue.visibility,
                        editable = ruleValue.editable,
                        presence = ruleValue.presence;

                retBlock.ruleKey = ruleKey;
                retBlock.ruleValue = ruleValue;
                retBlock.objectValue = testingObj;
                retBlock.blockName = blockName;
                retBlock.result = 'fail';

                if (!testingObj) {
                    return retBlock;
                }

                if (presence === 'optional') {
                    retBlock.result = 'pass';
                    retBlock.resultMessage = '"' + ruleKey + '" is Optional in block:' + blockName;
                } else if (presence === 'required') {
                    if (testingObj[ruleKey]) {
                        retBlock.result = 'pass';
                        retBlock.resultMessage = '"' + ruleKey + '" is Required and Present in block:' + blockName;
                    } else {
                        retBlock.result = 'fail';
                        retBlock.resultMessage = '"' + ruleKey + '" VALUE IS REQUIRED in block:' + blockName + ', but is NOT present!';
                    }
                } else if (presence === 'notallowed') {
                    if (!testingObj[ruleKey]) { //note the equivalency modification from the above
                        retBlock.result = 'pass';
                    } else {
                        retBlock.result = 'fail';
                        retBlock.resultMessage = '"' + ruleKey + '" IS NOT ALLOWED IN THIS OBJECT in block:' + blockName;
                    }
                } else {
                    retBlock.result = 'fail';
                    retBlock.resultMessage = '"' + ruleKey + '" MUST BE OF TYPE_OPTIONAL, REQUIRED, NOT_ALLOWED or a "string" in block:' + blockName;
                    retBlock.ruleKey = ruleKey;
                    retBlock.ruleValue = ruleValue;
                    retBlock.testingObj = testingObj;
                }

                if (ruleValue.validationFunc) {
                    var funcRetVal = ruleValue.validationFunc(curMugType,curMug);
                    if (funcRetVal === 'pass') {
                        retBlock.result = 'pass';
                        retBlock.resultMessage = '"' + ruleKey + '" is a string value (Required) and Present in block:' + blockName;
                    } else {
                        retBlock.result = 'fail';
                        retBlock.resultMessage = '"' + ruleKey + '" ::: ' + funcRetVal + ' in block:' + blockName + ',Message:' + funcRetVal;
                    }
                }

                return retBlock;
            };

            /**
             * internal method that loops through the properties in this type definition
             * recursively and compares that with the state of the mug (using validateRule
             * to run the actual comparisons).
             *
             * The object that is returned is a JSON object that contains information
             * about the validation. returnObject["status"] will be either "pass" or "fail"
             * "status" will be set to fail if any one property is not in the required state
             * in the mug.
             * @param propertiesObj
             * @param testingObj
             * @param blockName
             */
            var checkProps = function (mugT,propertiesObj, testingObj, blockName) {
                var i, j,y,z, results, testObjProperties,
                        mug = mugT.mug,
                        mugProperties = mug.properties;
                results = {"status": "pass"}; //set initial status
                results.blockName = blockName;
                if (!(testingObj || undefined)) {
                    results.status = "fail";
                    results.message = "No testing object passed for propertiesObj " + JSON.stringify(propertiesObj);
                    results.errorType = "NullPointer";
                    return results;
                }
                for (i in propertiesObj) {
                    if(propertiesObj.hasOwnProperty(i)){
                        var block = propertiesObj[i],
                                tResults = {};
                        for(y in block){
                            if(block.hasOwnProperty(y)){
                                tResults[y] = validateRule(y,block[y],testingObj[i].properties,i,mugT,mugT.mug);
                                if (tResults[y].result === "fail") {
                                    results.status = "fail";
                                    results.message = tResults[y].resultMessage;
                                    results.errorBlockName = tResults[y].blockName;
                                    results[i] = tResults;
                                    return results;
                                } else {
                                    results.status = "pass";
                                }
                            }
                        }
                        results[i] = tResults;
                    }
                }

                for(j in mugProperties){
                    if(mugProperties.hasOwnProperty(j)){
                        var pBlock = mugProperties[j];
                        for (z in pBlock.properties){
                            if(pBlock.properties.hasOwnProperty(z)){
                                var p = pBlock.properties[z],
                                        rule = propertiesObj[j][z];
                                if(!rule || rule.presence === 'notallowed'){
                                    results.status = "fail";
                                    results.message = j + " has property '" + z + "' but no rule is present for that property in the MugType!";
                                    results.errorBlockName = j;
                                    results.errorProperty = z;
                                    results.errorType = 'MissingRuleValidation';
                                    results.propertiesBlock = pBlock;
                                }

                            }
                        }
                    }
                }
                return results;

            },

//                    //go deeper if required
//                    if (typeof propertiesObj[i] === 'object') {
//                        results[i] = checkProps(propertiesObj[i], testingObj[i], i);
//
//                        //see if the recursion went ok, flip out if not.
//                        if (results[i].status === "fail") {
//                            results.status = "fail";
//                            results.message = results[i].message;
//                            results.errorBlockName = results[i].errorBlockName;
//                            results.errorType = results[i].errorType;
//                            if (results[i].errorProperty) {
//                                results.errorProperty = results[i].errorProperty;
//                            }
//                            return results;
//                        } else {
//                            results.status = "pass";
//                        }
//                    } else {
//                        results[i] = validateRule(i, propertiesObj[i], testingObj.properties, blockName, mugT, mugT.mug);
//                        if (results[i].result === 'fail') {
//                            results.status = "fail";
//                            results.message = "Validation Rule Failure on Property: " + i;
//                            results.errorBlockName = i;
//                            results.errorType = 'RuleValidation';
//                            return results; //short circuit the validation
//                        } else {
//                            results.status = "pass";
//                        }
//                    }
//                }
//
//                //recurse through the properties in the actual mug/*Element
//                testObjProperties = testingObj.properties;
//                for (j in testObjProperties) {
//                    if (testObjProperties.hasOwnProperty(j)) {
//                        if (typeof propertiesObj[j] === 'undefined') {
//                            results.status = "fail";
//                            results.message = blockName + " block has property '" + j + "' but no rule is present for that property in the MugType!";
//                            results.errorBlockName = blockName;
//                            results.errorProperty = j;
//                            results.errorType = 'MissingRuleValidation';
//                            results.propertiesBlock = propertiesObj;
//                        } else if (propertiesObj[j] === TYPE_FLAG_NOT_ALLOWED) {
//                            results.status = "fail";
//                            results.message = blockName + " block has property '" + j + "' but this property is NOT ALLOWED in the MugType definition!";
//                            results.errorBlockName = blockName;
//                            results.errorProperty = j;
//                            results.errorType = 'NotAllowedRuleValidation';
//                            results.propertiesBlock = propertiesObj;
//                        }
//                    }
//                }
//                return results;

            /**
             * Checks the type string of a MugType (i.e. the mug.type value)
             * to see if the correct properties block Elements are present (and
             * that there aren't Elements there that shouldn't be).
             * @param mugT - the MugType to be checked
             */
            checkTypeString = function (mugT) {
                        var typeString = mugT.type, i,
                                hasD = (mugT.properties.dataElement ? true : false),
                                hasC = (mugT.properties.controlElement ? true : false),
                                hasB = (mugT.properties.bindElement ? true : false);

                        if (hasD) {
                            if (typeString.indexOf('d') === -1) {
                                return {status: 'fail', message: "MugType.type has a 'dataElement' in its properties block but no 'd' char in its type value!"};
                            }
                        } else {
                            if (typeString.indexOf('d') !== -1) {
                                return {status: 'fail', message: "MugType.type has a 'd' char in it's type value but no 'd' !"};
                            }
                        }
                        if (hasB) {
                            if (typeString.indexOf('b') === -1) {
                                return {status: 'fail', message: "MugType.type has a 'bindElement' in its properties block but no 'b' char in its type value!"};
                            }
                        } else {
                            if (typeString.indexOf('b') !== -1) {
                                return {status: 'fail', message: "MugType.type has a 'b' char in it's type value but no 'b' !"};
                            }
                        }
                        if (hasC) {
                            if (typeString.indexOf('c') === -1) {
                                return {status: 'fail', message: "MugType.type has a 'controlElement' in its properties block but no 'c' char in its type value!"};
                            }
                        } else {
                            if (typeString.indexOf('c') !== -1) {
                                return {status: 'fail', message: "MugType.type has a 'c' char in it's type value but no 'c' !"};
                            }
                        }


                        return {status: 'pass', message: "typeString for MugType validates correctly"};
                    },

            mug = this.mug || null;

            if (!mug) {
                throw 'MUST HAVE A MUG TO VALIDATE!';
            }
            var selfValidationResult = checkTypeString(this);
            var validationResult = checkProps(this,this.properties, mug.properties, "Mug Top Level");

            if (selfValidationResult.status === 'fail') {
                validationResult.status = 'fail';
            }
            validationResult.typeCheck = selfValidationResult;
            return validationResult;
        },

        //OBJECT FIELDS//
        controlNodeCanHaveChildren: false,

        /** A list of controlElement.tagName's that are valid children for this control element **/
        controlNodeAllowedChildren : [],
        dataNodeCanHaveChildren: true,

        mug: null,
        toString: function () {
            if (this.mug && this.properties.bindElement) {
                return this.mug.properties.bindElement.properties.nodeID;
            } else {
                return this.typeName;
            }
        }

    };
    that.RootMugType = RootMugType;

    /**
     * WARNING: These are 'abstract' MugTypes!
     * To bring them kicking and screaming into the world, you must call
     * formdesigner.util.getNewMugType(someMT), this will return a fully init'd mugType,
     * where someMT can be either one of the below abstract MugTypes or a 'real' MugType.
     *
     */
    var mugTypes = {
        //the four basic valid combinations of Data, Bind and Control elements
        //when rolling your own, make sure the 'type' variable corresponds
        //to the Elements and other settings in your MugType (e.g. in the 'db' MT below
        //the controlElement is deleted.
        dataBind: function () {
            var mType = formdesigner.util.clone(RootMugType);

            mType.typeName = "Data + Bind Only Mug";
            mType.type = "db";
            delete mType.properties.controlElement;
            return mType;
        }(),
        dataBindControlQuestion: function () {
            var mType = formdesigner.util.clone(RootMugType);
            mType.typeName = "Data Bind Control Question Mug";
            mType.type = "dbc";
            return mType;
        }(),
        dataControlQuestion: function () {
            var mType = formdesigner.util.clone(RootMugType);
            mType.typeName = "Data + Control Question Mug";
            mType.type = "dc";
            delete mType.properties.bindElement;
            return mType;
        }(),
        dataOnly: function () {
            var mType = formdesigner.util.clone(RootMugType);
            mType.typeName = "Data ONLY Mug";
            mType.type = "d";
            delete mType.properties.controlElement;
            delete mType.properties.bindElement;
            return mType;
        }(),
        controlOnly: function () {
            var mType = formdesigner.util.clone(RootMugType);
            mType.typeName = "Control ONLY Mug";
            mType.type = "c";
            delete mType.properties.dataElement;
            delete mType.properties.bindElement;
            return mType;
        }()
    };
    that.mugTypes = mugTypes;

    /**
     * This is the output for MugTypes.  If you need a new Mug or MugType (with a mug)
     * use these functions.  Each of the below functions will create a new MugType and a
     * new associated mug with some default values initialized according to what kind of
     * MugType is requested.
     */
    that.mugTypeMaker = {};
    that.mugTypeMaker.stdTextQuestion = function () {
        var mType = formdesigner.util.getNewMugType(mugTypes.dataBindControlQuestion),
                mug,
                vResult;
        mType.typeName = "Text Question MugType";
        mType.controlNodeAllowedChildren = false;
        mug = that.createMugFromMugType(mType);
        mType.mug = mug;
        mType.mug.properties.controlElement.properties.name = "Text";
        mType.mug.properties.controlElement.properties.tagName = "input";
        vResult = mType.validateMug();
        if(vResult.status !== 'pass'){
            formdesigner.util.throwAndLogValidationError(vResult,mType,mType.mug);
        }
        return mType;
    };

    that.mugTypeMaker.stdItem = function () {
        var mType = formdesigner.util.getNewMugType(mugTypes.controlOnly),
                mug,
                vResult,
                controlProps;

        mType.typeName = "Item MugType";
        mType.controlNodeAllowedChildren = false;


        controlProps = mType.properties.controlElement;
        controlProps.hintLabel.presence = 'notallowed';
        controlProps.hintItext.presence = 'notallowed';
        controlProps.defaultValue = {
            lstring: 'Item Value',
            visibility: 'visible',
            editable: 'w',
            presence: 'required'
        }
        mug = that.createMugFromMugType(mType);
        mType.mug = mug;
        mType.mug.properties.controlElement.properties.name = "Item";
        mType.mug.properties.controlElement.properties.tagName = "item";



        vResult = mType.validateMug();
        if(vResult.status !== 'pass'){
            formdesigner.util.throwAndLogValidationError(vResult,mType,mType.mug);
        }
        return mType;
    };

    that.mugTypeMaker.stdTrigger = function () {
        var mType = formdesigner.util.getNewMugType(mugTypes.dataBindControlQuestion),
                mug,
                vResult;

        mType.typeName = "Trigger/Message MugType";
        mType.controlNodeAllowedChildren = false;
        mType.properties.controlElement.defaultValue.presence = 'notallowed';
        mType.properties.bindElement.dataType.presence = 'notallowed';

        mug = that.createMugFromMugType(mType);
        mType.mug = mug;
        mType.mug.properties.controlElement.properties.name = "Trigger";
        mType.mug.properties.controlElement.properties.tagName = "trigger";


        vResult = mType.validateMug();
        if(vResult.status !== 'pass'){
            formdesigner.util.throwAndLogValidationError(vResult,mType,mType.mug);
        }
        return mType;
    };

    that.mugTypeMaker.stdMSelect = function () {
        var mType = formdesigner.util.getNewMugType(mugTypes.dataBindControlQuestion),
                allowedChildren,
                mug,
                vResult;
        mType.controlNodeCanHaveChildren = true;
        allowedChildren = ['item'];
        mType.controlNodeAllowedChildren = allowedChildren;
        mug = that.createMugFromMugType(mType);
        mType.mug = mug;
        mType.mug.properties.controlElement.properties.name = "Multi-Select";
        mType.mug.properties.controlElement.properties.tagName = "select";
        mType.mug.properties.bindElement.properties.dataType = "xsd:select";
        vResult = mType.validateMug();
        if(vResult.status !== 'pass'){
            formdesigner.util.throwAndLogValidationError(vResult,mType,mType.mug);
        }
        return mType;
    };

    that.mugTypeMaker.stdGroup = function () {
        var mType = formdesigner.util.getNewMugType(mugTypes.dataBindControlQuestion),
                allowedChildren,
                mug,
                vResult;
        mType.controlNodeCanHaveChildren = true;
        allowedChildren = ['repeat', 'input', 'select', 'select1', 'group'];
        mType.controlNodeAllowedChildren = allowedChildren;
        mType.properties.bindElement.dataType.presence = "notallowed";
        mug = that.createMugFromMugType(mType);
        mType.mug = mug;
        mType.mug.properties.controlElement.properties.name = "Group";
        mType.mug.properties.controlElement.properties.tagName = "group";

        vResult = mType.validateMug();
        if(vResult.status !== 'pass'){
            formdesigner.util.throwAndLogValidationError(vResult,mType,mType.mug);
        }
        return mType;
    };



    /**
     * A regular tree (with any amount of leafs per node)
     * @param tType - is this a DataElement tree or a controlElement tree (use 'data' or 'control' for this argument, respectively)
     * tType defaults to 'data'
     */
    var Tree = function (tType) {
        var that = {}, rootNode, treeType = tType;
        if (!treeType) {
            treeType = 'data';
        }

        /**
         * Children is a list of objects.
         * @param children - optional
         * @param value - that value object that this node should contain (should be a MugType)
         */
        var Node = function (Children, value) {
            var that = {}, isRootNode = false, nodeValue, children = Children;

            var init = function (nChildren, val) {
                if (!val) {
                    throw 'Cannot create a node without specifying a value object for the node!';
                }
                children = nChildren || [];
                nodeValue = val;
            }(children, value);

            that.getChildren = function () {
                return children;
            };

            that.getValue = function () {
                return nodeValue;
            };

            /**
             * DOES NOT CHECK TO SEE IF NODE IS IN TREE ALREADY!
             * Adds child to END of children!
             */
            that.addChild = function (node) {
                if (!children) {
                    children = [];
                }
                children.push(node);
            };

            /**
             * Insert child at the given index (0 means first)
             * if index > children.length, will insert at end.
             * -ve index will result in child being added to first of children list.
             */
            that.insertChild = function (node, index) {
                if (node === null) {
                    return null;
                }

                if (index < 0) {
                    index = 0;
                }

                children.splice(index, 0, node);
            };

            /**
             * Given a mugType, finds the node that the mugType belongs to.
             * if it is not the current node, will recursively look through children node (depth first search)
             */
            that.getNodeFromMugType = function (MugType) {
                if (MugType === null) {
                    return null;
                }
                var retVal;
                if (this.getValue() === MugType) {
                    return this;
                } else {
                    for (var i in children) {
                        if (children.hasOwnProperty(i)) {
                            retVal = children[i].getNodeFromMugType(MugType);
                            if (retVal) {
                                return retVal;
                            }
                        }
                    }
                }
                return null; //we haven't found what we're looking for
            };

            /**
             * Given a ufid, finds the mugType that it belongs to.
             * if it is not the current node, will recursively look through children node (depth first search)
             *
             * Returns null if not found.
             */
            that.getMugTypeFromUFID = function (ufid) {
                if (!ufid) {
                    return null;
                }
                var retVal, thisUfid;
                if (this.getValue() !== ' ') {
                    thisUfid = this.getValue().ufid || '';
                } else {
                    thisUfid = '';
                }

                if (thisUfid === ufid) {
                    return this.getValue();
                } else {
                    for (var i in children) {
                        if (children.hasOwnProperty(i)) {
                            retVal = children[i].getMugTypeFromUFID(ufid);
                            if (retVal) {
                                return retVal;
                            }
                        }
                    }
                }
                return null; //we haven't found what we're looking for
            };

            that.removeChild = function (node) {
                if (!node) {
                    throw 'Null child specified! Cannot remove \'null\' from child list';
                }
                var childIdx = children.indexOf(node);
                if (childIdx !== -1) { //if arg node is a member of the children list
                    children.splice(childIdx, 1); //remove it
                }

                return node;
            };

            /**
             * Finds the parentNode of the specified node (recursively going through the tree/children of this node)
             * Returns the parent if found, else null.
             */
            that.findParentNode = function (node) {
                if (!node) {
                    throw "No node specified, can't find 'null' in tree!";
                }
                var i, parent = null;
                if (!children || children.length === 0) {
                    return null;
                }
                if (children.indexOf(node) !== -1) {
                    return this;
                }

                for (i in children) {
                    if (children.hasOwnProperty(i)) {
                        parent = children[i].findParentNode(node);
                        if (parent !== null) {
                            return parent;
                        }
                    }
                }
                return parent;
            };

            /**
             * An ID used during prettyPrinting of the Node. (a human readable value for the node)
             */
            that.getID = function () {
                if (isRootNode) {
                    return 'RootNode';
                }
                if (!this.getValue() || typeof this.getValue().validateMug !== 'function') {
                    return 'NodeWithNoValue!';
                }
                if (treeType === 'data') {
                    return this.getValue().mug.getDataElementID();
                } else if (treeType === 'control') {
                    return this.getValue().mug.getDisplayName();
                } else {
                    throw 'Tree does not have a specified treeType! Default is "data" so must have been forcibly removed!';
                }
            };

            /**
             * Get all children MUG TYPES of this node (not recursive, only the top level).
             * Return a list of MugType objects, or empty list for no children.
             */
            that.getChildrenMugTypes = function () {
                var i, retList = [];
                for (i in children) {
                    if (children.hasOwnProperty(i)) {
                        retList.push(children[i].getValue());
                    }
                }
                return retList;
            };


            that.toString = function () {
                return this.getID();
            };

            that.prettyPrint = function () {
                var arr = [], i;
                for (i in children) {
                    if (children.hasOwnProperty(i)) {
                        arr.push(children[i].prettyPrint());
                    }
                }
                if (!children || children.length === 0) {
                    return this.getID();
                } else {
                    return '' + this.getID() + '[' + arr + ']';
                }
            };

            return that;
        };

        var init = function (type) {
            rootNode = new Node(null, ' ');
            rootNode.isRootNode = true;
            treeType = type || 'data';
        }(treeType);
        that.rootNode = rootNode;

        /** Private Function
         * Adds a node to the top level (as a child of the abstract root node)
         *
         * @param parentNode - the parent to which the specified node should be added
         * if null is given, the node will be added to the top level of the tree (as a child
         * of the abstract rootNode).
         * @param node - the specified node to be added to the tree.
         */
        var addNode = function (node, parentNode) {
            if (parentNode) {
                parentNode.addChild(node);
            } else {
                rootNode.addChild(node);
            }
        };

        that.getParentNode = function (node) {
            if (this.rootNode === node) { //special case:
                return this.rootNode;
            } else { //regular case
                return this.rootNode.findParentNode(node);
            }
        };

        /**
         * Given a mugType, finds the node that the mugType belongs to (in this tree).
         * Will return null if nothing is found.
         */
        that.getNodeFromMugType = function (MugType) {
            return rootNode.getNodeFromMugType(MugType);
        };

        that.getParentMugType = function (MugType) {
            var node = this.getNodeFromMugType(MugType);
            if (!node) {
                return null;
            }
            var pNode = that.getParentNode(node),
                    pMT = pNode.getValue();
            return (pMT === ' ') ? null : pMT;
        };

        /**
         * Removes a node (and all it's children) from the tree (regardless of where it is located in the
         * tree) and returns it.
         *
         * If no such node is found in the tree (or node is null/undefined)
         * null is returned.
         */
        var removeNodeFromTree = function (node) {
            if (!node) {
                return null;
            }
            if (!that.getNodeFromMugType(node.getValue())) {
                return null;
            } //node not in tree
            var parent = that.getParentNode(node);
            if (parent) {
                parent.removeChild(node);
                return node;
            } else {
                return null;
            }
        };


        /**
         * Insert a MugType as a child to the node containing parentMugType.
         *
         * Will MOVE the mugType to the new location in the tree if it is already present!
         * @param mugType - the MT to be inserted into the Tree
         * @param position - position relative to the refMugType. Can be 'null', 'before', 'after' or 'into'
         * @param refMugType - reference MT.
         *
         * if refMugType is null, will default to the last child of the root node.
         * if position is null, will default to 'after'.  If 'into' is specified, mugType will be inserted
         * as a ('after') child of the refMugType.
         *
         * If an invalid move is specified, no operation will occur.
         */
        that.insertMugType = function (mugType, position, refMugType) {
            var refNode, refNodeSiblings, refNodeIndex, refNodeParent, node;

            if (!formdesigner.controller.checkMoveOp(mugType, position, refMugType)) {
                console.group("Illegal Tree Move Op");
                console.log("position: " + position);
                console.log("mugType below");
                console.log(mugType);
                console.log("RefMugType below");
                console.log(refMugType);
                console.groupEnd();
                throw 'Illegal Tree move requested! Doing nothing instead.';

            }

            if (position !== null && typeof position !== 'string') {
                throw "position argument must be a string or null! Can be 'after', 'before' or 'into'";
            }
            if (!position) {
                position = 'after';
            }

            if (!refMugType) {
                refNode = rootNode;
                position = 'into';
            } else {
                refNode = this.getNodeFromMugType(refMugType);
            }

            node = removeNodeFromTree(this.getNodeFromMugType(mugType)); //remove it from tree if it already exists
            if (!node) {
                node = new Node(null, mugType);
            }

            if (position !== 'into') {
                refNodeParent = that.getParentNode(refNode);
                refNodeSiblings = refNodeParent.getChildren();
                refNodeIndex = refNodeSiblings.indexOf(refNode);
            }

            switch (position) {
                case 'before':
                    refNodeParent.insertChild(node, refNodeIndex);
                    break;
                case 'after':
                    refNodeParent.insertChild(node, refNodeIndex + 1);
                    break;
                case 'into':
                    refNode.addChild(node);
                    break;
                case 'first':
                    refNode.insertChild(node, 0);
                    break;
                case 'last':
                    refNode.insertChild(node, refNodeSiblings.length + 1);
                    break;
                default:
                    throw "in insertMugType() position argument MUST be null, 'before', 'after', 'into', 'first' or 'last'.  Argument was: " + position;
            }
        };



        /**
         * Returns a list of nodes that are in the top level of this tree (i.e. not the abstract rootNode but it's children)
         */
        var getAllNodes = function () {
            return rootNode.getChildren();
        };

        /**
         * returns the absolute path, in the form of a string separated by slashes ('/nodeID/otherNodeID/finalNodeID'),
         * the nodeID's are those given by the Mugs (i.e. the node value objects) according to whether this tree is a
         * 'data' (DataElement) tree or a 'bind' (BindElement) tree.  Sorry about the confusing jargon.  It's a little late
         * in the game to be changing things up, unfortunately.
         *
         * @param nodeOrMugType - can be a tree Node or a MugType that is a member of this tree (via a Node)
         */
        that.getAbsolutePath = function (mugType) {
            var node, output, nodeParent;
            if (typeof mugType.validateMug === 'function') { //a loose way of checking that it's a MugType...
                node = this.getNodeFromMugType(mugType);
            } else {
                throw 'getAbsolutePath argument must be a MugType!';
            }
            if (!node) {
                throw 'Cant find path of MugType that is not present in the Tree!';
            }
            nodeParent = this.getParentNode(node);
            output = '/' + node.getID();

            while (nodeParent && !nodeParent.isRootNode) {
                output = '/' + nodeParent.getID() + output;
                nodeParent = this.getParentNode(nodeParent);
            }

            return output;

        };

        that.printTree = function (toConsole) {
            var t = rootNode.prettyPrint();
            if (toConsole) {
                console.debug(t);
            }
            return t;
        };

        /**
         * Removes the specified MugType from the tree. If it isn't in the tree
         * does nothing.  Does nothing if null is specified
         *
         * If the MugType is successfully removed, returns that MugType.
         */
        that.removeMugType = function (MugType) {
            var node = this.getNodeFromMugType(MugType);
            if (!MugType || !node) {
                return;
            }
            removeNodeFromTree(node);
            return node;
        };

        /**
         * Given a UFID searches through the tree for the corresponding MugType and returns it.
         * @param ufid of a mug
         */
        that.getMugTypeFromUFID = function (ufid) {
            return rootNode.getMugTypeFromUFID(ufid);
        };

        /**
         * Returns all the children MugTypes (as a list) of the
         * root node in the tree.
         */
        that.getRootChildren = function () {
            return rootNode.getChildrenMugTypes();
        };

        /**
         * Method for testing use only.  You should never need this information beyond unit tests!
         *
         * Gets the ID used to identify a node (used during Tree prettyPrinting)
         */
        that._getMugTypeNodeID = function (MugType) {
            if (!MugType) {
                return null;
            }
            return this.getNodeFromMugType(MugType).getID();
        };

        /**
         * Method for testing use only.  You should never need this information beyond unit tests!
         *
         * Gets the ID string used to identify the rootNode in the tree. (used during Tree prettyPrinting)
         */
        that._getRootNodeID = function () {
            return rootNode.getID();
        };

        return that;
    };
    that.Tree = Tree;

    var Form = function () {
        var that = {}, dataTree, controlTree;

        var init = (function () {
            that.dataTree = dataTree = new Tree('data');
            that.controlTree = controlTree = new Tree('control');
        })();

        //make the object event aware
        formdesigner.util.eventuality(that);
        return that;
    };
    that.Form = Form;


    /**
     * An initialization function that sets up a number of different fields and properties
     */
    var init = function () {
        var form = that.form = new Form();
        //set the form object in the controller so it has access to it as well
        formdesigner.controller.setForm(form);
    };
    that.init = init;


    return that;
}();


