import React, { Component } from 'react';
import {BrowserRouter , Route , Switch, Redirect} from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { PrivateRouteCustomer } from './components/PrivateRouteCustomer';
import Registerform  from './components/Registerform';
import Loginform from './components/Loginform';
import Main from './components/Main';
import Menumanagement from './components/Menumanagement';
import Additem from './components/Additem';
import Payments from './components/Payments';
import Updateitem from './components/Updateitem';
import Customerform from './components/Customer_details';
import {isLoggedInManager} from './components/auth';
import TableSelect from './components/TableSelect';
import Customermenu from './components/Customermenu';
import Checkout from './components/Checkout';
import Pay from './components/Pay';
import Home from './components/Home';

class App extends Component {
  
  render() {
    return (
          <BrowserRouter>
           <Switch>
             <Route exact path="/" component={Home} />
             <Route exact path="/register" component={Registerform} />
             <Route exact path="/login" component={Loginform} />
             <PrivateRoute exact isloggedin={isLoggedInManager()} path="/main" component={Main} />
             <PrivateRoute exact path="/menu" component={Menumanagement} />
             <PrivateRoute exact path="/add" component={Additem} />
             <PrivateRoute exact path="/payments" component={Payments} />
             <PrivateRoute exact path="/update" component={Updateitem} />
             <Route exact path="/table" component={TableSelect} />
             <Route exact path="/customer" component={Customerform} />
             <Route exact path="/scan" render={() => <Redirect to="/table" />} />
             <PrivateRouteCustomer exact path="/place_order" component={Customermenu} />
             <PrivateRouteCustomer exact path="/pay" component={Pay} />
             <PrivateRouteCustomer exact path="/checkout" component={Checkout} />
           </Switch>
          </BrowserRouter>
    );
  }
}

export default App;
