const LEN = 32
const OVERDUE_TIME = 2 * 3600 * 1000
const CODE = '#'

const RandomWord = (randomFlag, min, max) => {
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
}

const SetToken = (uid) => {
    if(!uid) throw '方法 SetToken 错误，请传入uid'
    let overduetime = new Date().getTime() + OVERDUE_TIME
    return RandomWord(false, LEN) + uid + CODE + RandomWord(false, LEN) +  overduetime
}
const GetTokenUid = (token) => {
    if(!token) return false
    let arr = token.split(CODE)
    if(arr.length !== 2) return false
    return {
        uid: arr[0].substr(LEN),
        overduetime: arr[1].substr(LEN),
    }
}

module.exports = {
    RandomWord,
    SetToken,
    GetTokenUid,
}