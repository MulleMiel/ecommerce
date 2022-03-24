import createError from 'http-errors';
import validator from 'validator';

const validateRegistration = (creds) => {
  const { email, password, firstname, lastname } = creds;
  if (!validator.isEmail(email)) {
    if (validator.isEmpty(email)) throw createError(401, "E-mail field is empty");
    throw createError(401, "Invalid e-mail");
  }

  if (!validator.isLength(password, { min: 6 })) {
    if (validator.isEmpty(password)) throw createError(401, "Password field is empty");
    throw createError(401, "Password must have a minimum length of 6");
  }
  return {
    email: email?.trim(),
    password: password?.trim(),
    firstname: firstname?.trim(),
    lastname: lastname?.trim()
  }
}

export const localAuth =  {
  signin: async (creds, callback) => {
    try {
      creds = validateRegistration(creds);

      const res = await fetch(`/auth/login`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      });
      if(res.ok){
        const user = await res.json();
        return callback(null, user);
      }

      if(res.status === 401) {
        return callback("Incorrect username or password", null);
      }

      callback("Incorrect username or password", null);
    } catch (error) {
      callback(error.message, null);
    }
  },
  register: async (creds, callback) => {
    try {
      creds = validateRegistration(creds);

      const res = await fetch(`/auth/register`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      });
      if(res.ok){
        return callback(null, true);
      }

      if(res.status === 409){
        return callback("Already exists", null);
      }

      callback("Something went wrong.", null);
    } catch (error) {
      callback(error.message, null);
    }
  },
  signout: async (callback) => {
    try{
      await fetch(`/auth/logout`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      callback();
    } catch (error) {
      callback();
    }
  },
  check: async (callback) => {
    try{
      const res = await fetch(`/auth/current-session`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(res.ok){
        const user = await res.json();
        return callback(user);
      }
      callback(null);
    } catch (error) {
      callback(null);
    }
  }
}


export const googleAuth =  {
  signin: async (callback) => {
    try {
      const res = await fetch(`/auth/google`);
      if(res.ok){
        const user = await res.json();
        return callback(null, user);
      }

      callback("Google login failed.", null);
    } catch (error) {
      callback("Google login failed.", null);
    }
  }
}