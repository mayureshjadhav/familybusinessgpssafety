
export class ValidationService {
    // Regular expression for 0-100 % ^(100([\.][0]{1,})?$|[0-9]{1,2}([\.][0-9]{1,})?)$
    static getValidatorErrorMessage(validatorName: string, controlName: string, validatorValue?: any) {
        let config = {
            'required': `${controlName} is Required`,
            'invalidAlphabets': 'Please enter only alphabets',
            'invalidAlphabetsWithSpace': 'Please enter only alphabets with space',
            'alphabetsWithNumber': 'Please enter only alphabets and number',
            'alphabetsWithSpecial': 'Please use alphabets and number with , . and / ',
            'number': 'Please enter only number',
            'numberLessthan10000': 'Radius should be between 1 - 10000 m',
            'date': 'Please enter valid date',
            'invalidCreditCard': 'Is invalid credit card number',
            'invalidEmailAddress': 'Invalid email address',
            'matchPassword': 'Confirm Password not matched with Password',
            'invalidPassword': 'Invalid password. Password must be at least 6 characters long, and contain a number.',
            'minlength': `Minimum length ${validatorValue.requiredLength}`,
            'maxLength': `Maximum length ${validatorValue.requiredLength}`,
            'phoneNumber': 'Please enter valid phone number',
            'latitude': 'Invalid latitude co-ordinates',
            'longitude': 'Invalid longitude co-ordinates',
            'longitudeLongitude': "Please enter valid latitude and longitude"
        };

        return config[validatorName];
    }

    static creditCardValidator(control) {
        if (control.value != "") {
            // Visa, MasterCard, American Express, Diners Club, Discover, JCB
            if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
                return null;
            } else {
                return { 'invalidCreditCard': true };
            }
        } else {
            return null;
        }
    }

    static emailValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
                return null;
            } else {
                return { 'invalidEmailAddress': true };
            }
        } else {
            return null;
        }
    }

    static alphabetsValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            if (control.value.match(/^[a-zA-Z]+$/)) {
                return null;
            } else {
                return { 'invalidAlphabets': true };
            }
        } else {
            return null;
        }
    }

    static alphabetsWithSpaceValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            if (control.value.match(/^[a-zA-Z ]+$/)) {
                return null;
            } else {
                return { 'invalidAlphabetsWithSpace': true };
            }
        } else {
            return null;
        }
    }

    static alphabetsWithNumberValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            if (control.value.match(/^[a-zA-Z0-9 ]+$/)) {
                return null;
            } else {
                return { 'alphabetsWithNumber': true };
            }
        } else {
            return null;
        }
    }

    static alphabetsWithSpecialValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            if (control.value.match(/^[a-zA-Z0-9 ,.'/]+$/)) {
                return null;
            } else {
                return { 'alphabetsWithSpecial': true };
            }
        } else {
            return null;
        }
    }

    static numberValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            if (control.value.match(/^[0-9]+$/)) {
                return null;
            } else {
                return { 'number': true };
            }
        } else {
            return null;
        }
    }

    static numberLessthan10000Validator(control) {
        if (control.value != "") {
            if (control.value.match(/^([1-9][0-9]{0,3}|10000)$/)) {
                return null;
            } else {
                return { 'numberLessthan10000': true };
            }          
        } else {
            return null;
        }
    }

    static dateValidator(control) {
        if (control.value != "") {
            // DD/MM/YYYY validation
            let RegEx = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

            // MM/DD/YYY validation
            //let RegEx = /^(((0[13578]|1[02])(\/|-|\.)(0[1-9]|[12]\d|3[01])(\/|-|\.)((19|[2-9]\d)\d{2}))|((0[13456789]|1[012])(\/|-|\.)(0[1-9]|[12]\d|30)(\/|-|\.)((19|[2-9]\d)\d{2}))|(02(\/|-|\.)(0[1-9]|1\d|2[0-8])(\/|-|\.)((19|[2-9]\d)\d{2}))|(02(\/|-|\.)29(\/|-|\.)((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;

            // YYYY/MM/DD validation
            //let RegEx = /^(((19|20)([2468][048]|[13579][26]|0[48])|2000)(\/|-|\.)02(\/|-|\.)29|((19|20)[0-9]{2}(\/|-|\.)(0[469]|11)(\/|-|\.)(0[1-9]|[12][0-9]|30)|(19|20)[0-9]{2}(\/|-|\.)(0[13578]|1[02])(\/|-|\.)(0[1-9]|[12][0-9]|3[01])|(19|20)[0-9]{2}(\/|-|\.)02(\/|-|\.)(0[1-9]|1[0-9]|2[0-8])))$/;

            // RFC 2822 compliant regex
            if (control.value.match(RegEx)) {
                return null;
            } else {
                return { 'date': true };
            }
        } else {
            return null;
        }


    }

    static passwordValidator(control) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
            return null;
        } else {
            return { 'invalidPassword': true };
        }
    }

    static matchPassword(control) {
        let password = control.get('Password').value; // to get value in input tag
        let confirmPassword = control.get('ConfirmPassword').value; // to get value in input tag

        //console.log('false');
        if (password != confirmPassword) {
            control.get('ConfirmPassword').setErrors({ 'matchPassword': true })
        } else {
            return null
        }
    }

    static phoneNumberValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            // if (control.value.match(/^(?:(?:\+?[1-9]{1,2}\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/)) {
            //     return null;
            // } else {
            //     return { 'phoneNumber': true };
            // }
            if (control.value.match(/^\+(?:[0-9] ?){6,14}[0-9]/)) {
                return null;
            } else {
                return { 'phoneNumber': true };
            }
        } else {
            return null;
        }

    }

    static latitudeValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            if (control.value.match(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/)) {
                return null;
            } else {
                return { 'latitude': true };
            }
        } else {
            return null;
        }

    }

    static longitudeValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            if (control.value.match(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/)) {
                return null;
            } else {
                return { 'longitude': true };
            }
        } else {
            return null;
        }

    }

    static longitudeLongitudeValidator(control) {
        if (control.value != "") {
            // RFC 2822 compliant regex
            // Example 20.0028166, 73.77045629999999
            if (control.value.match(/^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/)) {
                return null;
            } else {
                return { 'longitudeLongitude': true };
            }
        } else {
            return null;
        }

    }
}
