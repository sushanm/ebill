import App from "./App";
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Home = () => {
  const [changeTab, SetChangerTab] = useState(1);
  const location = useLocation();
  useEffect(() => {
    if (location.state) {
      SetChangerTab(0)
    }

  }, [location.state])

  return <App changeTab={changeTab} />;
};

export default Home;