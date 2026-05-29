export function isLoggedInManager() {
    return localStorage.getItem("access_token")!==null && localStorage.getItem("access_token")!=="undefined";
  }

export function getCustomerSessionToken() {
  const token = sessionStorage.getItem("customer_access_token");
  if (!token || token === "undefined" || token === "null") {
    return null;
  }
  return token;
}

export function isLoggedInCustomer() {
  return getCustomerSessionToken() !== null;
}
  
  export function deleteTokens(){
      localStorage.removeItem("access_token");
      localStorage.removeItem("email");
  }

  export function deleteTokensCustomer(){
    sessionStorage.removeItem("customer_access_token");
    sessionStorage.removeItem("customer_email");
    sessionStorage.removeItem("customer_table");
 }

  export function requiredAuth(nextState, replace) {
    if (!isLoggedInManager()) {
      replace({
        pathname: '/',
        state: { nextPathname: nextState.location.pathname }
      })
    }
  }

  export function requiredAuthCustomer(nextState, replace) {
    if (!isLoggedInCustomer()) {
      replace({
        pathname: '/table',
        state: { nextPathname: nextState.location.pathname }
      })
    }
  }

