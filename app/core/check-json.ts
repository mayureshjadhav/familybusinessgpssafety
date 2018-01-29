export function isJson(obj) {
    try {
        if(typeof obj == 'object')
        {
            return true;
        }
        else
        {
            return false;
        }       
    } catch (e) {
        return false;
    }    
}