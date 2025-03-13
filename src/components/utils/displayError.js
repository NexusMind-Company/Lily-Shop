const displayError = (arr, key) => {
    let errMsg;
    if (arr.length > 0) {
        arr.forEach((a) => {
            if (key in a) {
                errMsg = a[key]
            }
        })
    }

    if (errMsg !== undefined) {
        return errMsg
    }

    return ''
}

export default displayError