const stateError = (error: any): { error: string } => {
    const { response = {} } = error
    const { status, data } = response

    if (!status) return { error: 'Connection Error' }

    if (status === 401) {
        localStorage.removeItem('dt-token')
    }

    if (Object.prototype.toString.call(data) === '[object Object]') {
        const { errors, message } = data
        return checkError(status, errors, message)
    } else {
        const { message } = error
        return checkError(null, null, message)
    }
}

const checkError = (status: any, error: any, message: any): { error: string } => {
    if (!message || message === '') message = 'An error occurred due to technical reasons'

    if (Object.prototype.toString.call(error) === '[object Object]') {
        const keys = Object.keys(error)
        let errorContent = ''
        for (let i = 0; i < keys.length; i++) {
            errorContent += error[keys[i]] + '\n'
        }
        if (errorContent) return { error: errorContent }
    }

    if (typeof message === 'string') return { error: message }
    if (typeof error === 'string')   return { error }
    if (status === 500)              return { error: 'Server Error. Error Code: 500' }

    return { error: 'An error occurred due to technical reasons' }
}

export { stateError, checkError }