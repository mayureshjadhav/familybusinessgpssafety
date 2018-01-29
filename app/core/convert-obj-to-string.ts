export function ConvertObjtoString(obj) {
    let result: string = "";
    try {
        if (typeof obj == 'object') {
            let i: number = 1;
            for (var index in obj) {
                if (obj.hasOwnProperty(index)) {
                    var attr = obj[index];
                    if (Object.prototype.toString.call(obj[index]) === '[object Array]') {
                        result = result + "\n" + i + ". " + obj[index].join(',');
                    }
                    else {
                        result = result + "\n" + i + ". " + obj[index];
                    }
                    i = i + 1;
                }
            }
            return result;

        }
        else {
            return "Passed parameter is not object";
        }
    } catch (e) {
        return "Error while converting the object to string.";
    }
}