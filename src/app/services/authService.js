import axios from "axios";

const API_URL = "http://localhost:3001";

export const login  = async (email,password) => 
  {
    try 
    {
      const response = await axios.post(`${API_URL}/auth/login` ,{email,password});
     const {accessToken} = response.data;
      localStorage.setItem('accessToken',accessToken);
      return {success : true ,token: accessToken};
} 
catch(error)
{
  if(error.response)
    {
      const {data,status} = error.response;
      return {success:false ,message:data.message || 'an error occured' , status};

    }
    else 
    {
      return { success: false, message: 'Network error', status: 0 };
    }
}
  };

  export const register = async (name,email,password ) =>
  {
    try 
    {
      const response = await axios.post(`${API_URL}/auth/register`,
        {
          name,email,password
        });
        const {accessToken} = response.data;
        return {success : true , token : accessToken};
    }
    catch(error)
    {
      if(error.response)
        {
          const {data,status} = error.response;
      return {success:false, message:data.message || 'an error occured',status};
        }
        else
        {
          return { success: false , message : error.message, status:0 };
        }
    }
  };