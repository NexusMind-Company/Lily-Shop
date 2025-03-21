import { useState } from 'react';
import axios from 'axios';

// const stimulateError = [
//     { username: 'username already taken' },
//     { phone_number: 'invalid phone number' },
//     { others: 'Network err!! Try again sometimes' },
//     { aaaaothers: 'Network err!! Try again sometimes' }
// ]

const useAuth = () => {
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    const authentication = async (url, credentials) => {
        setError([])
        setLoading(true)

        try {
            const response = await axios.post(url, credentials);
            setData(response.data);
        } catch (err) {
            if (err.status == 400 || err.status == 401) {
                setError((prevState) => [...prevState, err.response.data]);
            } else {
                setError([{ others: err.message }])
                console.log(err)
                // console.log(err)
            }
        } finally {
            setLoading(false)
        }
    }

    const login = async (url, credentials) => {
        return await authentication(url, credentials)
    }

    const signup = async (url, credentials) => {
        return await authentication(url, credentials)
    }

    return { login, signup, loading, error, data }

}

export default useAuth;